
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Lock, Film, EyeOff } from 'lucide-react';

const VideoPlayer = ({ linkId, user, setCurrentView }) => {
  const [videoData, setVideoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessDeniedReason, setAccessDeniedReason] = useState('');

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!linkId) {
        setError("Invalid link ID.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const targetUrl = `${window.location.origin}/v/${linkId}`;
      const { data, error: fetchError } = await supabase
        .from('video_links')
        .select('*, video_link_permissions(user_email)')
        .eq('url', targetUrl)
        .single();

      if (fetchError) {
        setError("Video link not found or an error occurred.");
        setVideoData(null);
      } else if (data) {
        if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
          setError("This video link has expired.");
          setVideoData(null);
          setIsLoading(false);
          return;
        }
        
        setVideoData(data); // Set videoData first

        if (data.password) {
          setIsPasswordProtected(true);
          if (isAuthenticated) { // If already authenticated (e.g. password entered)
             await checkUserAccess(data); // Pass current data
          }
          // If not authenticated, password screen will show. Access check happens after password.
        } else { // No password
          await checkUserAccess(data); // Pass current data
        }
      } else {
        setError("Video link not found.");
      }
      setIsLoading(false);
    };

    fetchVideoData();
  }, [linkId, isAuthenticated, user]); // isAuthenticated change will re-trigger to check access

  const checkUserAccess = async (currentVideoData) => {
    if (!currentVideoData) { // Ensure currentVideoData is available
        setError("Video data unavailable for access check.");
        return false;
    }

    const permissions = currentVideoData.video_link_permissions;
    if (permissions && permissions.length > 0) { 
      if (!user) {
        setAccessDeniedReason("This video requires you to be logged in. Please log in and try again.");
        setError("Access Denied");
        return false;
      }
      const userHasPermission = permissions.some(p => p.user_email === user.email);
      if (!userHasPermission) {
        setAccessDeniedReason("You do not have permission to view this video.");
        setError("Access Denied");
        return false;
      }
    }
    
    incrementViewCount(currentVideoData.id);
    setError(null); // Clear any previous access denied errors if access is now granted
    setAccessDeniedReason('');
    return true;
  };


  const incrementViewCount = async (id) => {
    await supabase.rpc('increment_clicks', { link_id_param: id });
  };

  const handlePasswordSubmit = async () => {
    if (videoData && videoData.password === password) {
      setIsAuthenticated(true); // This will trigger useEffect to re-check access
    } else {
      setError("Incorrect password. Please try again.");
      setAccessDeniedReason(''); // Clear specific reason as it's a password issue
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url; 
  };


  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-space-pattern"><p className="text-xl">Loading video...</p></div>;
  }
  
  if (error && accessDeniedReason) { // Show specific access denied message
     return (
      <div className="min-h-screen bg-space-pattern pt-24 pb-12 flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="glass-effect border-red-500/30 w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-red-400 flex items-center justify-center">
                <ShieldAlert className="h-8 w-8 mr-3" /> Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-6">{accessDeniedReason}</p>
              {!user && accessDeniedReason.includes("logged in") && (
                <Button onClick={() => setCurrentView('auth')} className="cyber-glow">Login to VidLinkGen</Button>
              )}
               {(user && (accessDeniedReason.includes("permission") || !accessDeniedReason )) && (
                 <Button onClick={() => setCurrentView('home')} variant="outline">Back to Home</Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (error) { // Generic error (not specific access denied, or after password failure)
    return (
      <div className="min-h-screen bg-space-pattern pt-24 pb-12 flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="glass-effect border-red-500/30 w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-red-400 flex items-center justify-center">
                <ShieldAlert className="h-8 w-8 mr-3" /> {error}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-6">There was an issue loading the video. It might be expired, the link is incorrect, or password entry failed.</p>
              <Button onClick={() => setCurrentView('home')} variant="outline">Back to Home</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  if (!videoData && !isLoading) { // Final check if no data and not loading (should be caught by error states)
     return (
      <div className="min-h-screen bg-space-pattern pt-24 pb-12 flex items-center justify-center">
        <Card className="glass-effect border-yellow-500/30 w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-yellow-500">Video Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested video link could not be found.</p>
             <Button onClick={() => setCurrentView('home')} className="mt-4">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  if (isPasswordProtected && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-space-pattern pt-24 pb-12 flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="glass-effect border-yellow-500/30 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-400 flex items-center justify-center">
                <Lock className="h-8 w-8 mr-3" /> Password Protected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>This video is password protected. Please enter the password to view.</p>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter password"
                className="bg-background/50"
              />
              <Button onClick={handlePasswordSubmit} className="w-full cyber-glow">Unlock Video</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  const embedUrl = videoData ? getEmbedUrl(videoData.source) : null;

  return (
    <div className="min-h-screen bg-space-pattern pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-effect border-white/20 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-orbitron text-gradient flex items-center">
                <Film className="mr-3 h-7 w-7 text-blue-400" />
                {videoData?.custom_name || 'Protected Video'}
              </CardTitle>
              {videoData?.description && <p className="text-muted-foreground mt-1">{videoData.description}</p>}
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden shadow-2xl border border-white/10">
                {embedUrl ? (
                  embedUrl.includes('youtube.com') || embedUrl.includes('vimeo.com') ? (
                    <iframe
                      src={embedUrl}
                      title={videoData?.custom_name || 'Video Player'}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : (
                    <video controls className="w-full h-full" src={embedUrl}>
                      Your browser does not support the video tag.
                    </video>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                    <EyeOff className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Video source not available or invalid.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoPlayer;
