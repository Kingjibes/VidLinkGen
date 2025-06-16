import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldQuestion, Lock, Unlock, EyeOff, Download, PlayCircle, XCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const VideoPlayer = ({ shortUrlId, user, setCurrentView }) => { // Changed prop name to shortUrlId
  const [videoData, setVideoData] = useState(null);
  const [password, setPassword] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const { toast } = useToast();

  const simulateUserAgent = () => {
    const agents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15"
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  };

  const simulateCountry = () => {
    const countries = ["USA", "Canada", "UK", "Germany", "France", "Japan", "Australia", "India", "Brazil"];
    return countries[Math.floor(Math.random() * countries.length)];
  };

  const simulateDeviceType = (agent) => {
    if (agent.includes("Mobi") || agent.includes("Android") || agent.includes("iPhone")) return "mobile";
    if (agent.includes("Tablet") || agent.includes("iPad")) return "tablet";
    return "desktop";
  };

  const recordClick = async (dbLinkId) => {
    if (!dbLinkId) return;
    try {
      const userAgent = simulateUserAgent();
      const deviceType = simulateDeviceType(userAgent);
      const country = simulateCountry();

      // Insert into click tracking table
      await supabase.from('video_link_clicks').insert({ 
        link_id: dbLinkId,
        user_agent: userAgent,
        country: country,
        device_type: deviceType
      });

      // Increment the general clicks count on video_links table using RPC
      const { error: rpcError } = await supabase.rpc('increment_clicks', { row_id: dbLinkId });
      if (rpcError) {
        console.error("Error calling increment_clicks RPC:", rpcError);
      }
    } catch (clickError) {
      console.error("Error recording click:", clickError);
    }
  };
  
  useEffect(() => {
    const fetchVideoData = async () => {
      setIsLoading(true);
      setError(null);

      if (!shortUrlId) {
        setError("No video link ID provided.");
        setIsLoading(false);
        return;
      }
      
      // Construct the full URL based on the shortUrlId to query the 'url' column
      const expectedUrl = `${window.location.origin}/v/${shortUrlId}`;

      const { data, error: fetchError } = await supabase
        .from('video_links')
        .select('id, source, custom_name, description, password, expiry_date, is_encrypted, video_link_permissions(user_email)') // Fetch 'id'
        .eq('url', expectedUrl) // Query using the full URL
        .single();

      if (fetchError || !data) {
        setError(fetchError?.message || "Video link not found or expired.");
        setIsLoading(false);
        setVideoData(null);
        return;
      }

      if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
        setError("This video link has expired.");
        setIsLoading(false);
        setVideoData(null);
        return;
      }
      
      setVideoData(data); // data.id is the DB UUID
      setIsPasswordProtected(!!data.password);

      if (!data.password) {
        if (data.video_link_permissions && data.video_link_permissions.length > 0) {
          if (!user || !data.video_link_permissions.some(p => p.user_email === user.email)) {
            setError("You do not have permission to view this video.");
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
            if (data.id) recordClick(data.id); // Record click if authenticated by email permission
          }
        } else {
          setIsAuthenticated(true); // Public link or no specific email permissions
          if (data.id) recordClick(data.id); // Record click for public non-password protected
        }
      }
      setIsLoading(false);
    };

    fetchVideoData();
  }, [shortUrlId, user]); // Depend on shortUrlId

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password === videoData?.password) {
      setIsAuthenticated(true);
      setError(null);
      if (videoData && videoData.id) {
        await recordClick(videoData.id); // Record click after successful password auth
      }
    } else {
      setError("Incorrect password.");
      toast({ title: "Access Denied", description: "The password you entered is incorrect.", variant: "destructive" });
    }
  };
  

  const handleDownload = () => {
    if (!videoData?.source) {
      toast({ title: "Error", description: "Video source not available for download.", variant: "destructive" });
      return;
    }
    const link = document.createElement('a');
    link.href = videoData.source;
    
    let filename = videoData.custom_name ? videoData.custom_name.replace(/[^a-zA-Z0-9 ._-]/g, '') : 'video';
    try {
        const urlParts = new URL(videoData.source).pathname.split('/');
        const potentialFilename = urlParts[urlParts.length - 1];
        if (potentialFilename.includes('.')) { 
            filename = potentialFilename;
        }
    } catch (e) { /* invalid URL, stick to custom_name or generic */ }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download Started", description: "Your video download has begun.", variant: "default" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-pattern">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <PlayCircle className="h-16 w-16 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  if (error && !videoData?.password) { 
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-pattern p-4">
        <Card className="w-full max-w-md glass-effect border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center"><XCircle className="mr-2" /> Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-200">{error}</p>
            <Button onClick={() => setCurrentView('home')} className="w-full mt-6 cyber-glow-red">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  if (isPasswordProtected && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-pattern p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="w-full max-w-md glass-effect border-yellow-500/50">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Lock className="mr-2 h-5 w-5" /> Password Protected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">This video requires a password to view.</p>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/70 border-white/20 focus:border-yellow-500"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <Button type="submit" className="w-full cyber-glow-yellow">
                  <Unlock className="mr-2 h-4 w-4" /> Unlock Video
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated && videoData?.video_link_permissions?.length > 0) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-space-pattern p-4">
        <Card className="w-full max-w-md glass-effect border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center"><EyeOff className="mr-2" /> Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-200">You do not have permission to view this video. Please log in with an authorized account.</p>
            <Button onClick={() => setCurrentView('auth')} className="w-full mt-6 cyber-glow-red">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!videoData?.source) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-space-pattern p-4">
        <Card className="w-full max-w-md glass-effect border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center"><XCircle className="mr-2" /> Video Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-200">The video source is missing or invalid.</p>
            <Button onClick={() => setCurrentView('home')} className="w-full mt-6 cyber-glow-red">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-space-pattern pt-20 p-4">
      <motion.div 
        className="w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-effect border-blue-500/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-gradient font-orbitron text-2xl truncate">
              {videoData.custom_name || "Video Playback"}
            </CardTitle>
            {videoData.description && <p className="text-sm text-muted-foreground mt-1">{videoData.description}</p>}
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
              <video
                ref={videoRef}
                src={videoData.source}
                controls
                className="w-full h-full"
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            </div>
             <div className="mt-4 flex justify-end">
              <Button onClick={handleDownload} variant="outline" className="cyber-button-secondary">
                <Download className="mr-2 h-4 w-4" /> Download Video
              </Button>
            </div>
          </CardContent>
        </Card>
        <Button onClick={() => setCurrentView('home')} variant="link" className="mt-6 text-blue-400 hover:text-blue-300">
          Generate another link
        </Button>
      </motion.div>
    </div>
  );
};

export default VideoPlayer;