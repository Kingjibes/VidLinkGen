
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserCircle, Crown, Menu, X, Shield, MessageSquare, Home, Tv2, Info, LayoutDashboard } from 'lucide-react';
import config from '@/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

const Header = ({ user, setUser, currentView, setCurrentView, triggerPremiumModal, triggerSupportModal }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Logout Error", description: error.message, variant: "destructive" });
    } else {
      setUser(null);
      setCurrentView('home');
      toast({ title: "Logged Out", description: "You have been successfully logged out.", variant: "default" });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', view: 'home', icon: Home },
    { name: 'Generator', view: 'home', icon: Tv2, section: 'video-generator-section' },
    { name: 'Features', view: 'features', icon: Info },
  ];

  const handleNavClick = (view, section) => {
    setCurrentView(view);
    if (section && view === 'home') {
      setTimeout(() => { 
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 50, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-lg border-b border-white/10"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div
          onClick={() => handleNavClick('home')}
          className="text-2xl font-orbitron font-bold text-gradient cursor-pointer"
        >
          {config.siteName}
        </div>

        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant={currentView === item.view && !item.section ? "secondary" : "ghost"}
              onClick={() => handleNavClick(item.view, item.section)}
              className="font-semibold text-sm hover:text-blue-400 transition-colors"
            >
              <item.icon className="mr-2 h-4 w-4" /> {item.name}
            </Button>
          ))}
          {user && user.is_premium && (
             <Button variant="ghost" onClick={triggerSupportModal} className="font-semibold text-sm hover:text-blue-400 transition-colors">
                <MessageSquare className="mr-2 h-4 w-4" /> Support
            </Button>
          )}
        </nav>

        <div className="flex items-center space-x-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 h-9 w-9 md:h-10 md:w-10 hover:bg-primary/10 focus-visible:ring-1 focus-visible:ring-primary">
                   {user.is_premium && <Crown className="absolute top-0 right-0 h-3 w-3 text-yellow-500 transform translate-x-1/4 -translate-y-1/4" />}
                  <UserCircle className="h-6 w-6 md:h-7 md:w-7 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-effect border-white/20 w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none truncate">{user.user_metadata?.name || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavClick('dashboard')} className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                {user.is_premium ? (
                  <>
                    <DropdownMenuItem onClick={triggerSupportModal} className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Support</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem disabled className="cursor-not-allowed opacity-70">
                      <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                      <span className="text-yellow-400">Premium User</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => triggerPremiumModal("Premium Features")} className="cursor-pointer text-yellow-500 hover:!text-yellow-400">
                    <Crown className="mr-2 h-4 w-4" />
                    <span>Upgrade to Premium</span>
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => handleNavClick('admin')} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:!text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => handleNavClick('auth')}
              className="cyber-button text-sm"
              size="sm"
            >
              <LogIn className="mr-2 h-4 w-4" /> Login / Register
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-primary/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-background/90 backdrop-blur-lg border-t border-white/10"
        >
          <nav className="flex flex-col px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant={currentView === item.view && !item.section ? "secondary" : "ghost"}
                onClick={() => handleNavClick(item.view, item.section)}
                className="justify-start font-semibold hover:text-blue-400 transition-colors"
              >
                <item.icon className="mr-2 h-4 w-4" /> {item.name}
              </Button>
            ))}
            {user && user.is_premium && (
                <Button variant="ghost" onClick={triggerSupportModal} className="justify-start font-semibold hover:text-blue-400 transition-colors">
                    <MessageSquare className="mr-2 h-4 w-4" /> Support
                </Button>
            )}
            {!user && (
               <Button
                onClick={() => handleNavClick('auth')}
                className="cyber-button w-full justify-center mt-2"
              >
                <LogIn className="mr-2 h-4 w-4" /> Login / Register
              </Button>
            )}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
