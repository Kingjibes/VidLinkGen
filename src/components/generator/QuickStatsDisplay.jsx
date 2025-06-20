import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const QuickStatsDisplay = ({ stats }) => {
  return (
    <Card className="glassmorphic-card modern-border">
      <CardHeader>
        <CardTitle className="font-space-grotesk text-xl">Quick Stats (Live)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div key="total-links">
            <p className="text-3xl font-bold text-[hsl(var(--primary))]">{stats.totalLinks}</p>
            <p className="text-xs text-slate-400">Total Links</p>
          </div>
          <div key="total-clicks">
            <p className="text-3xl font-bold text-green-500">{stats.totalClicks}</p>
            <p className="text-xs text-slate-400">Total Clicks</p>
          </div>
          <div key="total-views">
            <p className="text-3xl font-bold text-[hsl(var(--secondary))]">{stats.totalViews}</p>
            <p className="text-xs text-slate-400">Total Views</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStatsDisplay;