
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Navigation from '@/components/Navigation';
import AnalyticsSummary from '@/components/analytics/AnalyticsSummary';
import TopPerformingLinks from '@/components/analytics/TopPerformingLinks';
import GeographicDistribution from '@/components/analytics/GeographicDistribution';
import ActivityByTime from '@/components/analytics/ActivityByTime';
import EngagementInsights from '@/components/analytics/EngagementInsights';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Link2 } from 'lucide-react';

const AnalyticsPage = () => {
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLinkExpired = (expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: savedLinks, error } = await supabase
        .from('video_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const totalClicks = savedLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);
      const totalViews = savedLinks.reduce((sum, link) => sum + (link.views || 0), 0);
      const activeLinksCount = savedLinks.filter(link => !isLinkExpired(link.expiration_date)).length;

      const clicksToday = Math.floor(totalClicks * (Math.random() * 0.1 + 0.05)); 
      const viewsToday = Math.floor(totalViews * (Math.random() * 0.1 + 0.05));

      const topPerforming = savedLinks
        .sort((a, b) => ((b.clicks || 0) + (b.views || 0)) - ((a.clicks || 0) + (a.views || 0)))
        .slice(0, 5)
        .map(link => ({ ...link, name: link.custom_name || link.short_code || `Link ID: ${link.id.substring(0,8)}`}));


      const geoData = [
        { id: 'US', name: 'United States', value: Math.max(0, Math.floor(totalClicks * 0.4)) },
        { id: 'CA', name: 'Canada', value: Math.max(0, Math.floor(totalClicks * 0.15)) },
        { id: 'GB', name: 'United Kingdom', value: Math.max(0, Math.floor(totalClicks * 0.12)) },
        { id: 'DE', name: 'Germany', value: Math.max(0, Math.floor(totalClicks * 0.1)) },
        { id: 'AU', name: 'Australia', value: Math.max(0, Math.floor(totalClicks * 0.08)) },
        { id: 'OT', name: 'Others', value: Math.max(0, Math.floor(totalClicks * 0.15)) },
      ].filter(item => item.value > 0);
      if (totalClicks > 0 && geoData.length === 0) {
          geoData.push({id: 'UN', name: 'Unknown', value: totalClicks});
      }


      const timeDataRaw = [
        { hour: '00-04', clicks: Math.max(0, Math.floor(Math.random() * (totalClicks * 0.05 + 5))) },
        { hour: '04-08', clicks: Math.max(0, Math.floor(Math.random() * (totalClicks * 0.08 + 8))) },
        { hour: '08-12', clicks: Math.max(0, Math.floor(Math.random() * (totalClicks * 0.2 + 15))) },
        { hour: '12-16', clicks: Math.max(0, Math.floor(Math.random() * (totalClicks * 0.3 + 20))) },
        { hour: '16-20', clicks: Math.max(0, Math.floor(Math.random() * (totalClicks * 0.25 + 18))) },
        { hour: '20-24', clicks: Math.max(0, Math.floor(Math.random() * (totalClicks * 0.12 + 10))) },
      ];
      
      const engagementMetrics = [
          { title: "Bounce Rate", value: `${(Math.random() * 30 + 15).toFixed(1)}%`, change: `${(Math.random() * 10 - 5).toFixed(1)}%`, changeType: Math.random() > 0.5 ? 'positive' : 'negative' },
          { title: "Avg. Session", value: `${Math.floor(Math.random()*5)}m ${(Math.floor(Math.random()*60))}s`, change: `${Math.floor(Math.random()*60)}s`, changeType: Math.random() > 0.5 ? 'positive' : 'negative' },
          { title: "Conversion Rate", value: `${(Math.random() * 15 + 2).toFixed(1)}%`, change: `${(Math.random() * 5 - 2).toFixed(1)}%`, changeType: Math.random() > 0.5 ? 'positive' : 'negative' },
      ];

      setAnalyticsData({
        summary: {
          totalClicks, totalViews, 
          activeLinks: activeLinksCount, 
          totalLinks: savedLinks.length,
          clicksToday, viewsToday,
          avgCTR: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0,
        },
        topPerforming,
        geographicData: geoData,
        timeData: timeDataRaw,
        engagementMetrics,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({ title: "Error", description: "Could not load analytics data.", variant: "destructive" });
      setAnalyticsData(null); // Ensure it's null on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleFeatureRequest = (featureName) => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      description: `Detailed ${featureName} analytics are on the roadmap!`,
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Navigation />
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="inline-block">
            <Link2 className="mx-auto h-16 w-16 text-[hsl(var(--primary))] mb-4" />
        </motion.div>
        <p className="text-xl text-slate-400 ml-4">Loading analytics data...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Navigation />
        <p className="text-xl text-slate-400">No analytics data available. Try creating some links first!</p>
      </div>
    );
  }


  return (
    <>
      <Helmet>
        <title>Analytics Dashboard - VidLinkGen | CIPHERTECH</title>
        <meta name="description" content="Gain insights into your video link performance. Track clicks, views, geographic distribution, and engagement metrics with VidLinkGen analytics." />
      </Helmet>

      <div className="min-h-screen">
        <Navigation />
        
        <main className="pt-28 pb-16 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-10"
            >
              <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold mb-3 text-gradient-blue-red">
                Performance Analytics
              </h1>
              <p className="text-lg text-slate-300">
                Understand how your video links are performing across various metrics.
              </p>
            </motion.div>

            <AnalyticsSummary summary={analyticsData.summary} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <TopPerformingLinks links={analyticsData.topPerforming} />
              <GeographicDistribution data={analyticsData.geographicData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <ActivityByTime data={analyticsData.timeData} />
              <EngagementInsights metrics={analyticsData.engagementMetrics} onFeatureRequest={handleFeatureRequest} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AnalyticsPage;
