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
import VideoViewerPage from '@/pages/VideoViewerPage';
import FloatingElements from '@/components/FloatingElements';
import { supabase } from '@/lib/supabaseClient';

const VideoLinkHandler = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [linkData, setLinkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndLogLink = async () => {
      if (!shortCode) {
        navigate('/');
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('video_links')
          .select('*')
          .eq('short_code', shortCode)
          .single();

        if (fetchError || !data) {
          throw new Error("Link Not Found: The requested video link does not exist or has expired.");
        }
        
        if (data.expiration_date && new Date(data.expiration_date) < new Date()) {
          throw new Error("Link Expired: This video link is no longer available.");
        }
        
        setLinkData(data);

        const { error: clickError } = await supabase.rpc('log_link_event', {
          link_id_param: data.id,
          event_type_param: 'click',
        });
        if (clickError) console.error("Error logging click event:", clickError);
        
        const { error: viewError } = await supabase.rpc('log_link_event', {
          link_id_param: data.id,
          event_type_param: 'view',
        });
        if (viewError) console.error("Error logging view event:", viewError);

      } catch (err) {
        console.error('Error fetching link:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndLogLink();
  }, [shortCode, navigate]);

  if (isLoading) {
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
          <h1 className="text-2xl font-space-grotesk font-semibold mb-2">Loading your video...</h1>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (error) {
     return <VideoViewerPage error={error} />;
  }

  return <VideoViewerPage linkData={linkData} />;
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
              <Route path="/v/:shortCode" element={<VideoLinkHandler />} />
            </Routes>
          </div>
          
          <Toaster />
        </div>
      </Router>
    </>
  );
}

export default App;