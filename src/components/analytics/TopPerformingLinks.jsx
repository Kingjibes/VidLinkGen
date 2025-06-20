
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Link as LinkIcon } from 'lucide-react';

const TopPerformingLinks = ({ links }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    } catch { return 'Invalid Date'; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
    >
      <Card className="glassmorphic-card modern-border h-full">
        <CardHeader>
          <CardTitle className="font-space-grotesk text-xl flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Top Performing Links
          </CardTitle>
          <CardDescription>Most engaged links by combined clicks and views.</CardDescription>
        </CardHeader>
        <CardContent>
          {links && links.length > 0 ? (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {links.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded-lg hover:bg-[hsl(var(--muted))]/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-white text-sm truncate" title={link.name}>
                        {link.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        Created: {formatDate(link.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-bold text-[hsl(var(--primary))]">{(link.clicks || 0) + (link.views || 0)} total</p>
                    <p className="text-xs text-slate-400">{link.clicks || 0}c • {link.views || 0}v</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <LinkIcon className="mx-auto h-10 w-10 mb-3" />
              <p>No link data available to display top performers.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TopPerformingLinks;
