import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, TrendingUp, Link2, BarChartHorizontalBig, Users, CheckCircle } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, todayValue, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
  >
    <Card className="glassmorphic-card modern-border h-full">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-slate-400">{label}</p>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {todayValue !== undefined && (
          <p className="text-xs text-green-400 mt-0.5">
            +{todayValue} today
          </p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);


const AnalyticsSummary = ({ summary }) => {
  const { totalClicks, totalViews, activeLinks, totalLinks, clicksToday, viewsToday, avgCTR } = summary;

  const stats = [
    { icon: TrendingUp, label: "Total Clicks", value: totalClicks, todayValue: clicksToday, color: "text-[hsl(var(--primary))]" },
    { icon: Eye, label: "Total Views", value: totalViews, todayValue: viewsToday, color: "text-green-500" },
    { icon: Link2, label: "Active Links", value: activeLinks, todayValue: `of ${totalLinks}`, color: "text-orange-500" },
    { icon: BarChartHorizontalBig, label: "Avg. CTR", value: `${avgCTR}%`, color: "text-[hsl(var(--secondary))]" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <StatCard 
          key={stat.label}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          todayValue={stat.todayValue}
          color={stat.color}
          delay={idx * 0.1}
        />
      ))}
    </div>
  );
};

export default AnalyticsSummary;