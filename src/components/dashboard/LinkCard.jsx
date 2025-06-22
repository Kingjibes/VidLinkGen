import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, ExternalLink, Eye, TrendingUp, ShieldCheck, CalendarOff, Copy as CopyIcon, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center p-2 rounded text-xs ${color || 'text-slate-400'}`}>
    <Icon className="w-3.5 h-3.5 mr-1.5" />
    {value} {label}
  </div>
);

const LinkCard = ({ link, onEdit, onDelete, onCopy, onOpen, onQrCode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="glassmorphic-card modern-border h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-space-grotesk text-xl break-all">
            {link.custom_name || link.short_code}
          </CardTitle>
          <div className="flex gap-1.5">
            {link.is_password_protected && <ShieldCheck className="w-4 h-4 text-green-400" title="Password Protected"/>}
            {link.expiration_date && new Date(link.expiration_date) < new Date() && <CalendarOff className="w-4 h-4 text-red-400" title="Expired"/>}
          </div>
        </div>
        <CardDescription className="text-xs text-slate-400 break-all truncate" title={link.description}>
            {link.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-xs text-primary font-mono break-all mb-1 cursor-pointer hover:underline" onClick={() => onCopy(link.url)} title="Click to copy">
            {link.url}
        </p>
        <p className="text-xs text-slate-500 mb-3">
          Created: {new Date(link.created_at).toLocaleDateString()}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
          <StatCard icon={Eye} label="Views" value={link.views || 0} color="text-sky-400" />
          <StatCard icon={TrendingUp} label="Clicks" value={link.clicks || 0} color="text-emerald-400" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t border-[hsl(var(--border))] pt-4 mt-auto">
        <Button variant="outline" size="icon" onClick={() => onQrCode(link)} title="Show QR Code" className="border-purple-500/50 hover:bg-purple-500/10 text-purple-400">
          <QrCode className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onCopy(link.url)} title="Copy Link" className="border-slate-500/50 hover:bg-slate-500/10 text-slate-400">
          <CopyIcon className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onEdit(link)} title="Edit Link" className="border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-400">
          <Edit3 className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onDelete(link)} title="Delete Link" className="border-red-500/50 hover:bg-red-500/10 text-red-400">
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

export default LinkCard;