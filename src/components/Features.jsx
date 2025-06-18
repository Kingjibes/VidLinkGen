
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  Copy,
  Users,
  MessageSquare,
  LifeBuoy,
  PhoneOutgoing,
  Send,
  User,
  Users2,
  DollarSign
} from 'lucide-react';
import config from '@/config';

const PaymentDialog = ({ setCurrentView, selectedPlan, selectedCurrency }) => {
  const { momoNumber, telegramHandles, whatsappNumbers } = config.contact;
  
  const planKey = selectedPlan;
  const planDetails = config.premiumPrices[planKey] || null;
  const priceInfo = planDetails ? config.getPriceForCurrency(planKey, selectedCurrency) : null;
  const priceToDisplay = priceInfo ? priceInfo.display : "Premium";

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <DialogContent className="glass-effect border-yellow-500/30 sm:max-w-[425px] md:max-w-[550px]">
      <DialogHeader>
        <DialogTitle className="font-orbitron text-xl md:text-2xl text-gradient">
          Upgrade to {planDetails ? planDetails.label : 'Premium'} - {priceToDisplay}
        </DialogTitle>
        <CardDescription className="text-sm md:text-base">
          Follow these steps to unlock premium features.
        </CardDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <h3 className="font-semibold text-md md:text-lg mb-2">Payment Instructions:</h3>
          <p className="text-muted-foreground text-sm md:text-base">Pay {priceToDisplay} via your preferred method:</p>
          
          {selectedCurrency === 'GHS' && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-300 font-semibold mb-2">For Ghana - MTN Mobile Money:</p>
              <div className="flex items-center space-x-2 p-2 bg-background/50 rounded">
                <span className="font-mono text-md md:text-lg">{momoNumber}</span>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(momoNumber)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {selectedCurrency === 'USD' && (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 font-semibold mb-2">International Payment Options:</p>
              <p className="text-sm text-muted-foreground">Contact us via the methods below for payment instructions including PayPal, Stripe, or other international payment methods.</p>
            </div>
          )}
          
          {selectedCurrency === 'NGN' && (
            <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300 font-semibold mb-2">For Nigeria:</p>
              <p className="text-sm text-muted-foreground">Contact us for bank transfer details or other local payment methods.</p>
            </div>
          )}
          
          <p className="text-muted-foreground mt-3 text-sm md:text-base">After payment, send a screenshot of the transaction to us using one of the contact methods below.</p>
        </div>
        
        <div className="border-t border-white/10 pt-4">
          <h3 className="font-semibold text-md md:text-lg mb-2">Contact Us After Payment:</h3>
          <div className="space-y-2">
            {telegramHandles.map((handle, index) => (
              <Button key={handle.id} asChild className="w-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-sm md:text-base">
                  <a href={handle.link} target="_blank" rel="noopener noreferrer">
                    <Send className="mr-2 h-4 w-4" /> Contact via Telegram {telegramHandles.length > 1 ? index + 1 : ''}
                  </a>
              </Button>
            ))}
            {whatsappNumbers.map((contact, index) => (
              <Button key={contact.id} asChild className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 text-sm md:text-base">
                  <a href={`https://wa.me/${contact.number.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                    <PhoneOutgoing className="mr-2 h-4 w-4" /> Contact via WhatsApp {whatsappNumbers.length > 1 ? index + 1 : ''}
                  </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
       <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

const Features = ({ user, setCurrentView, triggerSupportModal, triggerPremiumModal }) => {
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(config.defaultCurrency);

  const freeFeatures = [
    { icon: Video, title: "Video Upload (200MB)", description: "Upload videos up to 200MB directly to our secure servers.", color: "text-blue-500" },
    { icon: Globe, title: "URL Linking", description: "Generate secure links from YouTube, Vimeo, and more.", color: "text-green-500" },
    { 
      icon: Lock, 
      title: "Password Protection", 
      description: user?.is_premium ? "Add password protection to your video links." : "Add password protection to your video links (Upgrade to Premium to activate).", 
      color: user?.is_premium ? "text-green-500" : "text-red-500",
      action: !user?.is_premium ? () => triggerPremiumModal("Password Protection") : null
    },
    { icon: Calendar, title: "Expiry Dates", description: "Set automatic expiration dates for your shared links.", color: "text-purple-500" },
    { icon: BarChart3, title: "Basic Analytics", description: "Track views and basic engagement metrics for your links.", color: "text-yellow-500" },
    { icon: Smartphone, title: "Mobile Responsive", description: "Access and manage your links from any device, anywhere.", color: "text-cyan-500" }
  ];

  const premiumTiers = [
    {
      id: 'individual',
      name: 'Individual Plan',
      icon: User,
      monthlyPlanKey: 'individual_monthly',
      yearlyPlanKey: 'individual_yearly',
      color: "border-teal-500/50 hover:border-teal-500/70",
      gradient: "from-teal-500/20 to-transparent"
    },
    {
      id: 'team',
      name: 'Team Plan',
      icon: Users2,
      monthlyPlanKey: 'team_monthly',
      yearlyPlanKey: 'team_yearly',
      color: "border-indigo-500/50 hover:border-indigo-500/70",
      gradient: "from-indigo-500/20 to-transparent"
    }
  ];

  const handleChoosePlan = (planKey) => {
    setSelectedPlanForPayment(planKey);
    setIsPaymentDialogOpen(true);
  };

  const getFeatureIcon = (featureDesc) => {
    if (featureDesc.toLowerCase().includes("upload limit")) return Cloud;
    if (featureDesc.toLowerCase().includes("encryption")) return Shield;
    if (featureDesc.toLowerCase().includes("access control")) return Users;
    if (featureDesc.toLowerCase().includes("analytics")) return BarChart3;
    if (featureDesc.toLowerCase().includes("collaboration")) return Users2;
    if (featureDesc.toLowerCase().includes("bulk operations")) return Download;
    if (featureDesc.toLowerCase().includes("priority support")) return LifeBuoy;
    return Cloud; // Default icon
  };

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
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 * index }} 
                whileHover={{ scale: 1.05 }}
                onClick={feature.action}
                className={feature.action ? "cursor-pointer" : ""}
              >
                <Card className="glass-effect border-white/20 h-full hover:border-blue-500/30 transition-all duration-300">
                  <CardHeader><CardTitle className="flex items-center space-x-3 text-lg md:text-xl"><feature.icon className={`h-5 w-5 md:h-6 md:w-6 ${feature.color}`} /><span>{feature.title}</span></CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground text-sm md:text-base">{feature.description}</p></CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12 md:mb-16">
            <div className="text-center mb-6 md:mb-8">
              <div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
                <h2 className="text-2xl md:text-3xl font-orbitron font-bold">Premium Plans</h2>
                <Badge className="premium-badge text-base md:text-lg px-3 py-1"><Crown className="h-4 w-4 mr-1" />Premium</Badge>
              </div>
              <p className="text-muted-foreground text-sm md:text-base mb-4">Choose the plan that's right for you.</p>
              
              {/* Currency Selector */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Label htmlFor="currency-select" className="text-sm font-medium">Currency:</Label>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger id="currency-select" className="w-40 bg-background/80 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-white/20">
                    {Object.entries(config.currencies).map(([code, currency]) => (
                      <SelectItem key={code} value={code}>
                        {currency.symbol} {code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
              {premiumTiers.map((tier) => {
                const monthlyPrice = config.getPriceForCurrency(tier.monthlyPlanKey, selectedCurrency);
                const yearlyPrice = config.getPriceForCurrency(tier.yearlyPlanKey, selectedCurrency);
                const monthlyPlan = config.premiumPrices[tier.monthlyPlanKey];
                
                return (
                  <motion.div key={tier.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * premiumTiers.indexOf(tier) }} whileHover={{ scale: 1.03 }}>
                    <Card className={`glass-effect ${tier.color} h-full flex flex-col transition-all duration-300 relative overflow-hidden`}>
                      <div className={`absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-bl ${tier.gradient}`}></div>
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center space-x-3 text-xl md:text-2xl">
                          <tier.icon className={`h-6 w-6 md:h-7 md:w-7 ${tier.color.split('-')[0]}-500`} />
                          <span>{tier.name}</span>
                          <Crown className="h-5 w-5 text-yellow-500" />
                        </CardTitle>
                        <div className="flex items-baseline space-x-2 mt-2">
                          <span className="text-3xl font-bold">{monthlyPrice?.display || 'N/A'}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          or {yearlyPrice?.display || 'N/A'}/year
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <ul className="space-y-2 mb-6">
                          {monthlyPlan.features.map((featureDesc, idx) => {
                            const IconComponent = getFeatureIcon(featureDesc);
                            return (
                              <li key={idx} className="flex items-start space-x-2">
                                <IconComponent className={`h-4 w-4 mt-1 flex-shrink-0 text-green-400`} />
                                <span className="text-sm text-muted-foreground">{featureDesc}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </CardContent>
                      <div className="p-6 pt-0 mt-auto">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <DialogTrigger asChild>
                            <Button 
                              onClick={() => handleChoosePlan(tier.monthlyPlanKey)}
                              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                            >
                              Choose Monthly
                            </Button>
                          </DialogTrigger>
                          <DialogTrigger asChild>
                            <Button 
                              onClick={() => handleChoosePlan(tier.yearlyPlanKey)}
                              variant="outline" 
                              className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                            >
                              Choose Yearly (Save ~16%)
                            </Button>
                          </DialogTrigger>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            {isPaymentDialogOpen && <PaymentDialog setCurrentView={setCurrentView} selectedPlan={selectedPlanForPayment} selectedCurrency={selectedCurrency} />}
          </motion.div>
        </Dialog>

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
      
