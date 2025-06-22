import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Edit, UserX, UserCheck, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import AdminActionDialog from '@/components/admin/AdminActionDialog';

const UserManagementTable = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    action: null,
    user: null,
    title: '',
    description: '',
    confirmText: '',
    confirmVariant: 'destructive'
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_users');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: 'Error Fetching Users',
        description: 'Could not retrieve user data. You may not have admin privileges.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [toast]);
  
  const openDialog = (action, user) => {
    let dialogDetails = {};
    const isSuspended = user.banned_until && new Date(user.banned_until) > new Date();
    
    switch (action) {
      case 'suspend':
        dialogDetails = {
          title: isSuspended ? 'Unsuspend User' : 'Suspend User',
          description: `Are you sure you want to ${isSuspended ? 'unsuspend' : 'suspend'} ${user.email}? ${isSuspended ? 'They will be able to log in again.' : 'They will no longer be able to log in.'}`,
          confirmText: isSuspended ? 'Yes, Unsuspend' : 'Yes, Suspend',
          confirmVariant: 'default'
        };
        break;
      case 'delete':
        dialogDetails = {
          title: 'Delete User',
          description: `Are you sure you want to permanently delete ${user.email}? This action is irreversible.`,
          confirmText: 'Yes, Delete Permanently',
          confirmVariant: 'destructive'
        };
        break;
      default:
        return;
    }
    
    setDialogState({ isOpen: true, action, user, ...dialogDetails });
  };
  
  const handleConfirmAction = async () => {
    const { action, user } = dialogState;
    if (!action || !user) return;

    setIsActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    try {
      let response;
      if (action === 'delete') {
        response = await supabase.functions.invoke('delete-user', {
          body: { user_id: user.id },
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      } else if (action === 'suspend') {
        const isCurrentlySuspended = user.banned_until && new Date(user.banned_until) > new Date();
        response = await supabase.functions.invoke('update-user-status', {
          body: { user_id: user.id, suspend: !isCurrentlySuspended },
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      }

      if (response.error) throw response.error;
      
      const successMessage = action === 'delete' ? 'User deleted successfully' : (dialogState.title);
      toast({ title: "Success", description: `${successMessage}.` });
      
      fetchUsers(); // Refresh the user list
    } catch (error) {
        toast({
          title: `Error ${action === 'delete' ? 'Deleting' : 'Updating'} User`,
          description: error.message || 'An unknown error occurred.',
          variant: 'destructive',
        });
    } finally {
      setIsActionLoading(false);
      setDialogState({ isOpen: false, action: null, user: null });
    }
  };

  const handleEditAction = (email) => {
    toast({
        title: '🚧 Edit Feature',
        description: `The "Edit User" feature is a work in progress. What user details would you like to be able to edit? Let us know in the next prompt!`,
        duration: 7000
    });
  };

  const UserRow = ({ user, index }) => {
    const isSuspended = user.banned_until && new Date(user.banned_until) > new Date();
    
    return (
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
        className="border-b border-slate-800"
      >
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.email}`} alt={user.email} />
              <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-slate-200">{user.email}</div>
              <div className="text-sm text-slate-400">ID: {user.id.substring(0, 8)}...</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-slate-300">
          {new Date(user.created_at).toLocaleDateString()}
        </TableCell>
        <TableCell className="text-slate-300">
          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
        </TableCell>
        <TableCell>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              isSuspended ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}
          >
            {isSuspended ? 'Suspended' : 'Active'}
          </span>
      </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
              <DropdownMenuItem onClick={() => handleEditAction(user.email)} className="cursor-pointer text-slate-300 hover:text-white">
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialog('suspend', user)} className="cursor-pointer text-slate-300 hover:text-white">
                {isSuspended ? <UserCheck className="mr-2 h-4 w-4 text-green-400" /> : <UserX className="mr-2 h-4 w-4 text-yellow-400" />}
                <span>{isSuspended ? 'Unsuspend' : 'Suspend'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700"/>
              <DropdownMenuItem onClick={() => openDialog('delete', user)} className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </motion.tr>
    );
  };

  return (
    <>
      <Card className="glassmorphic-card modern-border">
        <CardHeader>
          <CardTitle className="font-space-grotesk text-xl">User Management</CardTitle>
          <CardDescription>
            A live list of all registered users on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-700 hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><div className="h-10 w-48 bg-slate-700 rounded-md"></div></TableCell>
                      <TableCell><div className="h-6 w-24 bg-slate-700 rounded-md"></div></TableCell>
                      <TableCell><div className="h-6 w-32 bg-slate-700 rounded-md"></div></TableCell>
                      <TableCell><div className="h-6 w-20 bg-slate-700 rounded-full"></div></TableCell>
                      <TableCell><div className="h-8 w-8 bg-slate-700 rounded-md ml-auto"></div></TableCell>
                    </TableRow>
                  ))
                ) : users.length > 0 ? (
                  users.map((user, index) => <UserRow key={user.id} user={user} index={index} />)
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                      No users found or you may not have permission to view them.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <AdminActionDialog
        isOpen={dialogState.isOpen}
        onOpenChange={() => setDialogState({ isOpen: false, action: null, user: null })}
        onConfirm={handleConfirmAction}
        isLoading={isActionLoading}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
        confirmVariant={dialogState.confirmVariant}
      />
    </>
  );
};

export default UserManagementTable;