import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, Link2 as LinkIcon, BarChart3, UserCheck, UserX, Clock, LineChart } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import UserManagementTable from '@/components/admin/UserManagementTable';

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

  const otherFeatures = [
    { icon: LineChart, title: "Detailed Link Reports", description: "In-depth analytics for individual links." },
    { icon: Clock, title: "Audit Logs", description: "Track important actions performed by users." },
  ];

  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('users_count_view')
          .select('count')
          .single();
        if (usersError) throw usersError;
        setTotalUsers(usersData?.count || 0);

        const { data: linksData, error: linksError, count: linksCount } = await supabase
          .from('video_links')
          .select('clicks', { count: 'exact' });
        if (linksError) throw linksError;
        setTotalLinks(linksCount || 0);
        const sumClicks = linksData.reduce((acc, link) => acc + (link.clicks || 0), 0);
        setTotalClicks(sumClicks);

      } catch (error) {
        console.error("Error fetching admin stats:", error);
        toast({ title: "Error Fetching Stats", description: "This can happen if you are not authorized to view admin data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminStats();
  }, [toast]);

  const loadingSkeletons = (
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
  );

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - VidLinkGen | CIPHERTECH</title>
        <meta name="description" content="Administrator dashboard for VidLinkGen. View site statistics and manage users." />
      </Helmet>
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-space-grotesk font-bold mb-2 text-gradient-blue-red">
                Admin Dashboard
              </h1>
              <p className="text-slate-400">
                Platform metrics, user management, and administrative tools.
              </p>
            </motion.div>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:w-[400px] md:grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
                <TabsTrigger value="logs" disabled>Logs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                {isLoading ? loadingSkeletons : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <StatCard title="Total Registered Users" value={totalUsers} icon={Users} description="Number of users signed up." colorClass="border-[hsl(var(--primary))]/50" />
                    <StatCard title="Total Links Generated" value={totalLinks} icon={LinkIcon} description="All links created on the platform." colorClass="border-[hsl(var(--accent))]/50" />
                    <StatCard title="Total Link Clicks" value={totalClicks} icon={BarChart3} description="Aggregated clicks across all links." colorClass="border-[hsl(var(--secondary))]/50" />
                  </div>
                )}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-12"
                >
                    <Card className="glassmorphic-card modern-border">
                        <CardHeader>
                            <CardTitle className="font-space-grotesk">Upcoming Admin Tools</CardTitle>
                            <CardDescription>
                                Here's a look at other powerful features in development for the admin panel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {otherFeatures.map((feature, index) => (
                              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-slate-800/30">
                                <div className="p-2 bg-slate-700/50 rounded-full">
                                  <feature.icon className="w-5 h-5 text-[hsl(var(--primary))]" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-200">{feature.title}</p>
                                  <p className="text-sm text-slate-400">{feature.description}</p>
                                </div>
                              </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="users">
                <UserManagementTable />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboardPage;