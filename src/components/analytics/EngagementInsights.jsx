import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users2, TrendingDown, TrendingUp, Activity } from 'lucide-react'; // Using Activity for generic insights

const EngagementInsights = ({ metrics, onFeatureRequest }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
    >
      <Card className="glassmorphic-card modern-border h-full">
        <CardHeader>
          <CardTitle className="font-space-grotesk text-xl flex items-center gap-2">
            <Users2 className="w-5 h-5 text-[hsl(var(--secondary))]" />
            Engagement Insights
          </CardTitle>
          <CardDescription>Key metrics reflecting user interaction (simulated).</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics && metrics.length > 0 ? (
            <div className="space-y-5">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="p-4 bg-[hsl(var(--muted))]/70 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))] transition-colors cursor-pointer"
                  onClick={() => onFeatureRequest(metric.title)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-200 font-medium">{metric.title}</span>
                    <span className={`text-2xl font-bold ${metric.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.value}
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {metric.changeType === 'positive' ? 
                      <TrendingUp size={14} className="mr-1 text-green-500" /> : 
                      <TrendingDown size={14} className="mr-1 text-red-500" />
                    }
                    <span className={`${metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                      {metric.change} vs last period
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <Activity className="mx-auto h-10 w-10 mb-3" />
              <p>Engagement insights are currently unavailable.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EngagementInsights;