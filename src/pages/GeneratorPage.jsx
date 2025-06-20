import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Link2 as LinkIconLucide } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import { supabase } from '@/lib/supabaseClient';
import VideoSourceTabs from '@/components/generator/VideoSourceTabs';
import LinkCustomizationForm from '@/components/generator/LinkCustomizationForm';
import GeneratedLinkDisplay from '@/components/generator/GeneratedLinkDisplay';
import QuickStatsDisplay from '@/components/generator/QuickStatsDisplay';

const GeneratorPage = () => {
  const { toast } = useToast();
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    videoUrl: '',
    customName: '',
    description: '',
    expirationDate: '',
    password: '',
  });
  const [activeTab, setActiveTab] = useState('url');
  const [quickStats, setQuickStats] = useState({ totalLinks: 0, totalClicks: 0, totalViews: 0 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user || null);
      }
    );
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchQuickStats = useCallback(async () => {
    try {
      const { data: linksData, error: linksError, count } = await supabase
        .from('video_links')
        .select('clicks, views', { count: 'exact' });

      if (linksError) throw linksError;

      const totalClicks = linksData.reduce((sum, link) => sum + (link.clicks || 0), 0);
      const totalViews = linksData.reduce((sum, link) => sum + (link.views || 0), 0);
      
      setQuickStats({ totalLinks: count || 0, totalClicks, totalViews });

    } catch (error) {
      console.error("Error fetching quick stats:", error);
      toast({ title: "Error", description: "Could not fetch quick stats.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchQuickStats();
  }, [fetchQuickStats]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024 * 1024) { // 10GB limit
        toast({
          title: "File Exceeds Limit",
          description: "Maximum file size is 10GB. Please select a smaller video.",
          variant: "destructive",
        });
        setSelectedFile(null);
        if(fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, videoUrl: '' })); 
    }
  };
  
  const handleTabChange = (value) => {
    setActiveTab(value); 
    setSelectedFile(null); 
    if(fileInputRef.current) fileInputRef.current.value = ''; 
    setUploadProgress(0);
    setFormData(prev => ({ ...prev, videoUrl: '' }));
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    setUploadProgress(0);
  };

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 9);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadProgress(0);

    if (activeTab === 'url' && !formData.videoUrl) {
      toast({ title: "Input Required", description: "Please enter a video URL.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (activeTab === 'upload' && !selectedFile) {
      toast({ title: "Input Required", description: "Please upload a video file.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    const shortCode = formData.customName ? formData.customName.replace(/\s+/g, '-').toLowerCase() : generateShortCode();
    const newLinkPath = `/v/${shortCode}`;
    const newLinkFullUrl = `${window.location.origin}${newLinkPath}`;
    
    let originalSourceUrl = formData.videoUrl;
    let storagePath = null;

    if (activeTab === 'upload' && selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${generateShortCode()}.${fileExt}`;
      const userIdPath = currentUser ? `user_${currentUser.id}` : 'public_uploads';
      const filePath = `${userIdPath}/${fileName}`; 

      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: selectedFile.type,
          });
          
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress += 10;
          if (currentProgress <= 90) {
            setUploadProgress(currentProgress);
          }
        }, 200);


        if (uploadError) {
          clearInterval(progressInterval);
          setUploadProgress(0);
          throw uploadError;
        }
        
        clearInterval(progressInterval);
        setUploadProgress(100);

        const { data: publicUrlData } = supabase.storage
          .from('videos')
          .getPublicUrl(uploadData.path);
        
        originalSourceUrl = publicUrlData.publicUrl;
        storagePath = uploadData.path;

      } catch (error) {
        console.error("Error uploading file to Supabase Storage:", error);
        toast({ title: "Upload Error", description: error.message || "Could not upload video. Check permissions.", variant: "destructive" });
        setIsLoading(false);
        setUploadProgress(0);
        return;
      }
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserIdForDb = session?.user?.id || null;

    if (formData.password) {
        toast({
            title: "Security Notice",
            description: "Password stored as plain text. For production, use Supabase Edge Functions for secure hashing.",
            variant: "default",
            duration: 7000,
        });
    }

    const newLinkData = {
      url: newLinkFullUrl,
      original_source: originalSourceUrl,
      storage_path: storagePath,
      custom_name: formData.customName || null,
      description: formData.description || null,
      expiration_date: formData.expirationDate || null,
      is_password_protected: !!formData.password,
      password_hash: formData.password || null, // Storing plain text password
      short_code: shortCode,
      user_id: currentUserIdForDb,
    };

    try {
      const { data: insertedLink, error: insertError } = await supabase
        .from('video_links')
        .insert([newLinkData])
        .select()
        .single();

      if (insertError) throw insertError;

      setGeneratedLink(insertedLink.url);
      toast({
        title: "Link Generated!",
        description: "Your secure video link is ready and saved to Supabase.",
        className: "bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]"
      });
      fetchQuickStats(); 
      setFormData({ videoUrl: '', customName: '', description: '', expirationDate: '', password: '' }); 
      setSelectedFile(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
      setUploadProgress(0);

    } catch (error) {
      console.error("Error saving link to Supabase:", error);
      let errorMessage = error.message || "Could not save link.";
      if (error.code === '23505') { 
        errorMessage = "That custom alias is already in use. Please choose another.";
      } else if (error.message.includes("violates row-level security policy")) {
        errorMessage = "Failed to save link due to security policy. Ensure you are logged in if required.";
      }
      toast({ title: "Database Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setIsCopied(true);
      toast({ title: "Copied!", description: "Link copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2500);
    } catch (error) {
      toast({ title: "Copy Failed", description: "Could not copy link. Please try manually.", variant: "destructive" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Generate Video Link - VidLinkGen | CIPHERTECH</title>
        <meta name="description" content="Easily create secure, customizable video links. Upload videos or use URLs, add passwords, set expirations, and more with VidLinkGen." />
      </Helmet>

      <div className="min-h-screen">
        <Navigation />
        
        <main className="pt-28 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold mb-4 text-gradient-blue-red">
                Create Your Secure Video Link
              </h1>
              <p className="text-lg text-slate-300">
                Choose to upload your video or link an existing one, then customize its settings.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              >
                <Card className="glassmorphic-card modern-border">
                  <CardHeader>
                    <CardTitle className="font-space-grotesk text-2xl flex items-center gap-2">
                      <LinkIconLucide className="w-6 h-6 text-[hsl(var(--primary))]" />
                      Link Configuration
                    </CardTitle>
                    <CardDescription>
                      Provide video source and set your preferred options.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <VideoSourceTabs
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        videoUrl={formData.videoUrl}
                        onVideoUrlChange={handleInputChange}
                        selectedFile={selectedFile}
                        onFileSelect={handleFileSelect}
                        onClearFile={clearSelectedFile}
                        isLoading={isLoading}
                        fileInputRef={fileInputRef}
                        uploadProgress={uploadProgress}
                      />
                      <LinkCustomizationForm
                        formData={formData}
                        onInputChange={handleInputChange}
                        isLoading={isLoading}
                      />
                      <Button type="submit" className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 text-white py-3 text-base font-semibold subtle-glow-blue" disabled={isLoading}>
                        {isLoading ? (activeTab === 'upload' && uploadProgress > 0 && uploadProgress < 100 ? `Uploading: ${uploadProgress}%` : (isLoading && uploadProgress === 100 ? 'Processing...' : 'Generating...')) : 'Generate Secure Link'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                className="space-y-8"
              >
                <GeneratedLinkDisplay
                  generatedLink={generatedLink}
                  isCopied={isCopied}
                  onCopyToClipboard={handleCopyToClipboard}
                  passwordSet={!!formData.password}
                  expirationDateSet={formData.expirationDate}
                />
                <QuickStatsDisplay stats={quickStats} />
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default GeneratorPage;