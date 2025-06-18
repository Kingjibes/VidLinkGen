import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

const Auth = ({ setUserState, setCurrentView, onSuccessfulRegister, processUserProfile }) => {
  const [authData, setAuthData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!authData.email || !authData.password) {
      toast({ title: "Login Failed", description: "Please enter both email and password.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authData.email,
        password: authData.password,
      });

      if (error) {
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      } else if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        setUserState(processUserProfile({ ...data.user, ...profile }));
        setAuthData({ email: '', password: '', name: '' });
        setCurrentView('dashboard');
        toast({ title: "Login Successful!", description: `Welcome back, ${profile?.name || 'User'}!`, variant: "default" });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast({ title: "Login Failed", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!authData.name || !authData.email || !authData.password) {
      toast({ title: "Registration Failed", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    if (authData.password.length < 6) {
      toast({ title: "Registration Failed", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // Check if email exists in auth.users table
      const { data: { users }, error: authCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authData.email);

      if (authCheckError && authCheckError.code !== 'PGRST116') {
        console.error('Auth check error:', authCheckError);
        toast({ title: "Registration Failed", description: "Error checking email availability.", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (users && users.length > 0) {
        toast({ 
          title: "Registration Failed", 
          description: "This email address is already registered. Please use a different email or try logging in.", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      // Register the user
      const { data, error } = await supabase.auth.signUp({
        email: authData.email,
        password: authData.password,
        options: {
          data: {
            name: authData.name,
          }
        }
      });

      if (error) {
        toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      // Create profile in profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: authData.name,
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast({ 
            title: "Profile Creation Failed", 
            description: "Account was created but profile setup failed. Please contact support.", 
            variant: "destructive" 
          });
          setLoading(false);
          return;
        }

        // Clear form data
        setAuthData({ email: '', password: '', name: '' });
        
        if (!data.session) {
          // Email verification required
          toast({ 
            title: "Registration Successful!", 
            description: "Please check your email to verify your account before logging in.", 
            variant: "default" 
          });
        } else {
          // Immediate login after registration
          const processedUser = processUserProfile({ 
            ...data.user, 
            name: authData.name,
            email: data.user.email
          });
          
          setUserState(processedUser);
          toast({ 
            title: "Registration Successful!", 
            description: "Your account has been created successfully!", 
            variant: "default" 
          });
          onSuccessfulRegister(processedUser);
          setCurrentView('dashboard');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast({ title: "Registration Failed", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-pattern pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-4"
      >
        <Card className="glass-effect border-white/20 cyber-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-orbitron text-gradient">
              Join VidLinkGen
            </CardTitle>
            <CardDescription>
              Login or create an account to start generating secure links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input 
                    id="email-login" 
                    type="email" 
                    value={authData.email} 
                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })} 
                    placeholder="Enter your email" 
                    disabled={loading} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <Input 
                    id="password-login" 
                    type="password" 
                    value={authData.password} 
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })} 
                    placeholder="Enter your password" 
                    disabled={loading} 
                  />
                </div>
                <Button onClick={handleLogin} className="w-full cyber-glow" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </TabsContent>
              <TabsContent value="register" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name-reg">Name</Label>
                  <Input 
                    id="name-reg" 
                    value={authData.name} 
                    onChange={(e) => setAuthData({ ...authData, name: e.target.value })} 
                    placeholder="Enter your name" 
                    disabled={loading} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-reg">Email</Label>
                  <Input 
                    id="email-reg" 
                    type="email" 
                    value={authData.email} 
                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })} 
                    placeholder="Enter your email" 
                    disabled={loading} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-reg">Password</Label>
                  <Input 
                    id="password-reg" 
                    type="password" 
                    value={authData.password} 
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })} 
                    placeholder="Create a password (min 6 characters)" 
                    disabled={loading} 
                  />
                </div>
                <Button onClick={handleRegister} className="w-full cyber-glow" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
