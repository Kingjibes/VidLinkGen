import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Upload, Link as LinkIcon, Crown, Shield } from 'lucide-react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

import FileUploadTab from '@/components/video-generator/FileUploadTab';
import UrlTab from '@/components/video-generator/UrlTab';
import LinkSettingsForm from '@/components/video-generator/LinkSettingsForm';
import GeneratedLinkDisplay from '@/components/video-generator/GeneratedLinkDisplay';
import { fetchLinkToEdit, processSaveLink, handleFileUploadToSupabase } from '@/components/video-generator/VideoGeneratorCore';
import config from '@/config';

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
  const [currentFile, setCurrentFile] = useState(null);


  useEffect(() => {
    const loadEditData = async () => {
      if (editLinkId && user) {
        setIsEditing(true);
        setGeneratedLink(''); 
        setGeneratedLinkData(null);
        const { data, error } = await fetchLinkToEdit(editLinkId, user.id);
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
          toast({ title: "Error", description: error?.message || "Could not fetch link for editing.", variant: "destructive" });
          setIsEditing(false); 
        }
      } else {
        setIsEditing(false);
        setEditingLinkOriginalSource(null);
        setInitialUrlForEdit('');
        setLinkSettings({ customName: '', password: '', expiryDate: '', description: '', allowedEmails: [], isEncrypted: false });
        setGeneratedLink('');
        setGeneratedLinkData(null);
        setCurrentFile(null);
      }
    };
    loadEditData();
  }, [editLinkId, user, toast]);

  const resetFormState = () => {
    setLinkSettings({ customName: '', password: '', expiryDate: '', description: '', allowedEmails: [], isEncrypted: false });
    setCurrentEmailInput('');
    setInitialUrlForEdit('');
    // Do not reset generatedLink and generatedLinkData here, they should persist until a new link is made or edit starts
    setCurrentFile(null);
    setUploadProgress(0);
    if (activeTab === 'url' && document.getElementById('video-url')) {
      document.getElementById('video-url').value = '';
    }
     if (document.getElementById('video-upload-input')) {
      document.getElementById('video-upload-input').value = null;
    }
  };

  const handleFileSelected = (event) => {
    if (!user) {
      triggerAuthModal();
      return;
    }
    const file = event.target.files[0];
    if (!file) return;
    setCurrentFile(file);
    setGeneratedLink(''); 
    setGeneratedLinkData(null);

    if (!isEditing) {
      // For new links, we might pre-upload or just hold the file.
      // Current logic uploads on save, which is fine.
    }
  };
  
  const handleActualFileUpload = async (fileToUpload) => {
    if (!user) { triggerAuthModal(); return null; }
    setIsUploading(true);
    setUploadProgress(0);

    let currentUploadLimit = config.uploadLimits.free;
    if (user.is_premium && user.premium_tier) {
        currentUploadLimit = config.uploadLimits[user.premium_tier] || config.uploadLimits.legacy_premium;
    } else if (user.is_premium) { // Legacy premium users without a tier
        currentUploadLimit = config.uploadLimits.legacy_premium;
    }


    const result = await handleFileUploadToSupabase({
      file: fileToUpload,
      user,
      maxSize: currentUploadLimit,
      onProgress: setUploadProgress,
      toast,
      triggerPremiumModal
    });
    
    setIsUploading(false);
    return result.publicUrl;
  };


  const handleSave = async () => {
    if (!user) {
      triggerAuthModal();
      return;
    }
    
    setGeneratedLink(''); 
    setGeneratedLinkData(null);

    let sourceToSave = null;
    let currentSourceType = activeTab;

    if (isEditing) {
        currentSourceType = initialUrlForEdit ? 'url' : (editingLinkOriginalSource && !editingLinkOriginalSource.startsWith('http') ? 'upload' : 'url');
         if (activeTab === 'upload' && currentFile) {
            sourceToSave = await handleActualFileUpload(currentFile);
            if (!sourceToSave) return; 
            currentSourceType = 'upload';
        } else if (activeTab === 'url') {
            sourceToSave = document.getElementById('video-url')?.value || initialUrlForEdit;
            currentSourceType = 'url';
        } else {
            sourceToSave = editingLinkOriginalSource;
        }
    } else { 
        if (activeTab === 'upload') {
            if (!currentFile) {
                toast({ title: "No File", description: "Please select a file to upload.", variant: "destructive" });
                return;
            }
            sourceToSave = await handleActualFileUpload(currentFile);
            if (!sourceToSave) return; 
            currentSourceType = 'upload';
        } else if (activeTab === 'url') {
            sourceToSave = document.getElementById('video-url')?.value;
            if (!sourceToSave) {
                toast({ title: "No URL", description: "Please enter a video URL.", variant: "destructive" });
                return;
            }
            currentSourceType = 'url';
        }
    }


    const { data: savedLinkData, error } = await processSaveLink({
      user,
      linkSettings,
      isEditing,
      editLinkId,
      editingLinkOriginalSource,
      providedSource: sourceToSave,
      sourceType: currentSourceType,
      triggerAuthModal,
      triggerPremiumModal,
      toast
    });

    if (savedLinkData) {
      setGeneratedLink(savedLinkData.url);
      const permissions = linkSettings.allowedEmails.map(email => ({user_email: email}));
      setGeneratedLinkData({...savedLinkData, video_link_permissions: permissions });
      if (isEditing) {
        setIsEditing(false); 
        // Potentially navigate to dashboard or clear editLinkId from App.jsx state
      } else {
        resetFormState(); 
      }
    } else {
      setGeneratedLink('');
      setGeneratedLinkData(null);
    }
    setUploadProgress(0);
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

  return (
    <TooltipProvider>
      <section id="video-generator-section" className="py-12 md:py-20 bg-space-pattern">
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
                <Tabs value={activeTab} onValueChange={(newTab) => {
                  setActiveTab(newTab);
                  if (!isEditing) { // Only clear generated link if not editing and tab changes
                    setGeneratedLink('');
                    setGeneratedLinkData(null);
                  }
                }} className="w-full">
                  {!isEditing && (
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
                  )}

                  <TabsContent value="upload" className={activeTab === 'upload' ? '' : 'hidden'}>
                    <FileUploadTab 
                      user={user}
                      isUploading={isUploading}
                      uploadProgress={uploadProgress}
                      handleFileUpload={handleFileSelected}
                      triggerAuthModal={triggerAuthModal}
                      triggerPremiumModal={triggerPremiumModal}
                      currentFile={currentFile}
                    />
                  </TabsContent>

                  <TabsContent value="url" className={activeTab === 'url' ? '' : 'hidden'}>
                    <UrlTab 
                      user={user}
                      initialUrl={initialUrlForEdit}
                      triggerAuthModal={triggerAuthModal}
                    />
                  </TabsContent>
                </Tabs>
                
                <LinkSettingsForm 
                  user={user}
                  linkSettings={linkSettings}
                  setLinkSettings={setLinkSettings}
                  currentEmailInput={currentEmailInput}
                  setCurrentEmailInput={setCurrentEmailInput}
                  isEditing={isEditing}
                  onSave={handleSave} 
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