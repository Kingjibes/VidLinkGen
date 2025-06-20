import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { PlusCircle, Search, Edit3, Trash2, ExternalLink, Eye, TrendingUp, ShieldCheck, CalendarOff, Copy as CopyIcon, AlertTriangle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle, AlertIcon, AlertCloseButton } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import LinkCustomizationForm from '@/components/generator/LinkCustomizationForm';

const DashboardHeader = ({ linkCount, onSearchChange, searchTerm, onNewLink }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col sm:flex-row justify-between items-center mb-8"
  >
    <div>
      <h1 className="text-3xl md:text-4xl font-space-grotesk font-bold mb-1 text-gradient-blue-red">
        My Video Links
      </h1>
      <p className="text-slate-400 text-sm">
        A list of all links you've generated. {linkCount} link(s) found.
      </p>
    </div>
    <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
      <div className="relative flex-grow sm:flex-grow-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          type="search" 
          placeholder="Search links..." 
          className="pl-10 w-full sm:w-64 bg-[hsl(var(--input))] border-[hsl(var(--border))]" 
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>
      <Button onClick={onNewLink} className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 text-white shrink-0">
        <PlusCircle className="w-4 h-4 mr-2" /> New Link
      </Button>
    </div>
  </motion.div>
);

const DevelopmentBanner = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
      <Alert variant="warning" className="glassmorphic-card-soft modern-border">
        <AlertIcon icon={AlertTriangle} className="text-yellow-500" />
        <AlertTitle className="font-space-grotesk text-yellow-400">Feature In Development</AlertTitle>
        <AlertDescription className="text-yellow-300/80">
          Link click/view simulated & stats updated. Actual redirect/playback not implemented yet for all scenarios.
        </AlertDescription>
        <AlertCloseButton onClick={onClose} className="text-yellow-400 hover:text-yellow-200" />
      </Alert>
    </motion.div>
  );
};

const LinkCard = ({ link, onEdit, onDelete, onCopy, onOpen }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="glassmorphic-card modern-border h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-space-grotesk text-xl break-all">
            {link.custom_name || link.short_code}
          </CardTitle>
          <div className="flex gap-1.5">
            {link.is_password_protected && <ShieldCheck className="w-4 h-4 text-green-400" title="Password Protected"/>}
            {link.expiration_date && new Date(link.expiration_date) < new Date() && <CalendarOff className="w-4 h-4 text-red-400" title="Expired"/>}
          </div>
        </div>
        <CardDescription className="text-xs text-slate-400 break-all truncate" title={link.description}>
            {link.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-xs text-primary font-mono break-all mb-1 cursor-pointer hover:underline" onClick={() => onCopy(link.url)} title="Click to copy">
            {link.url}
        </p>
        <p className="text-xs text-slate-500 mb-3">
          Created: {new Date(link.created_at).toLocaleDateString()}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
          <StatCard icon={Eye} label="Views" value={link.views || 0} color="text-sky-400" />
          <StatCard icon={TrendingUp} label="Clicks" value={link.clicks || 0} color="text-emerald-400" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t border-[hsl(var(--border))] pt-4 mt-auto">
        <Button variant="outline" size="icon" onClick={() => onOpen(link.url)} title="Open Link" className="border-sky-500/50 hover:bg-sky-500/10 text-sky-400">
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onCopy(link.url)} title="Copy Link" className="border-slate-500/50 hover:bg-slate-500/10 text-slate-400">
          <CopyIcon className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onEdit(link)} title="Edit Link" className="border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-400">
          <Edit3 className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onDelete(link)} title="Delete Link" className="border-red-500/50 hover:bg-red-500/10 text-red-400">
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center p-2 rounded text-xs ${color || 'text-slate-400'}`}>
    <Icon className="w-3.5 h-3.5 mr-1.5" />
    {value} {label}
  </div>
);

const EditLinkDialog = ({ isOpen, onOpenChange, currentLink, formData, onInputChange, onSubmit, isLoading }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="glassmorphic-card modern-border sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="font-space-grotesk">Edit Link Settings</DialogTitle>
        <DialogDescription>
          Update the customization options for your video link.
        </DialogDescription>
      </DialogHeader>
      {currentLink && (
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <LinkCustomizationForm
            formData={formData}
            onInputChange={onInputChange}
            isLoading={isLoading}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      )}
    </DialogContent>
  </Dialog>
);

const DeleteLinkDialog = ({ isOpen, onOpenChange, currentLink, onSubmit, isLoading }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="glassmorphic-card modern-border sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="font-space-grotesk text-red-500">Confirm Deletion</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this link? This action cannot be undone. 
          {currentLink?.storage_path && " The associated video file in storage will also be removed."}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
        </DialogClose>
        <Button variant="destructive" onClick={onSubmit} disabled={isLoading}>
          {isLoading ? 'Deleting...' : 'Yes, Delete Link'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const LoadingSkeletons = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="glassmorphic-card modern-border animate-pulse">
        <CardHeader>
          <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <div className="h-8 w-8 bg-slate-700 rounded"></div>
          <div className="h-8 w-8 bg-slate-700 rounded"></div>
          <div className="h-8 w-8 bg-slate-700 rounded"></div>
        </CardFooter>
      </Card>
    ))}
  </div>
);

const EmptyState = ({ isSearch, onNewLink }) => (
  <Card className="glassmorphic-card modern-border text-center py-12">
    <CardHeader>
      <CardTitle className="font-space-grotesk text-2xl">No Links Found</CardTitle>
      <CardDescription>
        {isSearch ? "No links match your search." : "You haven't created any links yet."}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button onClick={onNewLink} className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 text-white">
        <PlusCircle className="w-4 h-4 mr-2" /> Create Your First Link
      </Button>
    </CardContent>
  </Card>
);

const AccessDeniedState = ({ onLogin }) => (
  <Card className="glassmorphic-card modern-border text-center py-12">
    <CardHeader>
        <CardTitle className="font-space-grotesk text-2xl">Access Denied</CardTitle>
        <CardDescription>Please log in to view your dashboard and manage your links.</CardDescription>
    </CardHeader>
    <CardContent>
        <Button onClick={onLogin}>
            Login / Sign Up
        </Button>
    </CardContent>
  </Card>
);


const DashboardPage = () => {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState(null);
  const [editFormData, setEditFormData] = useState({
    customName: '',
    description: '',
    expirationDate: '',
    password: '',
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [showDevBanner, setShowDevBanner] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        toast({ title: "Authentication Error", description: "Could not verify user session.", variant: "destructive" });
        return;
      }
      setCurrentUser(session?.user || null);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user || null);
        if (!session?.user) {
          setLinks([]);
        }
      }
    );
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [toast]);

  const fetchLinks = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      setLinks([]); 
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('video_links')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Error fetching links:", error);
      toast({ title: "Error", description: "Could not fetch your links.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (currentUser) {
      fetchLinks();
    } else {
      setIsLoading(false);
      setLinks([]);
    }
  }, [currentUser, fetchLinks]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredLinks = links.filter(link => 
    (link.custom_name && link.custom_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    link.original_source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditDialog = (link) => {
    setCurrentLink(link);
    setEditFormData({
      customName: link.custom_name || '',
      description: link.description || '',
      expirationDate: link.expiration_date ? new Date(link.expiration_date).toISOString().slice(0, 16) : '',
      password: '', 
    });
    setIsEditDialogOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateLink = async (e) => {
    e.preventDefault();
    if (!currentLink) return;
    setIsLoading(true);

    const updateData = {
      custom_name: editFormData.customName || null,
      description: editFormData.description || null,
      expiration_date: editFormData.expirationDate || null,
      is_password_protected: !!editFormData.password,
    };
    
    if (editFormData.password) {
      updateData.password_hash = editFormData.password; 
      toast({
            title: "Security Notice",
            description: "Password stored as plain text. For production, use Supabase Edge Functions for secure hashing.",
            variant: "default",
            duration: 7000,
      });
    } else if (currentLink.is_password_protected && !editFormData.password) {
      updateData.password_hash = null;
      updateData.is_password_protected = false;
    }

    try {
      const { error } = await supabase
        .from('video_links')
        .update(updateData)
        .eq('id', currentLink.id);

      if (error) throw error;
      toast({ title: "Success!", description: "Link updated successfully.", className: "bg-green-600 text-white" });
      fetchLinks();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating link:", error);
      toast({ title: "Update Error", description: error.message || "Could not update link.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (link) => {
    setCurrentLink(link);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteLink = async () => {
    if (!currentLink) return;
    setIsLoading(true);
    try {
      if (currentLink.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('videos')
          .remove([currentLink.storage_path]);
        
        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          toast({ title: "Storage Warning", description: "Could not delete associated video file, but link record will be removed.", variant: "default" });
        }
      }

      const { error } = await supabase
        .from('video_links')
        .delete()
        .eq('id', currentLink.id);

      if (error) throw error;
      toast({ title: "Deleted!", description: "Link removed successfully." });
      fetchLinks();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting link:", error);
      toast({ title: "Delete Error", description: error.message || "Could not delete link.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async (linkUrl) => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      toast({ title: "Copied!", description: "Link copied to clipboard." });
    } catch (error) {
      toast({ title: "Copy Failed", description: "Could not copy link. Please try manually.", variant: "destructive" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - VidLinkGen | CIPHERTECH</title>
        <meta name="description" content="Manage all your generated video links. Edit, delete, and view stats for your VidLinkGen links." />
      </Helmet>
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <DashboardHeader 
              linkCount={filteredLinks.length} 
              onSearchChange={handleSearchChange} 
              searchTerm={searchTerm} 
              onNewLink={() => navigate('/generator')} 
            />
            <DevelopmentBanner show={showDevBanner} onClose={() => setShowDevBanner(false)} />

            {isLoading ? (
              <LoadingSkeletons />
            ) : !currentUser ? (
              <AccessDeniedState onLogin={() => navigate('/auth')} />
            ) : filteredLinks.length === 0 ? (
              <EmptyState isSearch={!!searchTerm} onNewLink={() => navigate('/generator')} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLinks.map((link) => (
                  <LinkCard 
                    key={link.id} 
                    link={link} 
                    onEdit={openEditDialog} 
                    onDelete={openDeleteDialog} 
                    onCopy={handleCopyToClipboard}
                    onOpen={(url) => window.open(url, '_blank')}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <EditLinkDialog 
        isOpen={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        currentLink={currentLink} 
        formData={editFormData} 
        onInputChange={handleEditInputChange} 
        onSubmit={handleUpdateLink} 
        isLoading={isLoading} 
      />
      <DeleteLinkDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        currentLink={currentLink} 
        onSubmit={handleDeleteLink} 
        isLoading={isLoading} 
      />
    </>
  );
};

export default DashboardPage;