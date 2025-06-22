import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DashboardHeader = ({ linkCount, onSearchChange, searchTerm, onNewLink }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-8"
  >
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-space-grotesk font-bold mb-1 text-gradient-blue-red">
          Your Links Dashboard
        </h1>
        <p className="text-slate-400">
          You have {linkCount} link{linkCount !== 1 ? 's' : ''}. Manage them all from here.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search links..."
            value={searchTerm}
            onChange={onSearchChange}
            className="pl-10 bg-[hsl(var(--input))] border-[hsl(var(--border))]"
          />
        </div>
        <Button onClick={onNewLink} className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 text-white whitespace-nowrap">
          <PlusCircle className="w-4 h-4 mr-2" />
          New Link
        </Button>
      </div>
    </div>
  </motion.div>
);

export default DashboardHeader;