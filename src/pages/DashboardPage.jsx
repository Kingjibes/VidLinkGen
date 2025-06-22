import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import LinkCard from '@/components/dashboard/LinkCard';
import EditLinkDialog from '@/components/dashboard/EditLinkDialog';
import DeleteLinkDialog from '@/components/dashboard/DeleteLinkDialog';
import QRCodeDialog from '@/components/dashboard/QRCodeDialog';
import FeaturedLinkCard from '@/components/dashboard/FeaturedLinkCard';
import { LoadingSkeletons, EmptyState, AccessDeniedState } from '@/components/dashboard/DashboardStates';

const DashboardPage = () => {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isQrCodeDialogOpen, setIsQrCodeDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState(null);
  const [editFormData, setEditFormData] = useState({
    customName: '',
    description: '',
    expirationDate: '',
    password: '',
  });
  const [currentUser, setCurrentUser] = useState(null);
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

  const filteredLinks = useMemo(() => links.filter(link => 
    (link.custom_name && link.custom_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    link.original_source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.url.toLowerCase().includes(searchTerm.toLowerCase())
  ), [links, searchTerm]);

  const featuredLink = useMemo(() => {
    if (links.length === 0) return null;
    return [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];
  }, [links]);

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

  const openQrCodeDialog = (link) => {
    setCurrentLink(link);
    setIsQrCodeDialogOpen(true);
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
    } catch (error)
    {
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
            
            {isLoading ? (
              <LoadingSkeletons />
            ) : !currentUser ? (
              <AccessDeniedState onLogin={() => navigate('/auth')} />
            ) : links.length === 0 ? (
              <EmptyState isSearch={!!searchTerm} onNewLink={() => navigate('/generator')} />
            ) : (
              <>
                <FeaturedLinkCard link={featuredLink} onOpen={(url) => window.open(url, '_blank')} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {filteredLinks.map((link) => (
                    <LinkCard 
                      key={link.id} 
                      link={link} 
                      onEdit={openEditDialog} 
                      onDelete={openDeleteDialog} 
                      onCopy={handleCopyToClipboard}
                      onOpen={(url) => window.open(url, '_blank')}
                      onQrCode={openQrCodeDialog}
                    />
                  ))}
                </div>
              </>
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
      <QRCodeDialog
        isOpen={isQrCodeDialogOpen}
        onOpenChange={setIsQrCodeDialogOpen}
        link={currentLink}
      />
    </>
  );
};

export default DashboardPage;