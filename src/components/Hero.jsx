import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, Video, Lock, Zap, Globe, Crown } from 'lucide-react';

const Hero = ({ setCurrentView, user }) => {
  const features = [
    { icon: Shield, text: "Military-grade encryption" },
    { icon: Lock, text: "Password protection" },
    { icon: Zap, text: "Lightning fast generation" },
    { icon: Globe, text: "Global CDN delivery" }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-space-pattern overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-500 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-blue-400 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-red-400 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-60 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main Heading */}
          <motion.h1 
            className="text-5xl md:text-7xl font-orbitron font-black mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="text-gradient">VidLinkGen</span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-4 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Securely share video links with ease
          </motion.p>

          <motion.div 
            className="flex items-center justify-center space-x-2 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-sm text-muted-foreground">Powered by</span>
            <span className="font-orbitron font-bold text-gradient">CIPHERTECH</span>
          </motion.div>

          {/* Feature Pills */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-2 glass-effect px-4 py-2 rounded-full"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <feature.icon className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button
              size="lg"
              className="cyber-glow text-lg px-8 py-6 font-semibold"
              onClick={() => setCurrentView(user ? 'dashboard' : 'auth')}
            >
              <Video className="h-5 w-5 mr-2" />
              {user ? 'Go to Dashboard' : 'Get Started Now'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 font-semibold border-white/20 hover:bg-white/10"
              onClick={() => setCurrentView('features')}
            >
              <Shield className="h-5 w-5 mr-2" />
              View Features
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gradient font-orbitron">2GB</div>
              <div className="text-sm text-muted-foreground">Max File Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gradient font-orbitron">256-bit</div>
              <div className="text-sm text-muted-foreground">Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gradient font-orbitron">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gradient font-orbitron">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </motion.div>

          {/* Premium Badge */}
          <motion.div 
            className="mt-12 inline-flex items-center space-x-2 premium-badge px-4 py-2 rounded-full font-semibold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <Crown className="h-4 w-4" />
            <span>Premium: 5GB files + Advanced encryption</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 right-20 hidden lg:block"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-20 h-20 glass-effect rounded-full flex items-center justify-center cyber-glow">
          <Video className="h-8 w-8 text-blue-500" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-20 hidden lg:block"
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-16 h-16 glass-effect rounded-full flex items-center justify-center red-glow">
          <Shield className="h-6 w-6 text-red-500" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;