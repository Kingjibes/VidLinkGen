
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Lock, Shield, Video, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const VideoPlayer = ({ linkId }) => {
  const [linkData, setLinkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordIncorrect, setIsPasswordIncorrect] = useState(false);

  useEffect(() => {
    const fetchLinkData = async () => {
      const currentPath = window.location.pathname;
      const shortIdFromUrl = currentPath.startsWith('/v/') ? currentPath.split('/v/')[1] : null;
      const idToFetch = linkId || shortIdFromUrl;


      if (!idToFetch) {
        setError("Invalid video link identifier.");
        setIsLoading(false);
        return;
      }
      
      const { data, error: fetchError } = await supabase
        .from('video_links')
        .select('*')
        .filter('url', 'like', `%/${idToFetch}`);

      if (fetchError || !data || data.length === 0) {
        setError(fetchError ? fetchError.message : "Video link not found or has been removed.");
        setIsLoading(false);
        return;
      }
      
      const fetchedLink = data[0];

      if (fetchedLink.expiry_date && new Date(fetchedLink.expiry_date) < new Date()) {
        setError("This video link has expired.");
        setIsLoading(false);
        return;
      }
      
      setLinkData(fetchedLink);
      if (!fetchedLink.password) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    fetchLinkData();
  }, [linkId]);

  const handlePasswordSubmit = () => {
    if (password === linkData.password) {
      setIsAuthenticated(true);
      setIsPasswordIncorrect(false);
      toast({ title: "Access Granted!" });
    } else {
      setIsPasswordIncorrect(true);
      toast({ title: "Incorrect Password", variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-pattern p-4">
        <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-pattern p-4">
        <Card className="glass-effect border-red-500/30 w-full max-w-md md:max-w-lg">
          <CardHeader>
            <CardTitle className="text-red-400 text-xl md:text-2xl">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-pattern p-4">
        <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} className="w-full max-w-sm md:max-w-md">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center text-lg md:text-xl">
              <Lock className="mr-2 h-5 w-5" /> Password Protected
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              This video link requires a password to view.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <Input 
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${isPasswordIncorrect ? "border-red-500" : ""} text-sm md:text-base`}
            />
            <Button onClick={handlePasswordSubmit} className="w-full cyber-glow text-sm md:text-base">Unlock Video</Button>
            {isPasswordIncorrect && <p className="text-xs md:text-sm text-red-500 text-center">The password you entered is incorrect.</p>}
          </CardContent>
        </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-pattern pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-orbitron text-gradient flex items-center">
                <Video className="mr-2 md:mr-3 h-6 w-6 md:h-8 md:w-8"/>
                {linkData.custom_name}
              </CardTitle>
              <CardDescription className="text-sm md:text-base">{linkData.description}</CardDescription>
              {linkData.is_encrypted && (
                <div className="flex items-center text-yellow-400 pt-2 text-xs md:text-sm">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>This link is secured with file encryption.</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-muted-foreground overflow-hidden">
                 {linkData.source && (linkData.source.startsWith('http://') || linkData.source.startsWith('https://')) ? (
                    linkData.source.includes('youtube.com') || linkData.source.includes('youtu.be') ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${linkData.source.split('v=')[1]?.split('&')[0] || linkData.source.split('/').pop()}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                      ></iframe>
                    ) : linkData.source.includes('vimeo.com') ? (
                      <iframe
                        src={`https://player.vimeo.com/video/${linkData.source.split('/').pop()}`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title="Vimeo video player"
                        className="rounded-lg"
                      ></iframe>
                    ) : ( // Assumes direct video link if not YouTube/Vimeo
                      <video controls src={linkData.source} className="w-full h-full rounded-lg object-contain">
                        Your browser does not support the video tag.
                      </video>
                    )
                  ) : ( // Fallback for non-URL sources (e.g. old data or unexpected format)
                    <p className="text-sm md:text-base">Video source not available or invalid.</p>
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
