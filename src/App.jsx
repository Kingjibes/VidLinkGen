
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
import { supabase } from '@/lib/supabase';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState(null);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);

  useEffect(() => {
    const handleUrlChange = async () => {
      const path = window.location.pathname;
      if (path.startsWith('/v/')) {
        const linkId = path.split('/v/')[1];
        if (linkId) {
          setCurrentView('videoPlayer');
          setViewParams({ linkId });
        }
      } else {
        const viewFromHistory = window.history.state?.view || 'home';
        setCurrentView(viewFromHistory);
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
        setUser({ ...session.user, ...profile });
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
          setUser({ ...session.user, ...profile });
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
    let path;
    if (view.startsWith('/v/')) {
      path = view;
    } else {
      path = `/${view === 'home' ? '' : view}`;
    }
    window.history.pushState({ view: view.startsWith('/v/') ? 'videoPlayer' : view, params }, '', path);
    setCurrentView(view.startsWith('/v/') ? 'videoPlayer' : view);
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
      const { data, error } = await supabase
        .from('profiles')
        .update({ has_joined_channels: true })
        .eq('id', user.id)
        .select()
        .single();
      
      if (data) {
        setUser(data);
      }
    }
    window.location.reload();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return user ? <Dashboard user={user} setCurrentView={changeView} /> : <Hero setCurrentView={changeView} user={user} />;
      case 'features':
        return <Features user={user} />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel user={user} /> : <Hero setCurrentView={changeView} user={user} />;
      case 'auth':
        return <Auth setUser={setUser} setCurrentView={changeView} onSuccessfulRegister={handleSuccessfulRegister} />;
      case 'videoPlayer':
        return <VideoPlayer linkId={viewParams?.linkId} />;
      case 'home':
      default:
        return (
          <>
            <Hero setCurrentView={changeView} user={user} />
            <VideoGenerator user={user} />
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
      />
      <main className="flex-grow">
        {renderCurrentView()}
      </main>
      <Toaster />
      <WhatsappModal open={showWhatsappModal} onFinished={handleModalFinished} />
    </div>
  );
}

export default App;
