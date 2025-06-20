import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession) {
        navigate('/dashboard');
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        navigate('/dashboard');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: 'Login Successful!', description: 'Welcome back! Redirecting to dashboard...' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`, 
        }
      });
      if (error) throw error;
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast({ title: 'Signup Failed', description: 'This email is already registered. Please try logging in.', variant: 'destructive' });
      } else {
        toast({ title: 'Signup Almost Done!', description: 'Account created! Please check your email to verify your account if needed, or try logging in.' });
        // Since email verification is off, we can attempt to navigate or suggest login
        // navigate('/auth'); // Or stay on page and switch to login tab
      }
    } catch (error) {
      toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (session) {
    return null; // Or a loading spinner while redirecting
  }

  return (
    <>
      <Helmet>
        <title>Login / Sign Up - VidLinkGen | CIPHERTECH</title>
        <meta name="description" content="Access your VidLinkGen account or create a new one to start generating secure video links." />
      </Helmet>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4 bg-gradient-to-br from-[hsl(var(--background))] via-transparent to-[hsl(var(--background))]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Card className="glassmorphic-card modern-border">
            <CardHeader className="text-center">
              <Link to="/" className="inline-block mb-4">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-lg flex items-center justify-center shadow-md mx-auto"
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-white font-bold text-2xl font-space-grotesk">V</span>
                </motion.div>
              </Link>
              <CardTitle className="text-3xl font-space-grotesk text-gradient-blue-red">
                Welcome to VidLinkGen
              </CardTitle>
              <CardDescription>
                Sign in or create an account to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                  <TabsTrigger value="login" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10 bg-[hsl(var(--input))] border-[hsl(var(--border))]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                       <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10 bg-[hsl(var(--input))] border-[hsl(var(--border))]"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 text-white py-3 text-base font-semibold" disabled={isLoading}>
                      {isLoading ? 'Logging In...' : 'Login'}
                      <LogIn className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                       <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10 bg-[hsl(var(--input))] border-[hsl(var(--border))]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Choose a strong password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10 bg-[hsl(var(--input))] border-[hsl(var(--border))]"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 text-white py-3 text-base font-semibold" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                      <UserPlus className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AuthPage;