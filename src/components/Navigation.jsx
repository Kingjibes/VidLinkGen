import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, LayoutGrid, BarChartHorizontalBig, Settings2, Menu, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const ADMIN_EMAIL = "richvybs92@gmail.com";

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user || null);
      }
    );
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      setCurrentUser(null);
      navigate('/');
    }
  };

  const baseNavItems = [
    { path: '/', icon: Home, label: 'Home', public: true },
    { path: '/generator', icon: Settings2, label: 'Generator', public: false },
    { path: '/dashboard', icon: LayoutGrid, label: 'Dashboard', public: false },
    { path: '/analytics', icon: BarChartHorizontalBig, label: 'Analytics', public: false },
  ];

  const getNavItems = () => {
    let items = baseNavItems.filter(item => item.public || currentUser);
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
      items.push({ path: '/admin-dashboard', icon: ShieldCheck, label: 'Admin', public: false });
    }
    return items;
  };
  
  const navItems = getNavItems();


  const NavLink = ({ path, icon: Icon, label, onClick }) => {
    const isActive = location.pathname === path;
    return (
      <Link to={path} onClick={onClick}>
        <motion.div
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 relative
            ${isActive ? 'text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'}`}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="w-5 h-5" />
          <span className="text-sm font-medium">{label}</span>
          {isActive && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--primary))]"
              layoutId={`active-nav-item-${isMobileMenuOpen ? 'mobile' : 'desktop'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </motion.div>
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(10,10,20,0.7)] backdrop-blur-md border-b border-[hsl(var(--border))]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <motion.div 
              className="w-9 h-9 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-lg flex items-center justify-center shadow-md"
              whileHover={{ scale: 1.1, rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white font-bold text-lg font-space-grotesk">V</span>
            </motion.div>
            <span className="font-space-grotesk font-bold text-2xl text-gradient-blue-red">VidLinkGen</span>
          </Link>

          <div className="hidden sm:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
            {currentUser ? (
              <Button variant="ghost" onClick={handleLogout} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                <LogOut className="w-5 h-5 mr-2" /> Logout
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                  <LogIn className="w-5 h-5 mr-2" /> Login
                </Button>
              </Link>
            )}
          </div>
          
          <div className="sm:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6 text-slate-300" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-[hsl(var(--background))] border-r border-[hsl(var(--border))] p-6">
                <div className="flex flex-col space-y-3">
                  <Link to="/" className="flex items-center space-x-3 mb-6" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="w-9 h-9 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg font-space-grotesk">V</span>
                    </div>
                    <span className="font-space-grotesk font-bold text-xl text-gradient-blue-red">VidLinkGen</span>
                  </Link>
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.path}>
                       <NavLink {...item} onClick={() => setIsMobileMenuOpen(false)} />
                    </SheetClose>
                  ))}
                  {currentUser ? (
                     <SheetClose asChild>
                      <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] px-4 py-2">
                        <LogOut className="w-5 h-5 mr-2" /> Logout
                      </Button>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Link to="/auth" className="w-full">
                        <Button variant="ghost" onClick={() => setIsMobileMenuOpen(false)} className="w-full justify-start text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] px-4 py-2">
                          <LogIn className="w-5 h-5 mr-2" /> Login
                        </Button>
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;