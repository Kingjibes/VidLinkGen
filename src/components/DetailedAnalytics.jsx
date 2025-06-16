import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Calendar, Globe, BarChartBig, MapPin, Smartphone, AlertTriangle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const DetailedAnalytics = ({ linkId, user, setCurrentView }) => {
  const [linkData, setLinkData] = useState(null);
  const [clickStats, setClickStats] = useState({ labels: [], data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = useCallback(async () => {
    if (!linkId || !user) { // linkId here is the DB UUID
      setError("Link ID or user not provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: linkInfo, error: linkError } = await supabase
        .from('video_links')
        .select('*')
        .eq('id', linkId) // Use DB UUID for fetching link details
        .eq('user_id', user.id)
        .single();

      if (linkError) throw linkError;
      if (!linkInfo) throw new Error("Link not found or access denied.");
      setLinkData(linkInfo); // linkInfo.clicks should have the total count

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: clicksData, error: clicksError } = await supabase
        .from('video_link_clicks')
        .select('clicked_at') // Only need clicked_at for daily counts
        .eq('link_id', linkId) // Filter clicks by DB UUID
        .gte('clicked_at', sevenDaysAgo.toISOString())
        .order('clicked_at', { ascending: true });

      if (clicksError) throw clicksError;

      const dailyClicks = {};
      clicksData.forEach(click => {
        const date = new Date(click.clicked_at).toLocaleDateString('en-CA'); 
        dailyClicks[date] = (dailyClicks[date] || 0) + 1;
      });
      
      const labels = [];
      const dataPoints = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toLocaleDateString('en-CA');
        labels.push(formattedDate);
        dataPoints.push(dailyClicks[formattedDate] || 0);
      }

      setClickStats({ labels, data: dataPoints });

    } catch (fetchError) {
      setError(fetchError.message);
      setLinkData(null); // Clear link data on error
      setClickStats({ labels: [], data: [] });
    } finally {
      setLoading(false);
    }
  }, [linkId, user]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const viewsChartData = {
    labels: clickStats.labels,
    datasets: [
      {
        label: 'Daily Views (Last 7 Days)',
        data: clickStats.data,
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverRadius: 7,
        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#a0aec0', stepSize: 1 }
      },
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM dd, yyyy',
          displayFormats: {
            day: 'MMM dd'
          }
        },
        grid: { display: false },
        ticks: { color: '#a0aec0' }
      }
    },
    plugins: {
      legend: { labels: { color: '#e2e8f0' } },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-space-pattern"><p className="text-xl text-gray-300">Loading analytics...</p></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-space-pattern pt-24 pb-12 flex items-center justify-center">
        <Card className="glass-effect border-red-500/30 w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center"><AlertTriangle className="mr-2"/>Error Loading Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-200">{error}</p>
            <Button onClick={() => setCurrentView('dashboard')} className="mt-4 cyber-glow-red w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!linkData) {
     return (
      <div className="min-h-screen bg-space-pattern pt-24 pb-12 flex items-center justify-center">
        <Card className="glass-effect border-yellow-500/30 w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-yellow-400">Analytics Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-200">Could not find data for this link.</p>
             <Button onClick={() => setCurrentView('dashboard')} className="mt-4 cyber-glow-yellow w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-space-pattern pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={() => setCurrentView('dashboard')} variant="outline" className="mb-6 border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>

          <Card className="glass-effect border-white/20 mb-8 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-orbitron text-gradient flex items-center">
                <BarChartBig className="mr-3 h-7 w-7 text-blue-400" />
                Detailed Analytics
              </CardTitle>
              <CardDescription className="truncate text-gray-400">{linkData.custom_name || 'N/A'}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><strong className="text-muted-foreground block">Link URL:</strong> <a href={linkData.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{linkData.url}</a></div>
              <div><strong className="text-muted-foreground block">Created:</strong> {formatDate(linkData.created_at)}</div>
              <div><strong className="text-muted-foreground block">Total Views (Recorded):</strong> <span className="text-green-400 font-bold">{linkData.clicks || 0}</span></div>
              {linkData.expiry_date && <div><strong className="text-muted-foreground block">Expires:</strong> {formatDate(linkData.expiry_date)}</div>}
              {linkData.password && <div><strong className="text-muted-foreground block">Password Protected:</strong> <span className="text-green-400">Yes</span></div>}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 glass-effect border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center"><Eye className="mr-2 h-5 w-5 text-green-400" />Daily Views (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] md:h-[400px]">
                <Line data={viewsChartData} options={chartOptions} />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="glass-effect border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center"><MapPin className="mr-2 h-5 w-5 text-purple-400" />Views by Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Detailed geographic data is simulated. Full implementation requires advanced IP geolocation.</p>
                  <div className="mt-4 h-32 flex items-center justify-center rounded-md bg-white/5 border border-white/10">
                    <Globe className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center"><Smartphone className="mr-2 h-5 w-5 text-yellow-400" />Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Device type analytics are simulated. Full implementation requires user-agent parsing.</p>
                   <div className="mt-4 h-32 flex items-center justify-center rounded-md bg-white/5 border border-white/10">
                    <Smartphone className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DetailedAnalytics;