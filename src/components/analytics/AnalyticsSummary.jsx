import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Eye, Link2, CheckCircle, Percent } from 'lucide-react';

const StatCard = ({ title, value, todayValue, icon: Icon, color, description }) => (
  <Card className="glassmorphic-card modern-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description ? (
        <p className="text-xs text-slate-400">{description}</p>
      ) : (
        <p className="text-xs text-slate-400">
          <span className="text-green-400">+{todayValue}</span> today
        </p>
      )}
    </CardContent>
  </Card>
);

const AnalyticsSummary = ({ summary }) => {
  const summaryCards = [
    {
      title: 'Total Clicks',
      value: summary.totalClicks,
      todayValue: summary.clicksToday,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'Total Views',
      value: summary.totalViews,
      todayValue: summary.viewsToday,
      icon: Eye,
      color: 'text-sky-400',
    },
    {
      title: 'Active Links',
      value: summary.activeLinks,
      description: `${summary.activeLinks} of ${summary.totalLinks} total links are active`,
      icon: CheckCircle,
      color: 'text-yellow-400',
    },
    {
      title: 'Total Links',
      value: summary.totalLinks,
      description: 'All links generated on the platform',
      icon: Link2,
      color: 'text-purple-400',
    },
    {
      title: 'Avg. Click-Thru Rate',
      value: `${summary.avgCTR}%`,
      description: 'Based on views vs. clicks',
      icon: Percent,
      color: 'text-orange-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
    >
      {summaryCards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <StatCard {...card} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AnalyticsSummary;