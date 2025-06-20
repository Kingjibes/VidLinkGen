import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Zap, ShieldCheck, BarChartHorizontalBig, Edit3, LockKeyhole, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';

const HomePage = () => {
  const features = [
    {
      icon: Zap,
      title: 'Rapid Link Generation',
      description: 'Create secure, shortened video links in an instant with our efficient system.',
    },
    {
      icon: ShieldCheck,
      title: 'Enhanced Security',
      description: 'Protect your content with password options and robust link encryption.',
    },
    {
      icon: Edit3,
      title: 'Full Customization',
      description: 'Personalize link names, add descriptions, and set link expiration dates.',
    },
    {
      icon: BarChartHorizontalBig,
      title: 'Insightful Analytics',
      description: 'Monitor link performance with detailed data on clicks, views, and sources.',
    },
    {
      icon: LockKeyhole,
      title: 'Reliable Access Control',
      description: 'Manage who sees your content with fine-tuned access permissions.',
    },
    {
      icon: Globe2,
      title: 'Global Reach',
      description: 'Optimized for fast and reliable video sharing across the world.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>VidLinkGen - Secure Video Link Sharing | CIPHERTECH</title>
        <meta name="description" content="VidLinkGen: Securely generate, customize, and share video links with advanced analytics. Powered by CIPHERTECH for ultimate reliability and protection." />
      </Helmet>

      <div className="min-h-screen overflow-hidden">
        <Navigation />
        
        <main className="pt-24 pb-16">
          {/* Hero Section */}
          <section className="py-20 md:py-32 px-4">
            <div className="container mx-auto text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-3xl mx-auto"
              >
                <h1 className="text-5xl md:text-7xl font-space-grotesk font-bold mb-6">
                  <span className="text-gradient-blue-red">VidLinkGen</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 mb-6">
                  Securely share video links with ease and precision.
                </p>
                <p className="text-md text-[hsl(var(--primary))] mb-10 font-space-grotesk">
                  Powered by <span className="font-semibold text-[hsl(var(--secondary))]">CIPHERTECH</span>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/generator">
                    <Button size="lg" className="w-full sm:w-auto bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white px-10 py-6 text-lg subtle-glow-blue font-semibold">
                      Generate Link
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-[hsl(var(--secondary))] text-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/10 px-10 py-6 text-lg font-semibold">
                      My Dashboard
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-4">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-space-grotesk font-bold mb-4">
                  Powerful Features, Simple Interface
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  VidLinkGen offers a comprehensive suite of tools designed for secure and efficient video link management.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                  >
                    <Card className="glassmorphic-card h-full modern-border hover:border-[hsl(var(--primary))] transition-all duration-300 transform hover:scale-105">
                      <CardHeader className="items-center text-center md:items-start md:text-left">
                        <motion.div 
                          className="p-3 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] mb-4 inline-block"
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          <feature.icon className="w-7 h-7 text-white" />
                        </motion.div>
                        <CardTitle className="text-2xl font-space-grotesk text-[hsl(var(--foreground))]">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-slate-300 text-center md:text-left">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 px-4 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--card))]">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 text-center">
                {[
                  { value: "10 GB+", label: "Max File Size", color: "text-[hsl(var(--primary))]" },
                  { value: "99.99%", label: "Uptime SLA", color: "text-[hsl(var(--accent))]" },
                  { value: "AES-256", label: "Link Encryption", color: "text-[hsl(var(--secondary))]" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                  >
                    <div className={`text-5xl font-space-grotesk font-bold ${stat.color} mb-2`}>{stat.value}</div>
                    <div className="text-slate-400 text-lg">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-10 px-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-md font-space-grotesk">V</span>
              </div>
              <span className="font-space-grotesk font-semibold text-xl text-gradient-blue-red">VidLinkGen</span>
            </div>
            <p className="text-slate-400 mb-2 text-sm">
              A CIPHERTECH Initiative for Secure Digital Sharing.
            </p>
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} VidLinkGen by CIPHERTECH. All Rights Reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;