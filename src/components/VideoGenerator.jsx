
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Upload, Link, Calendar, Lock, Copy, Download, Crown, Shield } from 'lucide-react';
import QRCode from 'qrcode.react';

const VideoGenerator = ({ user }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedLinkData, setGeneratedLinkData] = useState(null);
  const qrRef = useRef();

  const [linkSettings, setLinkSettings] = useState({
    customName: '',
    password: '',
    expiryDate: '',
    description: ''
  });

  const generateShortId = (length = 7) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleFileUpload = async (event) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in or register to generate links.", variant: "destructive" });
      return;
    }
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = user?.is_premium ? 5 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024;
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${user?.is_premium ? '5GB' : '2GB'}. ${!user?.is_premium ? 'Upgrade to Premium for 5GB uploads!' : ''}`,
        variant: "destructive"
      });
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
        toast({ title: "Error getting public URL", description: "Could not retrieve the public URL for the uploaded video.", variant: "destructive" });
        return;
    }

    generateSecureLink(publicUrlData.publicUrl, 'upload');
  };

  const handleUrlSubmit = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in or register to generate links.", variant: "destructive" });
      return;
    }
    const urlInput = document.getElementById('video-url').value;
    if (!urlInput) {
      toast({
        title: "URL required",
        description: "Please enter a valid video URL"
      });
      return;
    }

    generateSecureLink(urlInput, 'url');
  };

  const generateSecureLink = async (source, sourceType) => {
    const previewDomain = window.location.origin;
    const shortId = generateShortId();
    const secureLink = `${previewDomain}/v/${shortId}`;
    
    const newLink = {
      user_id: user.id,
      url: secureLink, 
      source: source, 
      custom_name: linkSettings.customName || `Video from ${new Date().toLocaleDateString()}`,
      description: linkSettings.description,
      password: linkSettings.password || null,
      expiry_date: linkSettings.expiryDate || null,
      is_encrypted: user?.is_premium || false, // Encryption is strictly for premium users
    };

    const { data, error } = await supabase.from('video_links').insert(newLink).select().single();

    if (error) {
      toast({ title: "Error generating link", description: error.message, variant: "destructive" });
    } else if (data) {
      setGeneratedLink(data.url);
      setGeneratedLinkData(data);
      toast({
        title: "Link generated successfully!",
        description: "Your secure video link is ready to share."
      });
      setUploadProgress(0);
      // Reset link settings for next generation
      setLinkSettings({ customName: '', password: '', expiryDate: '', description: '' });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard"
    });
  };

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = `${generatedLinkData.custom_name || 'vidlinkgen-qr'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({ title: "QR Code downloaded!" });
    } else {
        toast({ title: "Error downloading QR Code", variant: "destructive"});
    }
  };

  return (
    <section className="py-12 md:py-20 bg-space-pattern">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-gradient mb-3 md:mb-4">
              Generate Secure Video Links
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Upload videos or link from YouTube, Vimeo, and more
            </p>
          </div>

          <Card className="glass-effect border-white/20 cyber-glow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl md:text-2xl">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                <span>Video Link Generator</span>
                {user?.is_premium && (
                  <Badge className="premium-badge text-xs md:text-sm">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6">
                  <TabsTrigger value="upload" className="flex items-center space-x-1 md:space-x-2 text-sm md:text-base">
                    <Upload className="h-4 w-4" />
                    <span>Upload Video</span>
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center space-x-1 md:space-x-2 text-sm md:text-base">
                    <Link className="h-4 w-4" />
                    <span>Video URL</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4 md:space-y-6">
                  <div className="upload-zone rounded-lg p-6 md:p-8 text-center">
                    <Upload className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-blue-500" />
                    <h3 className="text-md md:text-lg font-semibold mb-2">Upload your video</h3>
                    <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
                      Maximum file size: {user?.is_premium ? '5GB' : '2GB'}
                      {!user?.is_premium && (
                        <span className="block text-yellow-500 text-xs mt-1">
                          Upgrade to Premium for 5GB uploads!
                        </span>
                      )}
                    </p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="video-upload"
                    />
                    <Button
                      onClick={() => document.getElementById('video-upload').click()}
                      disabled={isUploading || !user}
                      className="cyber-glow text-sm md:text-base"
                      size="sm"
                    >
                      {isUploading ? `Uploading... ${uploadProgress}%` : 'Choose Video File'}
                    </Button>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full h-2 md:h-3" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="url" className="space-y-4 md:space-y-6">
                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1 md:space-y-2">
                      <Label htmlFor="video-url" className="text-sm md:text-base">Video URL</Label>
                      <Input
                        id="video-url"
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                        className="bg-background/50 text-sm md:text-base"
                        disabled={!user}
                      />
                    </div>
                    <Button onClick={handleUrlSubmit} className="w-full cyber-glow text-sm md:text-base" disabled={!user}>
                      Generate Secure Link
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 md:mt-8 space-y-3 md:space-y-4 border-t border-white/10 pt-4 md:pt-6">
                <h3 className="text-md md:text-lg font-semibold flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Link Settings</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="custom-name" className="text-xs md:text-sm">Custom Name</Label>
                    <Input
                      id="custom-name"
                      placeholder="My awesome video"
                      value={linkSettings.customName}
                      onChange={(e) => setLinkSettings({...linkSettings, customName: e.target.value})}
                      disabled={!user} className="text-xs md:text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="password" className="text-xs md:text-sm">Password Protection</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Optional password"
                      value={linkSettings.password}
                      onChange={(e) => setLinkSettings({...linkSettings, password: e.target.value})}
                      disabled={!user} className="text-xs md:text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="expiry" className="text-xs md:text-sm">Expiry Date</Label>
                    <Input
                      id="expiry"
                      type="date"
                      value={linkSettings.expiryDate}
                      onChange={(e) => setLinkSettings({...linkSettings, expiryDate: e.target.value})}
                      disabled={!user} className="text-xs md:text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="description" className="text-xs md:text-sm">Description</Label>
                    <Input
                      id="description"
                      placeholder="Video description"
                      value={linkSettings.description}
                      onChange={(e) => setLinkSettings({...linkSettings, description: e.target.value})}
                      disabled={!user} className="text-xs md:text-sm"
                    />
                  </div>
                </div>
                {user?.is_premium && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Shield className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                    <Label className="text-xs md:text-sm">File Encryption Enabled (Premium)</Label>
                  </div>
                )}
                 {!user?.is_premium && user && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Shield className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                    <Label className="text-xs md:text-sm text-muted-foreground">File Encryption (Premium Only)</Label>
                  </div>
                )}
              </div>

              {generatedLink && generatedLinkData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 md:mt-8 p-4 md:p-6 glass-effect rounded-lg border border-green-500/30"
                >
                  <h3 className="text-md md:text-lg font-semibold text-green-400 mb-3 md:mb-4 flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Secure Link Generated!</span>
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                      <div className="flex-grow w-full">
                        <div className="flex items-center space-x-2">
                          <Input
                            value={generatedLink}
                            readOnly
                            className="bg-background/50 text-xs md:text-sm"
                          />
                          <Button onClick={copyToClipboard} size="icon" variant="outline" className="h-8 w-8 md:h-9 md:w-9">
                            <Copy className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
                          <Button onClick={downloadQR} variant="outline" size="sm" className="text-xs md:text-sm">
                            <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            Download QR
                          </Button>
                          <Button asChild variant="outline" size="sm" className="text-xs md:text-sm">
                              <a href={generatedLink} target="_blank" rel="noopener noreferrer">Test Link</a>
                          </Button>
                          {generatedLinkData.is_encrypted && (
                            <Badge className="premium-badge text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Encrypted
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div ref={qrRef} className="p-1.5 md:p-2 bg-white rounded-md hidden">
                          <QRCode value={generatedLink} size={96} />
                      </div>
                      <div className="p-1.5 md:p-2 bg-white rounded-md">
                          <QRCode value={generatedLink} size={96} fgColor="#000000" bgColor="#ffffff" />
                      </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoGenerator;
