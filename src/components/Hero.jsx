import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Zap, UploadCloud, Crown } from 'lucide-react';

const Hero = ({ setCurrentView, user }) => {
  const handleGetStarted = () => {
    if (user) {
      const generatorSection = document.getElementById('video-generator-section');
      if (generatorSection) {
        generatorSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setCurrentView('auth');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 md:py-32 bg-gradient-to-br from-background via-background/80 to-purple-900/30 overflow-hidden">
      <div className="absolute inset-0 bg-space-pattern opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50"></div>
      
      <motion.div 
        className="container mx-auto px-4 text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex justify-center mb-6">
          <Shield className="h-16 w-16 md:h-20 md:w-20 text-blue-500 animate-pulse" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-orbitron font-bold mb-6 md:mb-8">
          <span className="text-gradient">VidLink</span><span className="text-gradient-secondary">Gen</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-10">
          Securely share your videos with password protection, expiry dates, and robust encryption. Powered by CIPHERTECH.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12 md:mb-16">
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-base md:text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            onClick={handleGetStarted}
          >
            Get Started Now
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto text-base md:text-lg px-8 py-6 border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/70 transform hover:scale-105 transition-all duration-300"
            onClick={() => setCurrentView('features')}
          >
            View Features
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto text-left">
          {[
            { icon: Lock, text: "Password Protection" },
            { icon: UploadCloud, text: "500MB Max File Size (Free)" },
            { icon: Shield, text: "256-bit Encryption" },
            { icon: Zap, text: "99.9% Uptime" },
          ].map((item, index) => (
            <motion.div 
              key={index}
              className="glass-effect p-4 rounded-lg border border-white/10 flex items-center space-x-3 hover:border-blue-500/30 transition-colors duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <item.icon className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <span className="text-sm md:text-base text-muted-foreground">{item.text}</span>
            </motion.div>
          ))}
        </div>
        {!user?.is_premium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12 md:mt-16"
          >
            <Button 
              onClick={() => setCurrentView('features')}
              className="w-full max-w-md mx-auto text-base md:text-lg px-8 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              <Crown className="h-5 w-5 mr-2" />
              Upgrade to Premium for
            </Button>
            <p className="text-sm text-muted-foreground mt-2">Unlock 2TB uploads, advanced encryption, and more!</p>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default Hero;