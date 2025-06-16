import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import VideoGenerator from '@/components/VideoGenerator';
import Dashboard from '@/components/Dashboard';
import Features from '@/components/Features';
import AdminPanel from '@/components/AdminPanel';
import WhatsappModal from '@/components/WhatsappModal';
import Auth from '@/components/Auth';
import VideoPlayer from '@/components/VideoPlayer';
import DetailedAnalytics from '@/components/DetailedAnalytics';
import SupportModal from '@/components/SupportModal';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Crown } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState(null);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumModalFeature, setPremiumModalFeature] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const { toast } = useToast();

  const processUserProfile = (profileData) => {
    if (!profileData) return null;
    
    let isActivePremium = profileData.is_premium;
    if (profileData.premium_expiry_date) {
      const expiryDate = new Date(profileData.premium_expiry_date);
      if (expiryDate < new Date()) {
        isActivePremium = false; 
      }
    } else if (profileData.is_premium && !profileData.premium_tier) {
      //This case is for legacy premium users who don't have a tier or expiry date
      isActivePremium = true; 
    } else if (!profileData.is_premium) {
      isActivePremium = false;
    }

    return { ...profileData, is_premium: isActivePremium };
  };


  useEffect(() => {
    const handleUrlChange = async () => {
      const path = window.location.pathname;
      const queryParams = new URLSearchParams(window.location.search);
      const editLinkIdFromQuery = queryParams.get('edit');

      if (path.startsWith('/v/')) {
        const shortUrlId = path.split('/v/')[1];
        if (shortUrlId) {
          setViewParams({ shortUrlId }); // Pass shortUrlId to VideoPlayer
          setCurrentView('videoPlayer');
        }
      } else if (path.startsWith('/analytics/')) {
        const linkId = path.split('/analytics/')[1]; // This is the DB UUID
        if (linkId) {
          setViewParams({ linkId });
          setCurrentView('detailedAnalytics');
        }
      } else {
        const viewFromPath = path.substring(1) || 'home';
        setCurrentView(viewFromPath);
        if (editLinkIdFromQuery && viewFromPath === 'home') {
          setViewParams({ editLinkId: editLinkIdFromQuery });
        } else {
          setViewParams(null);
        }
      }
    };
    
    window.addEventListener('popstate', handleUrlChange);
    handleUrlChange();

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(processUserProfile({ ...session.user, ...profile }));
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser(processUserProfile({ ...session.user, ...profile }));
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const changeView = (view, params = null) => {
    let path = `/${view === 'home' ? '' : view}`;
    let query = '';

    if (view === 'videoPlayer' && params?.shortUrlId) { // Expect shortUrlId for navigation
      path = `/v/${params.shortUrlId}`;
    } else if (view === 'detailedAnalytics' && params?.linkId) { // Expect DB UUID
      path = `/analytics/${params.linkId}`;
    } else if (view === 'home' && params?.editLinkId) {
      query = `?edit=${params.editLinkId}`;
    }
    
    window.history.pushState({ view, params }, '', `${path}${query}`);
    setCurrentView(view);
    setViewParams(params);
  };
  
  const handleSuccessfulRegister = (newUser) => {
    if (!newUser.has_joined_channels) {
      setShowWhatsappModal(true);
    }
  };

  const handleModalFinished = async () => {
    setShowWhatsappModal(false);
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ has_joined_channels: true })
        .eq('id', user.id);
      
      if (error) {
        console.error("Error updating profile:", error.message);
      } else {
         const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUser(prevUser => processUserProfile({ ...prevUser, ...profile }));
        toast({
          title: "Welcome Aboard!",
          description: "You've successfully joined our community channels.",
          variant: "default",
        });
      }
    }
  };
  
  const triggerAuthModal = () => setShowAuthModal(true);
  const triggerPremiumModal = (featureName) => {
    setPremiumModalFeature(featureName);
    setShowPremiumModal(true);
  };
  const triggerSupportModal = () => {
    if (user && user.is_premium) {
      setShowSupportModal(true);
    } else if (user && !user.is_premium) {
      triggerPremiumModal("24/7 Priority Support");
    } else {
      triggerAuthModal();
    }
  };


  const renderCurrentView = () => {
    const editLinkIdForGenerator = currentView === 'home' ? viewParams?.editLinkId : null;
    switch (currentView) {
      case 'dashboard':
        return user ? <Dashboard user={user} setCurrentView={changeView} triggerPremiumModal={triggerPremiumModal} /> : <Hero setCurrentView={changeView} user={user} />;
      case 'features':
        return <Features user={user} setCurrentView={changeView} triggerSupportModal={triggerSupportModal} />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel user={user} /> : <Hero setCurrentView={changeView} user={user} />;
      case 'auth':
        return <Auth setUserState={setUser} setCurrentView={changeView} onSuccessfulRegister={handleSuccessfulRegister} processUserProfile={processUserProfile} />;
      case 'videoPlayer':
        return <VideoPlayer shortUrlId={viewParams?.shortUrlId} user={user} setCurrentView={changeView} />;
      case 'detailedAnalytics':
        return user ? <DetailedAnalytics linkId={viewParams?.linkId} user={user} setCurrentView={changeView} /> : <Hero setCurrentView={changeView} user={user} />;
      case 'home':
      default:
        return (
          <>
            <Hero setCurrentView={changeView} user={user} />
            <VideoGenerator 
              user={user} 
              editLinkId={editLinkIdForGenerator} 
              triggerAuthModal={triggerAuthModal}
              triggerPremiumModal={triggerPremiumModal}
              setCurrentView={changeView}
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header 
        user={user} 
        setUser={setUser} 
        currentView={currentView} 
        setCurrentView={changeView} 
        triggerPremiumModal={() => triggerPremiumModal("Premium Features")}
      />
      <main className="flex-grow">
        {renderCurrentView()}
      </main>
      <Toaster />
      <WhatsappModal open={showWhatsappModal} onFinished={handleModalFinished} />
      <SupportModal open={showSupportModal} onOpenChange={setShowSupportModal} user={user} />

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="glass-effect border-yellow-500/30">
          <DialogHeader>
            <DialogTitle className="text-gradient font-orbitron">Authentication Required</DialogTitle>
            <DialogDescription>
              Please log in or register to use this feature.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => { setShowAuthModal(false); changeView('auth'); }} className="cyber-glow">
              Login / Register
            </Button>
            <Button variant="outline" onClick={() => setShowAuthModal(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
        <DialogContent className="glass-effect border-yellow-500/30">
          <DialogHeader>
            <DialogTitle className="text-gradient font-orbitron flex items-center">
              <Crown className="h-6 w-6 mr-2 text-yellow-500" /> Premium Feature Locked
            </DialogTitle>
            <DialogDescription>
              The feature "{premiumModalFeature}" requires a Premium subscription. Upgrade now to unlock this and more!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => { setShowPremiumModal(false); changeView('features'); }} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold">
              Upgrade to Premium
            </Button>
            <Button variant="outline" onClick={() => setShowPremiumModal(false)}>Maybe Later</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default App;