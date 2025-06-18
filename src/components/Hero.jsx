
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, UploadCloud, Zap, Lock, ArrowRight, Crown, PlayCircle } from 'lucide-react';
import config from '@/config';

const Hero = ({ setCurrentView, user }) => {
  const features = [
    { icon: Lock, text: 'Password Protection', premium: true },
    { icon: UploadCloud, text: '200MB Max File Size (Free)', premium: false },
    { icon: Shield, text: '256-bit Encryption', premium: true },
    { icon: Zap, text: '99.9% Uptime', premium: false },
  ];

  const handleGetStarted = () => {
    if (user) {
      // If user is logged in, scroll to video generator
      setCurrentView('home');
      setTimeout(() => {
        const element = document.getElementById('video-generator-section');
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    } else {
      // If user is not logged in, redirect to auth page
      setCurrentView('auth');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background via-background to-blue-900/30">
      <div className="absolute inset-0 bg-space-pattern opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/70"></div>
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Badge variant="outline" className="mb-4 md:mb-6 text-sm md:text-base border-blue-500/50 text-blue-300 py-1 px-3 backdrop-blur-sm bg-blue-500/10">
            Powered by CIPHERTECH
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-orbitron font-extrabold mb-6 md:mb-8 text-gradient leading-tight">
            {config.siteName}: Secure Video Sharing
          </h1>
          <p className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 md:mb-12">
            Upload, encrypt, and share your videos with robust security features, password protection, and expiring links. Your content, your control.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-10 md:mb-16">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base md:text-lg px-8 py-6 cyber-button group"
              onClick={handleGetStarted}
            >
              <PlayCircle className="mr-2 h-5 w-5 group-hover:animate-pulse" /> 
              {user ? 'Get Started Now' : 'Login to Get Started'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base md:text-lg px-8 py-6 border-blue-500/60 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200 transition-all duration-300"
              onClick={() => setCurrentView('features')}
            >
              View Features <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-12 md:mb-16"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-effect p-4 rounded-lg border border-white/10 text-center hover:border-blue-500/30 transition-colors duration-300"
            >
              <feature.icon className={`h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 ${feature.premium ? 'text-yellow-400' : 'text-blue-400'}`} />
              <p className="text-xs md:text-sm font-medium">{feature.text}</p>
            </div>
          ))}
        </motion.div>
        
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-r from-yellow-500/80 via-orange-500/80 to-red-500/80 p-6 md:p-8 rounded-xl shadow-2xl max-w-2xl mx-auto backdrop-blur-md border border-yellow-400/30"
        >
            <div className="flex items-center justify-center space-x-3 mb-3 md:mb-4">
                <Crown className="h-6 w-6 md:h-8 md:w-8 text-black" />
                <h3 className="text-xl md:text-2xl font-orbitron font-bold text-black">Upgrade to Premium</h3>
            </div>
            <p className="text-sm md:text-base text-black/80 mb-4 md:mb-6">
                Unlock {config.uploadLimits.team >= (1024*1024*1024*1024) ? `${config.uploadLimits.team / (1024*1024*1024*1024)}TB` : `${config.uploadLimits.team / (1024*1024*1024)}GB`} uploads, advanced encryption, detailed analytics, and more powerful features!
            </p>
            <Button 
                className="w-full sm:w-auto bg-black text-yellow-400 hover:bg-gray-800 hover:text-yellow-300 font-semibold text-sm md:text-base px-6 py-3"
                onClick={() => setCurrentView('features')}
            >
                Explore Premium Plans
            </Button>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
                                              
