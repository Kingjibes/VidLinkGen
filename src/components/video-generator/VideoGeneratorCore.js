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
  linkPayload.short_url_id = shortId; 

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
  if (!linkPayload.short_url_id) {
    const { data: existingLink } = await supabase.from('video_links').select('short_url_id, url').eq('id', editLinkId).single();
    if (existingLink && existingLink.short_url_id) {
      linkPayload.short_url_id = existingLink.short_url_id;
      linkPayload.url = existingLink.url; 
    } else if (!linkPayload.url?.includes('/v/')) { 
        const shortId = generateShortId();
        linkPayload.url = `${window.location.origin}/v/${shortId}`;
        linkPayload.short_url_id = shortId;
    } else if (linkPayload.url?.includes('/v/')) {
        linkPayload.short_url_id = linkPayload.url.split('/v/')[1];
    }
  }


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
    if (sourceType === 'upload') { // File was just uploaded, so source is new
      finalLinkPayload.source = providedSource;
    } else if (sourceType === 'url') { // URL potentially changed
      if (providedSource && providedSource.trim() !== '' && providedSource !== editingLinkOriginalSource) {
        finalLinkPayload.source = providedSource;
      } else {
        finalLinkPayload.source = editingLinkOriginalSource; 
      }
    } else { // No new source, keep original (this case might be redundant if sourceType always upload/url)
       finalLinkPayload.source = editingLinkOriginalSource;
    }
    
    const { data: currentLink } = await supabase.from('video_links').select('url, short_url_id').eq('id', editLinkId).single();
    if (currentLink) {
        finalLinkPayload.url = currentLink.url;
        finalLinkPayload.short_url_id = currentLink.short_url_id;
    }

    return await updateExistingLink(editLinkId, finalLinkPayload, linkSettings.allowedEmails, toast);
  } else { // Creating new link
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
  let maxSize;
  let tierSpecificLimitText;

  if (user.is_premium && user.premium_tier && config.uploadLimits[user.premium_tier]) {
    maxSize = config.uploadLimits[user.premium_tier];
  } else if (user.is_premium) { // Legacy premium user
    maxSize = config.uploadLimits.legacy_premium; 
  } else { // Free user
    maxSize = config.uploadLimits.free;
  }

  // Format maxSize into TB/GB/MB text for display
  if (maxSize >= 1024 * 1024 * 1024 * 1024) { // TB
      tierSpecificLimitText = `${(maxSize / (1024*1024*1024*1024)).toFixed(0)}TB`;
  } else if (maxSize >= 1024 * 1024 * 1024) { // GB
      tierSpecificLimitText = `${(maxSize / (1024*1024*1024)).toFixed(0)}GB`;
  } else { // MB
      tierSpecificLimitText = `${(maxSize / (1024*1024)).toFixed(0)}MB`;
  }


  if (file.size > maxSize) {
    if (!user.is_premium) {
      triggerPremiumModal(`File Upload Limit (Free: ${(config.uploadLimits.free / (1024*1024)).toFixed(0)}MB)`);
    } else {
      toast({ title: "File Too Large", description: `Your current plan limit is ${tierSpecificLimitText}. This file exceeds that.`, variant: "destructive" });
    }
    onProgress(0);
    return { publicUrl: null, error: { message: "File too large" } };
  }

  const fileName = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
            const percentUploaded = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress(percentUploaded);
        }
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
    onProgress(0);
    return { publicUrl: null, error: { message: "Error getting public URL" } };
  }
  
  onProgress(100); // Ensure progress hits 100 on success
  return { publicUrl: publicUrlData.publicUrl, error: null };
};
