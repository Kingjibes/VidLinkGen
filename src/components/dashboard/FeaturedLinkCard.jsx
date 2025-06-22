import React from 'react';
import { motion } from 'framer-motion';
import { Award, Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FeaturedLinkCard = ({ link, onOpen }) => {
  if (!link) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mb-8"
    >
      <Card className="glassmorphic-card modern-border border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-yellow-400" />
            <div>
              <CardTitle className="font-space-grotesk text-xl text-yellow-400">Featured Link</CardTitle>
              <CardDescription>Your most clicked link right now!</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-slate-100 break-all">{link.custom_name || link.short_code}</p>
              <p className="text-sm text-primary font-mono break-all">{link.url}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{link.clicks || 0}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1"><TrendingUp size={14} /> Clicks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-400">{link.views || 0}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1"><Eye size={14} /> Views</p>
              </div>
              <Button onClick={() => onOpen(link.url)} className="bg-yellow-500/90 hover:bg-yellow-500 text-white">
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeaturedLinkCard;