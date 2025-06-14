import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { generateShortId } from '@/lib/utils';
import { Upload, Link as LinkIcon, Crown, Shield } from 'lucide-react';
import { TooltipProvider } from "@/components/ui/tooltip";

import FileUploadTab from '@/components/video-generator/FileUploadTab';
import UrlTab from '@/components/video-generator/UrlTab';
import LinkSettingsForm from '@/components/video-generator/LinkSettingsForm';
import GeneratedLinkDisplay from '@/components/video-generator/GeneratedLinkDisplay';
import { useToast } from "@/components/ui/use-toast";


const VideoGenerator = ({ user, editLinkId, triggerAuthModal, triggerPremiumModal }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLinkOriginalSource, setEditingLinkOriginalSource] = useState(null);
  const [initialUrlForEdit, setInitialUrlForEdit] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedLinkData, setGeneratedLinkData] = useState(null);
  const qrRef = useRef();
  const { toast } = useToast();

  const [linkSettings, setLinkSettings] = useState({
    customName: '',
    password: '',
    expiryDate: '',
    description: '',
    allowedEmails: [], 
    isEncrypted: false,
  });
  const [currentEmailInput, setCurrentEmailInput] = useState('');

  useEffect(() => {
    if (editLinkId && user) {
      setIsEditing(true);
      const fetchLinkToEdit = async () => {
        const { data, error } = await supabase
          .from('video_links')
          .select('*, video_link_permissions(user_email)')
          .eq('id', editLinkId)
          .eq('user_id', user.id)
          .single();

        if (data) {
          setLinkSettings({
            customName: data.custom_name || '',
            password: data.password || '',
            expiryDate: data.expiry_date || '',
            description: data.description || '',
            allowedEmails: data.video_link_permissions?.map(p => p.user_email) || [],
            isEncrypted: data.is_encrypted || false,
          });
          setEditingLinkOriginalSource(data.source);
          
          if (data.source && (data.source.includes('youtube.com') || data.source.includes('vimeo.com') || data.source.startsWith('http'))) {
            setActiveTab('url');
            setInitialUrlForEdit(data.source);
          } else {
            setActiveTab('upload');
            setInitialUrlForEdit(''); 
          }
        } else {
          toast({ title: "Error", description: "Could not fetch link for editing.", variant: "destructive" });
          setIsEditing(false); 
        }
      };
      fetchLinkToEdit();
    } else {
      setIsEditing(false);
      setEditingLinkOriginalSource(null);
      setInitialUrlForEdit('');
      setLinkSettings({ customName: '', password: '', expiryDate: '', description: '', allowedEmails: [], isEncrypted: false });
      setGeneratedLink('');
      setGeneratedLinkData(null);
    }
  }, [editLinkId, user, toast]);


  const handleFileUpload = async (event) => {
    if (!user) {
      triggerAuthModal();
      return;
    }
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = user?.is_premium ? 2 * 1024 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024; 
    
    if (file.size > maxSize) {
      if(!user?.is_premium) {
        triggerPremiumModal("2TB Upload Limit");
      } else {
        toast({ title: "File Too Large", description: `Maximum file size is ${user?.is_premium ? '2TB' : '2GB'}.`, variant: "destructive" });
      }
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const fileName = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progressEvent) => {
          const percentUploaded = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploadProgress(percentUploaded);
        }
      });

    setIsUploading(false);
    if (uploadError) {
      toast({ title: "Upload Failed", description: uploadError.message, variant: "destructive" });
      setUploadProgress(0);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(fileName);
    if (!publicUrlData || !publicUrlData.publicUrl) {
        toast({ title: "Error", description: "Could not get public URL for the uploaded file.", variant: "destructive" });
        return;
    }
    saveLink(publicUrlData.publicUrl, 'upload');
  };

  const handleUrlSubmit = () => {
    if (!user) {
      triggerAuthModal();
      return;
    }
    const urlInput = document.getElementById('video-url')?.value;
    if (!urlInput && !isEditing) { 
      toast({ title: "URL Required", description: "Please enter a video URL.", variant: "destructive" });
      return;
    }
    saveLink(urlInput, 'url'); 
  };

  const saveLinkPermissions = async (linkId, newAllowedEmails) => {
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

  const handleAttemptPremiumFeature = (featureName, actionCallback) => {
    if (!user) {
      triggerAuthModal();
      return;
    }
    if (!user.is_premium) {
      triggerPremiumModal(featureName);
      return;
    }
    actionCallback();
  };


  const saveLink = async (providedSource, sourceType) => {
    if (!user) { // Double check user exists before saving
        triggerAuthModal();
        return;
    }

    let linkPayload = {
      user_id: user.id,
      custom_name: linkSettings.customName || `Video from ${new Date().toLocaleDateString()}`,
      description: linkSettings.description,
      password: linkSettings.password ? linkSettings.password : null,
      expiry_date: linkSettings.expiryDate || null,
      is_encrypted: linkSettings.isEncrypted, 
    };

    if (linkSettings.password && !user?.is_premium) {
      triggerPremiumModal("Password Protection");
      return;
    }
    if (linkSettings.isEncrypted && !user?.is_premium) {
      triggerPremiumModal("File Encryption");
      return;
    }
     if (linkSettings.allowedEmails.length > 0 && !user?.is_premium) {
      triggerPremiumModal("Advanced Access Control");
      return;
    }


    if (isEditing && editLinkId) {
      if (sourceType === 'upload') { 
        linkPayload.source = providedSource; 
      } else if (sourceType === 'url') {
        if (providedSource && providedSource.trim() !== '' && providedSource !== editingLinkOriginalSource) {
          linkPayload.source = providedSource;
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
      } else if (data) {
        await saveLinkPermissions(data.id, linkSettings.allowedEmails);
        setGeneratedLink(data.url);
        const updatedPermissions = linkSettings.allowedEmails.map(email => ({user_email: email}));
        setGeneratedLinkData({...data, video_link_permissions: updatedPermissions });
        toast({ title: "Link Updated!", description: "Your video link has been successfully updated.", variant: "default" });
        setIsEditing(false); 
      }

    } else { 
      if (sourceType === 'url' && (!providedSource || providedSource.trim() === '')) {
        toast({ title: "URL Required", description: "Please enter a video URL to generate a link.", variant: "destructive" });
        return;
      }
      linkPayload.source = providedSource;
      const previewDomain = window.location.origin;
      const shortId = generateShortId();
      linkPayload.url = `${previewDomain}/v/${shortId}`;


      const { data, error } = await supabase.from('video_links').insert(linkPayload).select('*, video_link_permissions(user_email)').single();

      if (error) {
        toast({ title: "Link Generation Failed", description: error.message, variant: "destructive" });
      } else if (data) {
        if (linkSettings.allowedEmails.length > 0) {
            await saveLinkPermissions(data.id, linkSettings.allowedEmails);
        }
        setGeneratedLink(data.url);
        const newPermissions = linkSettings.allowedEmails.map(email => ({user_email: email}));
        setGeneratedLinkData({...data, video_link_permissions: newPermissions});
        toast({ title: "Link Generated!", description: "Your secure video link is ready.", variant: "default" });
      }
    }
    
    setUploadProgress(0);
    if (!isEditing) { 
        setLinkSettings({ customName: '', password: '', expiryDate: '', description: '', allowedEmails: [], isEncrypted: false });
        setCurrentEmailInput('');
        setInitialUrlForEdit('');
        if (activeTab === 'url' && document.getElementById('video-url')) {
          document.getElementById('video-url').value = '';
        }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({ title: "Link Copied!", description: "The video link has been copied to your clipboard.", variant: "default" });
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = `${generatedLinkData?.custom_name || 'vidlinkgen-qr'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({ title: "QR Code Downloading", description: "Your QR code has started downloading.", variant: "default" });
    } else {
        toast({ title: "Error", description: "Could not download QR code.", variant: "destructive" });
    }
  };

  const handleSaveAttempt = () => {
     if (!user) {
        triggerAuthModal();
        return;
    }
    const currentSourceType = isEditing ? (initialUrlForEdit ? 'url' : 'upload') : activeTab;
    let sourceValue = null;

    if (currentSourceType === 'url') {
        sourceValue = document.getElementById('video-url')?.value;
        if (isEditing && (!sourceValue || sourceValue.trim() === '')) {
            sourceValue = editingLinkOriginalSource; // Use original if input is cleared during edit
        }
    } else if (currentSourceType === 'upload') {
        // For uploads, source is set after successful upload. This button triggers that process.
        // If isEditing an uploaded file, and a new file is chosen, handleFileUpload will handle it.
        // If isEditing and no new file, we rely on editingLinkOriginalSource.
        if (isEditing) sourceValue = editingLinkOriginalSource;
        // If new upload, the input's onChange (handleFileUpload) triggers saveLink.
        // This button might not be directly saving in 'upload' tab for new links.
        // However, it's here for consistency if settings are filled before choosing file.
    }
    
    if (!sourceValue && !isEditing && currentSourceType === 'upload' ) {
       const fileInput = document.getElementById('video-upload');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            toast({title: "No File Selected", description: "Please choose a video file to upload.", variant: "destructive"});
            return;
        }
    }


    saveLink(sourceValue, currentSourceType);
  };

  return (
    <TooltipProvider>
      <section className="py-12 md:py-20 bg-space-pattern">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-gradient mb-3 md:mb-4">
                {isEditing ? "Edit Secure Video Link" : "Generate Secure Video Links"}
              </h2>
              {!isEditing && <p className="text-lg md:text-xl text-muted-foreground">
                Upload videos or link from YouTube, Vimeo, and more
              </p>}
            </div>

            <Card className="glass-effect border-white/20 cyber-glow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-xl md:text-2xl">
                  <Shield className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                  <span>Video Link {isEditing ? "Editor" : "Generator"}</span>
                  {user?.is_premium && (
                    <Badge className="premium-badge text-xs md:text-sm">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isEditing && (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6">
                      <TabsTrigger value="upload" className="flex items-center space-x-1 md:space-x-2 text-sm md:text-base">
                        <Upload className="h-4 w-4" />
                        <span>Upload Video</span>
                      </TabsTrigger>
                      <TabsTrigger value="url" className="flex items-center space-x-1 md:space-x-2 text-sm md:text-base">
                        <LinkIcon className="h-4 w-4" />
                        <span>Video URL</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload">
                      <FileUploadTab 
                        user={user}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        handleFileUpload={handleFileUpload}
                        triggerAuthModal={triggerAuthModal}
                        triggerPremiumModal={triggerPremiumModal}
                      />
                    </TabsContent>

                    <TabsContent value="url">
                      <UrlTab 
                        user={user}
                        handleUrlSubmit={handleUrlSubmit}
                        initialUrl=""
                        triggerAuthModal={triggerAuthModal}
                      />
                    </TabsContent>
                  </Tabs>
                )}
                
                {isEditing && (
                   activeTab === 'upload' ? (
                    <FileUploadTab 
                        user={user}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        handleFileUpload={handleFileUpload}
                        triggerAuthModal={triggerAuthModal}
                        triggerPremiumModal={triggerPremiumModal}
                    />
                   ) : (
                    <UrlTab 
                        user={user}
                        handleUrlSubmit={handleUrlSubmit}
                        initialUrl={initialUrlForEdit}
                        triggerAuthModal={triggerAuthModal}
                    />
                   )
                )}

                <LinkSettingsForm 
                  user={user}
                  linkSettings={linkSettings}
                  setLinkSettings={setLinkSettings}
                  currentEmailInput={currentEmailInput}
                  setCurrentEmailInput={setCurrentEmailInput}
                  isEditing={isEditing}
                  onSave={handleSaveAttempt} 
                  triggerAuthModal={triggerAuthModal}
                  triggerPremiumModal={triggerPremiumModal}
                  handleAttemptPremiumFeature={handleAttemptPremiumFeature}
                />

                <GeneratedLinkDisplay
                  generatedLink={generatedLink}
                  generatedLinkData={generatedLinkData}
                  copyToClipboard={copyToClipboard}
                  downloadQR={downloadQR}
                  qrRef={qrRef}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </TooltipProvider>
  );
};

export default VideoGenerator;