import { supabase } from '@/lib/supabase';
import { generateShortId } from '@/lib/utils';
import config from '@/config';

export const fetchLinkToEdit = async (editLinkId, userId) => {
  const { data, error } = await supabase
    .from('video_links')
    .select('*, video_link_permissions(user_email)')
    .eq('id', editLinkId)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error("Error fetching link for editing:", error.message);
    return { data: null, error };
  }
  return { data, error: null };
};

const saveLinkPermissions = async (linkId, newAllowedEmails, toast) => {
  const { data: existingPermissions, error: fetchError } = await supabase
    .from('video_link_permissions')
    .select('user_email')
    .eq('link_id', linkId);

  if (fetchError) {
    toast({ title: "Permissions Error", description: "Could not fetch existing permissions.", variant: "destructive" });
    return;
  }
  
  const existingEmails = existingPermissions.map(p => p.user_email);
  const emailsToAdd = newAllowedEmails.filter(email => !existingEmails.includes(email));
  const emailsToRemove = existingEmails.filter(email => !newAllowedEmails.includes(email));

  if (emailsToAdd.length > 0) {
    const toInsert = emailsToAdd.map(email => ({ link_id: linkId, user_email: email, permission_type: 'view' }));
    const { error: insertError } = await supabase.from('video_link_permissions').insert(toInsert);
    if (insertError) toast({ title: "Permissions Error", description: "Could not add new permissions.", variant: "destructive" });
  }

  if (emailsToRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from('video_link_permissions')
      .delete()
      .eq('link_id', linkId)
      .in('user_email', emailsToRemove);
    if (deleteError) toast({ title: "Permissions Error", description: "Could not remove old permissions.", variant: "destructive" });
  }
};

const createNewLink = async (linkPayload, allowedEmails, toast) => {
  const previewDomain = window.location.origin;
  const shortId = generateShortId();
  linkPayload.url = `${previewDomain}/v/${shortId}`;

  const { data, error } = await supabase.from('video_links').insert(linkPayload).select('*, video_link_permissions(user_email)').single();

  if (error) {
    toast({ title: "Link Generation Failed", description: error.message, variant: "destructive" });
    return { data: null, error };
  }
  
  if (allowedEmails.length > 0) {
    await saveLinkPermissions(data.id, allowedEmails, toast);
  }
  toast({ title: "Link Generated!", description: "Your secure video link is ready.", variant: "default" });
  return { data, error: null };
};

const updateExistingLink = async (editLinkId, linkPayload, allowedEmails, toast) => {
  const { data, error } = await supabase
    .from('video_links')
    .update(linkPayload)
    .eq('id', editLinkId)
    .select('*, video_link_permissions(user_email)')
    .single();
  
  if (error) {
    toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    return { data: null, error };
  }
  
  await saveLinkPermissions(data.id, allowedEmails, toast);
  toast({ title: "Link Updated!", description: "Your video link has been successfully updated.", variant: "default" });
  return { data, error: null };
};


export const processSaveLink = async ({
  user,
  linkSettings,
  isEditing,
  editLinkId,
  editingLinkOriginalSource,
  providedSource,
  sourceType,
  triggerAuthModal,
  triggerPremiumModal,
  toast
}) => {
  if (!user) {
    triggerAuthModal();
    return { data: null, error: { message: "User not authenticated" } };
  }

  let finalLinkPayload = {
    user_id: user.id,
    custom_name: linkSettings.customName || `Video from ${new Date().toLocaleDateString()}`,
    description: linkSettings.description,
    password: linkSettings.password ? linkSettings.password : null,
    expiry_date: linkSettings.expiryDate || null,
    is_encrypted: linkSettings.isEncrypted,
  };

  if (linkSettings.password && !user.is_premium) {
    triggerPremiumModal("Password Protection");
    return { data: null, error: { message: "Password protection is a premium feature." } };
  }
  if (linkSettings.isEncrypted && !user.is_premium) {
    triggerPremiumModal("File Encryption");
    return { data: null, error: { message: "File encryption is a premium feature." } };
  }
  if (linkSettings.allowedEmails.length > 0 && !user.is_premium) {
    triggerPremiumModal("Advanced Access Control");
    return { data: null, error: { message: "Advanced access control is a premium feature." } };
  }

  if (isEditing && editLinkId) {
    if (sourceType === 'upload') {
      finalLinkPayload.source = providedSource;
    } else if (sourceType === 'url') {
      if (providedSource && providedSource.trim() !== '' && providedSource !== editingLinkOriginalSource) {
        finalLinkPayload.source = providedSource;
      } else {
        finalLinkPayload.source = editingLinkOriginalSource; 
      }
    } else {
       finalLinkPayload.source = editingLinkOriginalSource;
    }
    return await updateExistingLink(editLinkId, finalLinkPayload, linkSettings.allowedEmails, toast);
  } else {
    if (sourceType === 'url' && (!providedSource || providedSource.trim() === '')) {
      toast({ title: "URL Required", description: "Please enter a video URL to generate a link.", variant: "destructive" });
      return { data: null, error: { message: "URL is required for new link from URL source." } };
    }
    if (sourceType === 'upload' && !providedSource) {
        toast({ title: "File Required", description: "Please upload a video file.", variant: "destructive" });
        return { data: null, error: { message: "File is required for new link from upload source." } };
    }
    finalLinkPayload.source = providedSource;
    return await createNewLink(finalLinkPayload, linkSettings.allowedEmails, toast);
  }
};

export const handleFileUploadToSupabase = async ({
  file,
  user,
  onProgress,
  toast,
  triggerPremiumModal
}) => {
  let maxSize = config.uploadLimits.free;
  let tierSpecificLimitText = `${(maxSize / (1024*1024)).toFixed(0)}MB`;

  if (user.is_premium && user.premium_tier) {
    maxSize = config.uploadLimits[user.premium_tier] || config.uploadLimits.legacy_premium;
    if (maxSize >= 1024 * 1024 * 1024 * 1024) { // TB
        tierSpecificLimitText = `${(maxSize / (1024*1024*1024*1024)).toFixed(0)}TB`;
    } else { // GB
        tierSpecificLimitText = `${(maxSize / (1024*1024*1024)).toFixed(0)}GB`;
    }
  }


  if (file.size > maxSize) {
    if (!user.is_premium) {
      triggerPremiumModal(`File Upload Limit (Free: ${tierSpecificLimitText})`);
    } else {
      toast({ title: "File Too Large", description: `Your current plan limit is ${tierSpecificLimitText}.`, variant: "destructive" });
    }
    return { publicUrl: null, error: { message: "File too large" } };
  }

  const fileName = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      onUploadProgress: (progressEvent) => {
        const percentUploaded = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        onProgress(percentUploaded);
      }
    });

  if (uploadError) {
    toast({ title: "Upload Failed", description: uploadError.message, variant: "destructive" });
    onProgress(0);
    return { publicUrl: null, error: uploadError };
  }

  const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(fileName);
  if (!publicUrlData || !publicUrlData.publicUrl) {
    toast({ title: "Error", description: "Could not get public URL for the uploaded file.", variant: "destructive" });
    return { publicUrl: null, error: { message: "Error getting public URL" } };
  }
  
  return { publicUrl: publicUrlData.publicUrl, error: null };
};