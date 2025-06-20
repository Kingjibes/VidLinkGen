import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock4, Zap } from 'lucide-react';

const ActivityByTime = ({ data }) => {
  const maxClicks = Math.max(...data.map(item => item.clicks), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
    >
      <Card className="glassmorphic-card modern-border h-full">
        <CardHeader>
          <CardTitle className="font-space-grotesk text-xl flex items-center gap-2">
            <Clock4 className="w-5 h-5 text-orange-500" />
            Activity by Time
          </CardTitle>
          <CardDescription>Simulated click distribution throughout the day.</CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {data.map((item, index) => {
                const percentage = maxClicks > 0 ? (item.clicks / maxClicks) * 100 : 0;
                return (
                  <motion.div 
                    key={item.hour}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm text-slate-400 w-16 flex-shrink-0 text-right">{item.hour}</span>
                    <div className="flex-grow bg-slate-700 rounded-full h-4 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full rounded-full flex items-center justify-end pr-1.5"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.1, type: "spring", stiffness: 50 }}
                      >
                         {percentage > 10 && <Zap size={10} className="text-white/70" />}
                      </motion.div>
                    </div>
                    <span className="text-sm text-orange-400 w-12 text-left font-medium">{item.clicks}</span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <Clock4 className="mx-auto h-10 w-10 mb-3" />
              <p>Activity data by time is not available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivityByTime;