import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Lock, Users, ArrowRight, Crown } from 'lucide-react';
import config from '@/config';

const Hero = ({ setCurrentView, user }) => {
  const handleGetStarted = () => {
    if (user) {
      setCurrentView('home'); 
    } else {
      setCurrentView('auth');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden bg-space-pattern py-20 md:py-32 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-background opacity-50"></div>
      
      <motion.div 
        className="relative z-10 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="mb-6 md:mb-8">
          <Badge variant="outline" className="text-sm sm:text-base bg-blue-500/10 border-blue-500/30 text-blue-300 py-2 px-4 rounded-full shadow-lg">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-400" />
            Military-Grade Video Security
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-orbitron font-extrabold mb-6 md:mb-8 text-gradient leading-tight">
          VidLinkGen
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
          Securely share your videos with password protection, expiry dates, and robust encryption. Powered by CIPHERTECH.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-10 md:mb-14">
          <Button 
            onClick={handleGetStarted}
            className="w-full sm:w-auto text-base md:text-lg font-semibold px-8 py-3 md:px-10 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out cyber-glow"
          >
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('features')}
            className="w-full sm:w-auto text-base md:text-lg font-semibold px-8 py-3 md:px-10 md:py-4 border-gradient text-foreground rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
          >
            View Features
          </Button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 text-left mb-10 md:mb-14 text-xs sm:text-sm">
          {[
            { icon: Lock, text: "Password Protection" },
            { icon: Zap, text: "2GB Max File Size (Free)" },
            { icon: Shield, text: "256-bit Encryption" },
            { icon: Users, text: "99.9% Uptime" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 p-2 md:p-3 bg-white/5 rounded-lg border border-white/10">
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
              <span className="text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </div>

         {!user?.is_premium && (
          <div className="mb-10 md:mb-14">
            <Button 
              onClick={() => setCurrentView('features')}
              className="w-full sm:w-auto text-base md:text-lg font-semibold px-8 py-3 md:px-10 md:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <Crown className="mr-2 h-5 w-5" /> Upgrade to Premium for {config.premiumPrice}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Unlock 2TB uploads, advanced encryption, and more!</p>
          </div>
        )}


        <div className="flex items-center justify-center">
          <Badge variant="outline" className="text-xs sm:text-sm bg-yellow-500/10 border-yellow-500/30 text-yellow-300 py-1 px-2 rounded-full shadow-md">
            <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-yellow-400" />
            Premium: 2TB files + Advanced encryption
          </Badge>
        </div>

      </motion.div>

      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-1/2 h-1/2 opacity-20 animate-pulse-slow">
        <div className="w-full h-full rounded-full bg-blue-600 blur-[100px]"></div>
      </div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-20 animate-pulse-slow animation-delay-2000">
        <div className="w-full h-full rounded-full bg-purple-600 blur-[100px]"></div>
      </div>
    </section>
  );
};

export default Hero;
