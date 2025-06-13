
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  Video, 
  Eye, 
  Calendar, 
  Lock, 
  Copy, 
  Trash2, 
  Edit, 
  BarChart3, 
  Globe, 
  Shield,
  Crown,
  TrendingUp,
  Users,
  Clock,
  UserCog
} from 'lucide-react';

const Dashboard = ({ user, setCurrentView }) => {
  const [videoLinks, setVideoLinks] = useState([]);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    thisMonth: 0,
    activeLinks: 0
  });

  useEffect(() => {
    if (user) {
      loadVideoLinks();
    }
  }, [user]);

  const loadVideoLinks = async () => {
    const { data: links, error } = await supabase
      .from('video_links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error fetching links", description: error.message, variant: "destructive" });
      return;
    }

    setVideoLinks(links);
    
    const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const thisMonth = links.filter(link => {
      const linkDate = new Date(link.created_at);
      const now = new Date();
      return linkDate.getMonth() === now.getMonth() && linkDate.getFullYear() === now.getFullYear();
    }).length;
    
    const activeLinks = links.filter(link => {
      if (!link.expiry_date) return true;
      return new Date(link.expiry_date) > new Date();
    }).length;

    setStats({
      totalLinks: links.length,
      totalClicks,
      thisMonth,
      activeLinks
    });
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard"
    });
  };

  const deleteLink = async (id) => {
    const { error } = await supabase
      .from('video_links')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error deleting link", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Link deleted",
        description: "Video link has been removed"
      });
      loadVideoLinks();
    }
  };

  const editLink = (id) => {
    toast({
      title: "🚧 Link editing isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const viewAnalytics = (id) => {
    toast({
      title: "🚧 Detailed analytics isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-space-pattern pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-gradient mb-2">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name || 'User'}
              </p>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
                {user?.is_premium && (
                  <Badge className="premium-badge text-sm md:text-lg px-3 py-1 md:px-4 md:py-2">
                    <Crown className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Premium User
                  </Badge>
                )}
                {user?.role === 'admin' && (
                  <Button onClick={() => setCurrentView('admin')} size="sm" className="text-xs md:text-sm">
                    <UserCog className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" /> Admin Panel
                  </Button>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {[
              { title: "Total Links", value: stats.totalLinks, icon: Video, color: "text-blue-400", iconColor: "text-blue-500" },
              { title: "Total Views", value: stats.totalClicks, icon: Eye, color: "text-green-400", iconColor: "text-green-500" },
              { title: "This Month", value: stats.thisMonth, icon: TrendingUp, color: "text-purple-400", iconColor: "text-purple-500" },
              { title: "Active Links", value: stats.activeLinks, icon: Globe, color: "text-red-400", iconColor: "text-red-500" },
            ].map((stat, idx) => (
              <Card key={idx} className="stats-card">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">{stat.title}</p>
                      <p className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <stat.icon className={`h-6 w-6 md:h-8 md:w-8 ${stat.iconColor}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl md:text-2xl">
                <Video className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                <span>Your Video Links</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {videoLinks.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold mb-2">No video links yet</h3>
                  <p className="text-muted-foreground mb-4 text-sm md:text-base">
                    Start by generating your first secure video link
                  </p>
                  <Button className="cyber-glow text-sm md:text-base" onClick={() => setCurrentView('home')}>
                    <Video className="h-4 w-4 mr-2" />
                    Generate Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {videoLinks.map((link) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 md:p-4 rounded-lg border ${
                        isExpired(link.expiry_date) 
                          ? 'border-red-500/30 bg-red-500/5' 
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-start justify-between">
                        <div className="flex-1 mb-3 md:mb-0 md:mr-4">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base md:text-lg break-all">{link.custom_name}</h3>
                            {link.password && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Protected
                              </Badge>
                            )}
                            {link.is_encrypted && (
                              <Badge className="premium-badge text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Encrypted
                              </Badge>
                            )}
                            {isExpired(link.expiry_date) && (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs md:text-sm text-muted-foreground mb-2 break-all">
                            {link.description || 'No description'}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Created {formatDate(link.created_at)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{link.clicks || 0} views</span>
                            </span>
                            {link.expiry_date && (
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Expires {formatDate(link.expiry_date)}</span>
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-2 p-2 bg-background/50 rounded text-xs font-mono break-all">
                            {link.url}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 self-start md:self-center">
                          <Button size="icon" variant="outline" onClick={() => copyLink(link.url)} className="h-8 w-8 md:h-9 md:w-9">
                            <Copy className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => viewAnalytics(link.id)} className="h-8 w-8 md:h-9 md:w-9">
                            <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => editLink(link.id)} className="h-8 w-8 md:h-9 md:w-9">
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => deleteLink(link.id)} className="text-red-400 hover:text-red-300 h-8 w-8 md:h-9 md:w-9">
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
