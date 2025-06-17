import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Users, Crown, Shield, CalendarPlus, CalendarCheck, Trash2, Link as LinkIcon, Edit3, CheckCircle, MessageSquare, AlertTriangle, Mail, Tag, Settings } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import config from '@/config';
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogModalTitle, DialogDescription as DialogModalDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const AdminPanel = ({ user: adminUser }) => {
  const [users, setUsers] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState('');
  const [selectedTicketStatus, setSelectedTicketStatus] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const { toast } = useToast();

  const loadUsersWithLinkCounts = async () => {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });

    if (profileError) {
      toast({ title: "Error loading users", description: profileError.message, variant: "destructive" });
      return;
    }

    const usersWithCounts = await Promise.all(profiles.map(async (profile) => {
      const { count, error: countError } = await supabase
        .from('video_links')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id);
      return { ...profile, link_count: countError ? 0 : count };
    }));
    setUsers(usersWithCounts);
  };

  const loadSupportTickets = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Error loading support tickets", description: error.message, variant: "destructive" });
    } else {
      setSupportTickets(data);
    }
  };

  useEffect(() => {
    if (adminUser?.role === 'admin') {
      if (activeTab === 'users') {
        loadUsersWithLinkCounts();
      } else if (activeTab === 'support') {
        loadSupportTickets();
      }
    }
  }, [adminUser, activeTab, toast]);

  const openEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setSelectedPlanForModal(userToEdit.premium_tier || '');
  };
  const closeEditModal = () => setEditingUser(null);

  const openTicketModal = (ticketToEdit) => {
    setEditingTicket(ticketToEdit);
    setSelectedTicketStatus(ticketToEdit.status);
  };
  const closeTicketModal = () => setEditingTicket(null);

  const handleAssignOrUpdatePremium = async () => {
    if (!editingUser || !selectedPlanForModal) return;
    
    const planKey = selectedPlanForModal; // This is now e.g., "individual_yearly"
    const plan = config.premiumPrices[planKey];

    if (!plan) return toast({ title: "Error", description: "Invalid plan selected.", variant: "destructive" });

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + plan.durationMonths);

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ is_premium: true, premium_tier: plan.tierName, premium_expiry_date: expiryDate.toISOString() })
      .eq('id', editingUser.id).select().single();

    if (error) toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    else {
      const { count } = await supabase.from('video_links').select('id', { count: 'exact', head: true }).eq('user_id', updatedProfile.id);
      setUsers(users.map(u => (u.id === editingUser.id ? { ...updatedProfile, link_count: count || 0 } : u)));
      toast({ title: "Success", description: `${plan.label} assigned to ${updatedProfile.name}. Expires: ${expiryDate.toLocaleDateString()}` });
      closeEditModal();
    }
  };

  const handleExtendPremium = async () => {
    if (!editingUser?.premium_tier || !editingUser?.premium_expiry_date) return toast({ title: "Error", description: "No active plan to extend.", variant: "destructive" });
    
    // Find the plan key that matches the user's current tier for extension.
    // This assumes the user's premium_tier matches one of the main tierNames (individual, team).
    // We need to decide if extension defaults to monthly or yearly. Let's assume monthly for now.
    let planToExtendKey = Object.keys(config.premiumPrices).find(key => config.premiumPrices[key].tierName === editingUser.premium_tier && key.includes('_monthly'));
    
    // If no monthly key found (e.g., tier is just "legacy_premium" or something custom), try finding a yearly one
    if(!planToExtendKey){
        planToExtendKey = Object.keys(config.premiumPrices).find(key => config.premiumPrices[key].tierName === editingUser.premium_tier && key.includes('_yearly'));
    }
    // If still not found, or if you want to allow extending with any plan of the same tier, this logic might need to be more flexible
    // For now, if no specific key found, we can't reliably get durationMonths.
    if (!planToExtendKey) return toast({ title: "Error", description: "User's current plan configuration for extension not found.", variant: "destructive" });

    const plan = config.premiumPrices[planToExtendKey];
    if (!plan) return toast({ title: "Error", description: "User's current plan configuration is invalid.", variant: "destructive" });
    
    const newExpiryDate = new Date(editingUser.premium_expiry_date);
    newExpiryDate.setMonth(newExpiryDate.getMonth() + plan.durationMonths);

    const { data: updatedProfile, error } = await supabase
      .from('profiles').update({ premium_expiry_date: newExpiryDate.toISOString() })
      .eq('id', editingUser.id).select().single();
    
    if (error) toast({ title: "Extension Failed", description: error.message, variant: "destructive" });
    else {
      const { count } = await supabase.from('video_links').select('id', { count: 'exact', head: true }).eq('user_id', updatedProfile.id);
      setUsers(users.map(u => (u.id === editingUser.id ? { ...updatedProfile, link_count: count || 0 } : u)));
      toast({ title: "Success", description: `Subscription for ${updatedProfile.name} extended. New Expiry: ${newExpiryDate.toLocaleDateString()}` });
      closeEditModal();
    }
  };

  const handleRevokePremium = async () => {
    if (!editingUser) return;
    const { data: updatedProfile, error } = await supabase
      .from('profiles').update({ is_premium: false, premium_tier: null, premium_expiry_date: null })
      .eq('id', editingUser.id).select().single();

    if (error) toast({ title: "Revoke Failed", description: error.message, variant: "destructive" });
    else {
      const { count } = await supabase.from('video_links').select('id', { count: 'exact', head: true }).eq('user_id', updatedProfile.id);
      setUsers(users.map(u => (u.id === editingUser.id ? { ...updatedProfile, link_count: count || 0 } : u)));
      toast({ title: "Success", description: `Premium access revoked for ${updatedProfile.name}.` });
      closeEditModal();
    }
  };

  const handleUpdateTicketStatus = async () => {
    if (!editingTicket || !selectedTicketStatus) return;
    const { data: updatedTicket, error } = await supabase
      .from('support_tickets')
      .update({ status: selectedTicketStatus })
      .eq('id', editingTicket.id)
      .select()
      .single();
    
    if (error) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } else {
      setSupportTickets(prevTickets => prevTickets.map(t => t.id === editingTicket.id ? updatedTicket : t));
      toast({ title: "Success", description: `Ticket status updated to ${selectedTicketStatus}.` });
      closeTicketModal();
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-500/20 text-red-300 border-red-500/50">High</Badge>;
      case 'normal': return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">Normal</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
     switch (status) {
      case 'open': return <Badge className="bg-green-500/20 text-green-300 border-green-500/50">Open</Badge>;
      case 'in progress': return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">In Progress</Badge>;
      case 'resolved': return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">Resolved</Badge>;
      case 'closed': return <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 border-gray-500/50">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };


  if (adminUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-space-pattern pt-24 pb-12 flex items-center justify-center">
        <Card className="glass-effect border-red-500/30 w-full max-w-md mx-4">
          <CardHeader><CardTitle className="text-red-500">Access Denied</CardTitle></CardHeader>
          <CardContent><p>You do not have permission to view this page.</p></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-pattern pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-gradient mb-2">Admin Panel</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/50 border border-white/10">
              <TabsTrigger value="users" className="flex items-center space-x-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
                <Users className="h-4 w-4" /><span>User Management</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center space-x-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300">
                <MessageSquare className="h-4 w-4" /><span>Support Tickets</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-xl md:text-2xl">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                    <span>Registered Users ({users.length})</span>
                  </CardTitle>
                  <CardDescription>Manage premium subscriptions and view user activity.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((u) => (
                      <motion.div key={u.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: users.indexOf(u) * 0.05 }}
                        className="p-4 rounded-lg bg-gradient-to-br from-background/80 to-background/60 border border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-lg truncate flex items-center">
                            {u.name}
                            {u.role === 'admin' && <Shield className="h-4 w-4 text-blue-400 ml-2 shrink-0" title="Admin User" />}
                          </p>
                          {u.is_premium ? (
                             <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              {Object.values(config.premiumPrices).find(p => p.tierName === u.premium_tier)?.label.split(' ')[0] || u.premium_tier?.replace('_', ' ') || 'Premium'}
                            </Badge>
                          ) : <Badge variant="outline" className="text-xs">Free User</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground break-all mb-1">{u.email}</p>
                        <p className="text-xs text-muted-foreground mb-3"><LinkIcon className="inline h-3 w-3 mr-1" /> Links: {u.link_count ?? 0}</p>
                        {u.is_premium && u.premium_expiry_date && <p className="text-xs text-yellow-400 mb-3">Expires: {formatDate(u.premium_expiry_date)}</p>}
                        <Button onClick={() => openEditModal(u)} size="sm" className="w-full text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30" disabled={u.role === 'admin'}>
                          <Edit3 className="h-3 w-3 mr-1" /> Manage Subscription
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="support">
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-xl md:text-2xl">
                    <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                    <span>Support Tickets ({supportTickets.filter(t => t.status === 'open' || t.status === 'in progress').length} Active)</span>
                  </CardTitle>
                  <CardDescription>View and manage user support requests.</CardDescription>
                </CardHeader>
                <CardContent>
                  {supportTickets.length === 0 ? <p className="text-muted-foreground">No support tickets found.</p> : (
                    <div className="space-y-4">
                      {supportTickets.map(ticket => (
                        <motion.div key={ticket.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: supportTickets.indexOf(ticket) * 0.05 }}
                          className="p-4 rounded-lg bg-background/70 border border-white/10 hover:border-green-500/30 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                            <h4 className="font-semibold text-lg text-green-300 truncate">{ticket.subject}</h4>
                            <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                              {getPriorityBadge(ticket.priority)}
                              {getStatusBadge(ticket.status)}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1"><Mail className="inline h-3 w-3 mr-1" /> {ticket.user_email}</p>
                          <p className="text-xs text-muted-foreground mb-3"><CalendarCheck className="inline h-3 w-3 mr-1" /> Submitted: {formatDate(ticket.created_at)}</p>
                          <p className="text-sm mb-3 whitespace-pre-wrap">{ticket.message}</p>
                          <Button onClick={() => openTicketModal(ticket)} size="sm" variant="outline" className="text-xs border-green-500/50 text-green-400 hover:bg-green-500/10">
                            <Settings className="h-3 w-3 mr-1" /> Manage Ticket
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={(isOpen) => !isOpen && closeEditModal()}>
          <DialogContent className="glass-effect border-yellow-500/30">
            <DialogHeader>
              <DialogModalTitle className="text-gradient font-orbitron">Manage Subscription</DialogModalTitle>
              <DialogModalDescription>For user: <span className="font-semibold">{editingUser.name}</span> ({editingUser.email})</DialogModalDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Select Plan to Assign/Update:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(config.premiumPrices).map(([planKey, plan]) => (
                    <Button key={planKey} variant="outline"
                      className={cn("flex flex-col items-start p-3 h-auto text-left transition-all duration-200 border-white/20 hover:border-yellow-500/50", selectedPlanForModal === planKey && "border-yellow-500 ring-2 ring-yellow-500 bg-yellow-500/10")}
                      onClick={() => setSelectedPlanForModal(planKey)} disabled={editingUser.role === 'admin'}>
                      <div className="flex justify-between w-full items-center">
                        <span className="font-semibold text-sm">{plan.label}</span>
                        {selectedPlanForModal === planKey && <CheckCircle className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{plan.display} - {plan.durationMonths} month(s)</span>
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAssignOrUpdatePremium} className="w-full text-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white" disabled={!selectedPlanForModal || editingUser.role === 'admin'}>
                <CalendarPlus className="h-4 w-4 mr-2" /> Assign/Update to Selected Plan
              </Button>
              {editingUser.is_premium && editingUser.premium_tier && editingUser.premium_expiry_date && (
                <Button onClick={handleExtendPremium} variant="outline" className="w-full text-sm border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300" disabled={editingUser.role === 'admin'}>
                  <CalendarCheck className="h-4 w-4 mr-2" /> Extend Current Plan ({Object.values(config.premiumPrices).find(p=>p.tierName === editingUser.premium_tier)?.label.split(' ')[0] || editingUser.premium_tier})
                </Button>
              )}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
              {editingUser.is_premium && <Button onClick={handleRevokePremium} variant="destructive" className="w-full sm:w-auto text-sm" disabled={editingUser.role === 'admin'}><Trash2 className="h-4 w-4 mr-2" /> Revoke Premium</Button>}
              <Button variant="outline" onClick={closeEditModal} className="w-full sm:w-auto text-sm">Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {editingTicket && (
        <Dialog open={!!editingTicket} onOpenChange={(isOpen) => !isOpen && closeTicketModal()}>
          <DialogContent className="glass-effect border-green-500/30">
            <DialogHeader>
              <DialogModalTitle className="text-gradient font-orbitron">Manage Support Ticket</DialogModalTitle>
              <DialogModalDescription>Ticket ID: <span className="font-semibold">{editingTicket.id.substring(0,8)}...</span></DialogModalDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p><strong className="text-muted-foreground">User:</strong> {editingTicket.user_email}</p>
              <p><strong className="text-muted-foreground">Subject:</strong> {editingTicket.subject}</p>
              <p className="whitespace-pre-wrap"><strong className="text-muted-foreground">Message:</strong> {editingTicket.message}</p>
              <div className="space-y-2">
                <Label htmlFor="ticket-status" className="text-muted-foreground">Update Status</Label>
                <Select value={selectedTicketStatus} onValueChange={setSelectedTicketStatus}>
                  <SelectTrigger id="ticket-status" className="w-full bg-background/80 border-white/20">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-white/20">
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={closeTicketModal}>Cancel</Button>
              <Button onClick={handleUpdateTicketStatus} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">Update Status</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPanel;