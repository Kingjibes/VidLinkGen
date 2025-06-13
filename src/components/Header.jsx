
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Shield, Video, Menu, X, Crown, UserCog } from 'lucide-react';

const Header = ({ user, setUser, currentView, setCurrentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setCurrentView('home');
    if (error) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive"});
    } else {
      toast({
        title: "Logged out",
        description: "See you next time!"
      });
    }
    setIsMenuOpen(false);
  };
  
  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  }

  return (
    <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <motion.div className="flex items-center space-x-2 md:space-x-3 cursor-pointer" onClick={() => handleNavClick('home')} whileHover={{ scale: 1.05 }}>
            <div className="relative"><Video className="h-7 w-7 md:h-8 md:w-8 text-blue-500" /><Shield className="h-3 w-3 md:h-4 md:w-4 text-red-500 absolute -top-1 -right-1" /></div>
            <div><h1 className="text-lg md:text-xl font-orbitron font-bold text-gradient">VidLinkGen</h1><p className="text-xs text-muted-foreground">Powered by CIPHERTECH</p></div>
          </motion.div>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Button variant={currentView === 'home' ? 'default' : 'ghost'} onClick={() => handleNavClick('home')} className="font-medium text-sm lg:text-base">Home</Button>
            {user && <Button variant={currentView === 'dashboard' ? 'default' : 'ghost'} onClick={() => handleNavClick('dashboard')} className="font-medium text-sm lg:text-base">Dashboard</Button>}
            <Button variant={currentView === 'features' ? 'default' : 'ghost'} onClick={() => handleNavClick('features')} className="font-medium text-sm lg:text-base">Features</Button>
            {user?.role === 'admin' && <Button variant={currentView === 'admin' ? 'default' : 'ghost'} onClick={() => handleNavClick('admin')} className="font-medium flex items-center text-sm lg:text-base"><UserCog className="h-4 w-4 mr-1 lg:mr-2" />Admin</Button>}
          </nav>
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="flex items-center space-x-1 lg:space-x-2"><span className="text-xs lg:text-sm font-medium truncate max-w-[100px] lg:max-w-[150px]">{user.name}</span>{user.is_premium && <Crown className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-500" />}</div>
                <Button variant="outline" onClick={handleLogout} size="sm" className="text-xs lg:text-sm">Logout</Button>
              </div>
            ) : (
              <Button className="cyber-glow text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2" onClick={() => handleNavClick('auth')}>Get Started</Button>
            )}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</Button>
        </div>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-4 space-y-3 border-t border-white/10 pt-4">
            <Button variant={currentView === 'home' ? 'default' : 'ghost'} onClick={() => handleNavClick('home')} className="w-full justify-start text-base py-3">Home</Button>
            {user && <Button variant={currentView === 'dashboard' ? 'default' : 'ghost'} onClick={() => handleNavClick('dashboard')} className="w-full justify-start text-base py-3">Dashboard</Button>}
            <Button variant={currentView === 'features' ? 'default' : 'ghost'} onClick={() => handleNavClick('features')} className="w-full justify-start text-base py-3">Features</Button>
            {user?.role === 'admin' && <Button variant={currentView === 'admin' ? 'default' : 'ghost'} onClick={() => handleNavClick('admin')} className="w-full justify-start flex items-center text-base py-3"><UserCog className="h-5 w-5 mr-2"/>Admin Panel</Button>}
            {user ? (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <span className="text-sm font-medium truncate">{user.name}</span>
                  {user.is_premium && <Crown className="h-4 w-4 text-yellow-500" />}
                </div>
                <Button variant="outline" onClick={handleLogout} className="w-full text-base py-3">Logout</Button>
              </div>
            ) : (
              <Button className="w-full cyber-glow text-base py-3" onClick={() => handleNavClick('auth')}>Get Started</Button>
            )}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
