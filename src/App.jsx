import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import GeneratorPage from '@/pages/GeneratorPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import AuthPage from '@/pages/AuthPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import FloatingElements from '@/components/FloatingElements';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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


const VideoRedirector = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [linkData, setLinkData] = useState(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const proceedToVideo = async (currentLinkData) => {
    try {
      const { error: updateError } = await supabase
        .from('video_links')
        .update({ 
          clicks: (currentLinkData.clicks || 0) + 1,
          views: (currentLinkData.views || 0) + 1 
        })
        .eq('id', currentLinkData.id);

      if (updateError) {
          console.error("Error updating link stats:", updateError);
      }

      let finalRedirectUrl = currentLinkData.original_source;
      if (currentLinkData.storage_path && !currentLinkData.original_source.startsWith('http')) {
          const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(currentLinkData.storage_path);
          if (publicUrlData && publicUrlData.publicUrl) {
              finalRedirectUrl = publicUrlData.publicUrl;
          } else {
               console.error('Could not get public URL for stored video:', currentLinkData.storage_path);
               toast({ title: "Error", description: "Could not retrieve video from storage.", variant: "destructive" });
               navigate('/');
               return;
          }
      }
      
      window.location.href = finalRedirectUrl;

    } catch (error) {
      console.error('Error proceeding to video:', error);
      toast({ title: "Redirection Error", description: "An unexpected error occurred while trying to play the video.", variant: "destructive" });
      navigate('/');
    }
  };

  useEffect(() => {
    const fetchLink = async () => {
      setIsLoadingPage(true);
      if (!shortCode) {
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('video_links')
          .select('id, original_source, is_password_protected, password_hash, expiration_date, storage_path, clicks, views')
          .eq('short_code', shortCode)
          .single();

        if (error || !data) {
          console.error('Error fetching link or link not found:', error);
          toast({ title: "Link Not Found", description: "The requested video link does not exist or has expired.", variant: "destructive" });
          navigate('/');
          return;
        }
        
        if (data.expiration_date && new Date(data.expiration_date) < new Date()) {
            toast({ title: "Link Expired", description: "This video link has expired.", variant: "destructive" });
            navigate('/');
            return;
        }
        
        setLinkData(data);
        setIsLoadingPage(false);

        if (data.is_password_protected) {
          setShowPasswordPrompt(true);
        } else {
          proceedToVideo(data);
        }

      } catch (error) {
        console.error('Unexpected error during link fetch:', error);
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
        navigate('/');
        setIsLoadingPage(false);
      }
    };

    fetchLink();
  }, [shortCode, navigate, toast]);

  const handlePasswordSubmit = async (enteredPassword) => {
    if (!linkData) return;
    setIsVerifyingPassword(true);
    
    if (enteredPassword === linkData.password_hash) {
      setShowPasswordPrompt(false);
      toast({ title: "Access Granted!", description: "Redirecting to video...", className: "bg-green-600 text-white" });
      await proceedToVideo(linkData);
    } else {
      toast({ title: "Incorrect Password", description: "The password you entered is incorrect. Please try again.", variant: "destructive" });
    }
    setIsVerifyingPassword(false);
  };

  if (isLoadingPage || (linkData && linkData.is_password_protected && !showPasswordPrompt && !window.location.href.includes(linkData.original_source))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Helmet>
          <title>Loading Video... - VidLinkGen</title>
        </Helmet>
        <div className="tech-grid" />
        <div className="relative z-10 text-center">
          <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h1 className="text-2xl font-space-grotesk font-semibold mb-2">
            {linkData && linkData.is_password_protected ? 'Awaiting Password...' : 'Loading your video...'}
          </h1>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PasswordPromptDialog
        open={showPasswordPrompt}
        onOpenChange={(isOpen) => {
          if (!isOpen && linkData && linkData.is_password_protected) { 
            navigate('/'); 
          }
          setShowPasswordPrompt(isOpen);
        }}
        onSubmit={handlePasswordSubmit}
        isLoading={isVerifyingPassword}
      />
      { !showPasswordPrompt && linkData && linkData.is_password_protected && (
         <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
            <Helmet>
              <title>Access Denied - VidLinkGen</title>
            </Helmet>
            <div className="tech-grid" />
            <div className="relative z-10 text-center">
              <h1 className="text-2xl font-space-grotesk font-semibold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">Password required to view this video.</p>
              <Button onClick={() => navigate('/')} className="mt-4">Go to Homepage</Button>
            </div>
        </div>
      )}
    </>
  );
};

const ProtectedRoute = ({ children, allowedRoles, adminEmail }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
      }
      setSession(currentSession);
      setLoading(false);
    };
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (!loading && !currentSession && (allowedRoles?.includes('authenticated') || allowedRoles?.includes('admin')) ) {
        navigate('/auth');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, loading, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (allowedRoles?.includes('admin')) {
    if (!session || session.user.email !== adminEmail) {
      return <Navigate to="/" replace />;
    }
  } else if (allowedRoles?.includes('authenticated')) {
    if (!session) {
       return <Navigate to="/auth" replace />;
    }
  }
  
  return children;
};


function App() {
  const ADMIN_EMAIL = "richvybs92@gmail.com";
  return (
    <>
      <Helmet>
        <title>VidLinkGen - Securely share video links with ease | Powered by CIPHERTECH</title>
        <meta name="description" content="Generate secure, customizable video links with VidLinkGen. Upload videos, create shortened links, set expiration dates, and track analytics. Powered by CIPHERTECH technology." />
      </Helmet>
      
      <Router>
        <div className="min-h-screen relative scrollbar-thin">
          <FloatingElements />
          <div className="tech-grid" />
          
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['authenticated']}><DashboardPage /></ProtectedRoute>} />
              <Route path="/generator" element={<ProtectedRoute allowedRoles={['authenticated']}><GeneratorPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute allowedRoles={['authenticated']}><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']} adminEmail={ADMIN_EMAIL}><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/v/:shortCode" element={<VideoRedirector />} />
            </Routes>
          </div>
          
          <Toaster />
        </div>
      </Router>
    </>
  );
}

export default App;
