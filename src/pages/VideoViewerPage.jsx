import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { PlayCircle, Lock, AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const PasswordPromptDialog = ({ open, onOpenChange, onSubmit, isLoading }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glassmorphic-card modern-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-space-grotesk text-xl">Password Required</DialogTitle>
          <DialogDescription>
            This video link is protected. Please enter the password to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password-prompt" className="text-right text-slate-300">
                Password
              </Label>
              <Input
                id="password-prompt"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3 bg-[hsl(var(--input))] border-[hsl(var(--border))]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Unlock Video'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const VideoViewerPage = ({ linkData, error }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(linkData?.is_password_protected || false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const proceedToVideo = async () => {
    try {
      await supabase
        .from('video_links')
        .update({ 
          clicks: (linkData.clicks || 0) + 1,
          views: (linkData.views || 0) + 1 
        })
        .eq('id', linkData.id);

      let finalRedirectUrl = linkData.original_source;
      if (linkData.storage_path && !linkData.original_source.startsWith('http')) {
          const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(linkData.storage_path);
          finalRedirectUrl = publicUrlData?.publicUrl || finalRedirectUrl;
      }
      
      window.location.href = finalRedirectUrl;

    } catch (err) {
      console.error('Error proceeding to video:', err);
      toast({ title: "Redirection Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const handleWatchClick = () => {
    if (linkData.is_password_protected) {
      setShowPasswordPrompt(true);
    } else {
      proceedToVideo();
    }
  };

  const handlePasswordSubmit = async (enteredPassword) => {
    setIsVerifyingPassword(true);
    if (enteredPassword === linkData.password_hash) {
      setShowPasswordPrompt(false);
      toast({ title: "Access Granted!", description: "Redirecting to video...", className: "bg-green-600 text-white" });
      await proceedToVideo();
    } else {
      toast({ title: "Incorrect Password", description: "Please try again.", variant: "destructive" });
    }
    setIsVerifyingPassword(false);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Helmet>
          <title>Error - VidLinkGen</title>
        </Helmet>
        <Card className="glassmorphic-card modern-border max-w-lg w-full text-center">
          <CardHeader>
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <CardTitle className="text-2xl font-space-grotesk text-red-400">An Error Occurred</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/')} className="w-full">
              <Home className="mr-2 h-4 w-4" /> Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{linkData.custom_name || 'Watch Video'} - VidLinkGen</title>
        <meta name="description" content={linkData.description || 'You have been sent a secure video link.'} />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-black">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-2xl"
        >
          <Card className="glassmorphic-card modern-border text-center shadow-2xl shadow-primary/10">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <span className="text-white font-bold text-4xl font-space-grotesk">V</span>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-space-grotesk text-gradient-blue-red">
                {linkData.custom_name || 'A Secure Video Awaits'}
              </CardTitle>
              <CardDescription className="text-slate-300 text-base pt-2">
                {linkData.description || 'You have been invited to view a video securely shared via VidLinkGen.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 text-white px-12 py-7 text-xl subtle-glow-blue font-semibold"
                onClick={handleWatchClick}
              >
                {linkData.is_password_protected ? <Lock className="mr-3 h-5 w-5" /> : <PlayCircle className="mr-3 h-5 w-5" />}
                Watch Video
              </Button>
            </CardContent>
            <CardFooter className="flex-col text-xs text-slate-500 pt-6">
              <p>Powered by VidLinkGen | A CIPHERTECH Initiative</p>
              {linkData.expiration_date && <p className="mt-1">Link expires on: {new Date(linkData.expiration_date).toLocaleString()}</p>}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
      
      <PasswordPromptDialog
        open={showPasswordPrompt}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowPasswordPrompt(false);
          }
        }}
        onSubmit={handlePasswordSubmit}
        isLoading={isVerifyingPassword}
      />
    </>
  );
};

export default VideoViewerPage;