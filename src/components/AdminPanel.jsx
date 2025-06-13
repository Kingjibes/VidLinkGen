
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Users, Crown, Shield } from 'lucide-react';

const AdminPanel = ({ user }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      toast({ title: "Error fetching users", description: error.message, variant: 'destructive' });
    } else {
      setUsers(data);
    }
  };

  const togglePremium = async (userId, currentStatus) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_premium: !currentStatus })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setUsers(users.map(u => (u.id === userId ? data : u)));
      toast({
        title: "Permissions Updated",
        description: `User ${data.name}'s premium status has been changed.`
      });
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-space-pattern pt-24 pb-12 flex items-center justify-center">
        <Card className="glass-effect border-red-500/30 w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-pattern pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-gradient mb-2">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">User Management</p>
          </div>

          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl md:text-2xl">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                <span>Registered Users</span>
              </CardTitle>
              <CardDescription>
                Grant or revoke premium access for users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((u) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: users.indexOf(u) * 0.1 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="mb-3 md:mb-0">
                      <p className="font-semibold flex items-center text-base md:text-lg">
                        {u.name}
                        {u.role === 'admin' && (
                          <Shield className="h-4 w-4 text-blue-400 ml-2" />
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground break-all">{u.email}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Label htmlFor={`premium-switch-${u.id}`} className="flex items-center text-sm md:text-base">
                        <Crown className="h-4 w-4 text-yellow-500 mr-2" />
                        Premium
                      </Label>
                      <Switch
                        id={`premium-switch-${u.id}`}
                        checked={u.is_premium}
                        onCheckedChange={() => togglePremium(u.id, u.is_premium)}
                        disabled={u.role === 'admin'}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;
