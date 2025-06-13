
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { 
  Shield, 
  Lock, 
  Zap, 
  Globe, 
  BarChart3, 
  Crown, 
  Video, 
  Calendar,
  Key,
  Download,
  Smartphone,
  Cloud,
  Copy
} from 'lucide-react';

const PaymentDialog = () => {
  const ghanaMomo = "0557488116";
  const telegramLink = "https://t.me/HACK_ERPRO";
  const whatsappLink = "https://wa.me/+233557488116";

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard.`
    });
  };

  return (
    <DialogContent className="glass-effect border-yellow-500/30 sm:max-w-[425px] md:max-w-[550px]">
      <DialogHeader>
        <DialogTitle className="font-orbitron text-xl md:text-2xl text-gradient">
          Upgrade to Premium - $2
        </DialogTitle>
        <CardDescription className="text-sm md:text-base">
          Follow these steps to unlock premium features.
        </CardDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <h3 className="font-semibold text-md md:text-lg mb-2">For Users in Ghana:</h3>
          <p className="text-muted-foreground text-sm md:text-base">Pay via MTN Mobile Money:</p>
          <div className="flex items-center space-x-2 mt-1 p-2 bg-background/50 rounded">
            <span className="font-mono text-md md:text-lg">{ghanaMomo}</span>
            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(ghanaMomo, "MTN MoMo Number")}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">After payment, send a screenshot of the transaction to us on Telegram or WhatsApp.</p>
        </div>
        
        <div className="border-t border-white/10 pt-4">
          <h3 className="font-semibold text-md md:text-lg mb-2">For International Users:</h3>
          <p className="text-muted-foreground text-sm md:text-base">Please contact us directly on Telegram or WhatsApp to arrange payment.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="w-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-sm md:text-base">
                <a href={telegramLink} target="_blank" rel="noopener noreferrer">Contact on Telegram</a>
            </Button>
            <Button asChild className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 text-sm md:text-base">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">Contact on WhatsApp</a>
            </Button>
        </div>
      </div>
    </DialogContent>
  );
}

const Features = ({user}) => {
  const freeFeatures = [
    { icon: Video, title: "Video Upload (2GB)", description: "Upload videos up to 2GB directly to our secure servers.", color: "text-blue-500" },
    { icon: Globe, title: "URL Linking", description: "Generate secure links from YouTube, Vimeo, and more.", color: "text-green-500" },
    { icon: Lock, title: "Password Protection", description: "Add password protection to your video links for extra security.", color: "text-red-500" },
    { icon: Calendar, title: "Expiry Dates", description: "Set automatic expiration dates for your shared links.", color: "text-purple-500" },
    { icon: BarChart3, title: "Basic Analytics", description: "Track views and basic engagement metrics for your links.", color: "text-yellow-500" },
    { icon: Smartphone, title: "Mobile Responsive", description: "Access and manage your links from any device, anywhere.", color: "text-cyan-500" }
  ];

  const premiumFeatures = [
    { icon: Cloud, title: "5GB Upload Limit", description: "Upload larger videos up to 5GB with premium storage.", color: "text-blue-500" },
    { icon: Shield, title: "File Encryption", description: "Secure your video files with robust encryption (Premium Only).", color: "text-red-500" },
    { icon: Key, title: "Advanced Access Control", description: "Role-based permissions and advanced sharing controls.", color: "text-green-500" },
    { icon: BarChart3, title: "Advanced Analytics", description: "Detailed analytics with geographic data and user insights.", color: "text-purple-500" },
    { icon: Download, title: "Bulk Operations", description: "Batch upload, download, and manage multiple videos at once.", color: "text-yellow-500" },
    { icon: Zap, title: "Priority Support", description: "24/7 premium support with faster response times.", color: "text-cyan-500" }
  ];


  return (
    <div className="min-h-screen bg-space-pattern pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-gradient mb-4 md:mb-6">Powerful Features</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">Everything you need to securely share and manage your video content with military-grade security powered by CIPHERTECH</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12 md:mb-16">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-orbitron font-bold mb-3 md:mb-4">Free Features</h2>
            <p className="text-muted-foreground text-sm md:text-base">Get started with our powerful free tier</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {freeFeatures.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }} whileHover={{ scale: 1.05 }}>
                <Card className="glass-effect border-white/20 h-full hover:border-blue-500/30 transition-all duration-300">
                  <CardHeader><CardTitle className="flex items-center space-x-3 text-lg md:text-xl"><feature.icon className={`h-5 w-5 md:h-6 md:w-6 ${feature.color}`} /><span>{feature.title}</span></CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground text-sm md:text-base">{feature.description}</p></CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12 md:mb-16">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
              <h2 className="text-2xl md:text-3xl font-orbitron font-bold">Premium Features</h2>
              <Badge className="premium-badge text-base md:text-lg px-3 py-1"><Crown className="h-4 w-4 mr-1" />Premium</Badge>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">Unlock advanced features with our premium plan</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            {premiumFeatures.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }} whileHover={{ scale: 1.05 }}>
                <Card className="glass-effect border-yellow-500/30 h-full hover:border-yellow-500/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-bl from-yellow-500/20 to-transparent"></div>
                  <CardHeader><CardTitle className="flex items-center space-x-3 text-lg md:text-xl"><feature.icon className={`h-5 w-5 md:h-6 md:w-6 ${feature.color}`} /><span>{feature.title}</span><Crown className="h-4 w-4 text-yellow-500" /></CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground text-sm md:text-base">{feature.description}</p></CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {!user?.is_premium && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="text-center">
              <Card className="glass-effect border-yellow-500/30 max-w-2xl mx-auto">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Crown className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" /><h3 className="text-xl md:text-2xl font-orbitron font-bold text-gradient">Upgrade to Premium</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 text-sm md:text-base">Get access to advanced encryption, 5GB uploads, detailed analytics, and priority support for just $2.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold text-base md:text-lg px-6 py-2 md:px-8 md:py-3">
                        <Crown className="h-4 w-4 md:h-5 md:w-5 mr-2" /> Upgrade for $2
                      </Button>
                    </DialogTrigger>
                    <PaymentDialog />
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-center">
          <Card className="glass-effect border-blue-500/30 max-w-4xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-center space-x-2 mb-4 md:mb-6">
                <Shield className="h-6 w-6 md:h-8 md:w-8 text-blue-500" /><h3 className="text-xl md:text-2xl font-orbitron font-bold text-gradient">CIPHERTECH Security</h3>
              </div>
              <p className="text-muted-foreground mb-6 text-base md:text-lg">Built by †𝙃𝘼𝘾𝙆𝙀𝙍𝙋𝙍𝙊† with military-grade security standards. Your videos are protected with the same encryption used by government agencies.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="text-center"><div className="text-xl md:text-2xl font-bold text-blue-400 mb-1 md:mb-2">256-bit</div><div className="text-xs md:text-sm text-muted-foreground">AES Encryption</div></div>
                <div className="text-center"><div className="text-xl md:text-2xl font-bold text-blue-400 mb-1 md:mb-2">99.9%</div><div className="text-xs md:text-sm text-muted-foreground">Uptime SLA</div></div>
                <div className="text-center"><div className="text-xl md:text-2xl font-bold text-blue-400 mb-1 md:mb-2">24/7</div><div className="text-xs md:text-sm text-muted-foreground">Security Monitoring</div></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;
