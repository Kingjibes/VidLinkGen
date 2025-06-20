import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe2, MapPin } from 'lucide-react';

const GeographicDistribution = ({ data }) => {
  const totalClicks = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
    >
      <Card className="glassmorphic-card modern-border h-full">
        <CardHeader>
          <CardTitle className="font-space-grotesk text-xl flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[hsl(var(--primary))]" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>Clicks by simulated geographic regions.</CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {data.map((item, index) => {
                const percentage = totalClicks > 0 ? (item.value / totalClicks) * 100 : 0;
                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                  >
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-slate-300 flex items-center"><MapPin size={14} className="mr-1.5 text-slate-500"/>{item.name}</span>
                      <span className="text-[hsl(var(--primary))] font-medium">{item.value} clicks ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.15 + 0.2, ease: "circOut" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <Globe2 className="mx-auto h-10 w-10 mb-3" />
              <p>Geographic data is currently unavailable.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GeographicDistribution;