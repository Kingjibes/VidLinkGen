import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, Link2 as LinkIcon, BarChart3 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const StatCard = ({ title, value, icon: Icon, description, colorClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className={`glassmorphic-card modern-border ${colorClass || 'border-slate-700'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-100">{value}</div>
        {description && <p className="text-xs text-slate-400 pt-1">{description}</p>}
      </CardContent>
    </Card>
  </motion.div>
);

const AdminDashboardPage = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      try {
        // Fetch total users count
        // Note: Supabase count on auth.users might be restricted.
        // If this fails, an Edge Function with service_role key is needed.
        const { data: usersData, error: usersError } = await supabase
          .from('users_count_view') // Placeholder for a view if direct count is restricted
          .select('count')
          .single();


        if (usersError) {
            console.warn("Could not directly count users. This might require a view or Edge Function for full admin capabilities.", usersError);
            toast({
              title: "User Count Limited",
              description: "Could not fetch exact user count. Displaying 0.",
              variant: "default"
            });
            setTotalUsers(0); // Fallback
        } else {
            setTotalUsers(usersData?.count || 0);
        }


        // Fetch total links and clicks from video_links table
        const { data: linksData, error: linksError, count: linksCount } = await supabase
          .from('video_links')
          .select('clicks', { count: 'exact' });

        if (linksError) throw linksError;
        
        setTotalLinks(linksCount || 0);
        const sumClicks = linksData.reduce((acc, link) => acc + (link.clicks || 0), 0);
        setTotalClicks(sumClicks);

      } catch (error) {
        console.error("Error fetching admin stats:", error);
        toast({ title: "Error Fetching Stats", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, [toast]);


  return (
    <>
      <Helmet>
        <title>Admin Dashboard - VidLinkGen | CIPHERTECH</title>
        <meta name="description" content="Administrator dashboard for VidLinkGen. View site statistics and user activity." />
      </Helmet>
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-space-grotesk font-bold mb-2 text-gradient-blue-red">
                Admin Overview
              </h1>
              <p className="text-slate-400">
                Key metrics and statistics for VidLinkGen.
              </p>
            </motion.div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="glassmorphic-card modern-border animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                       <div className="h-5 w-5 bg-slate-700 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                       <div className="h-8 bg-slate-600 rounded w-1/2 mb-2"></div>
                       <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                  title="Total Registered Users" 
                  value={totalUsers} 
                  icon={Users} 
                  description="Number of users signed up."
                  colorClass="border-[hsl(var(--primary))]/50"
                />
                <StatCard 
                  title="Total Links Generated" 
                  value={totalLinks} 
                  icon={LinkIcon} 
                  description="All links created on the platform."
                  colorClass="border-[hsl(var(--accent))]/50"
                />
                <StatCard 
                  title="Total Link Clicks" 
                  value={totalClicks} 
                  icon={BarChart3} 
                  description="Aggregated clicks across all links."
                  colorClass="border-[hsl(var(--secondary))]/50"
                />
              </div>
            )}
            
            {/* Placeholder for future admin functionalities */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-12"
            >
              <Card className="glassmorphic-card modern-border">
                <CardHeader>
                  <CardTitle className="font-space-grotesk">More Admin Tools Coming Soon</CardTitle>
                  <CardDescription>
                    User management, detailed link reports, and site configuration settings will be available here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400">
                    🚧 This section is under active development. Stay tuned for updates!
                  </p>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboardPage;