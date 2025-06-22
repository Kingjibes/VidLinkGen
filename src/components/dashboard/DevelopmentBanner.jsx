import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const DevelopmentBanner = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
      <Alert variant="warning" className="glassmorphic-card-soft modern-border relative">
        <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-4 flex-shrink-0" style={{ marginTop: '2px' }} />
            <div className="flex-grow">
                <AlertTitle className="font-space-grotesk text-yellow-400">Feature In Development</AlertTitle>
                <AlertDescription className="text-yellow-300/80">
                  Link click/view simulated & stats updated. Actual redirect/playback not implemented yet for all scenarios.
                </AlertDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="ml-4 -mr-2 -mt-2 h-8 w-8 rounded-full text-yellow-400 hover:text-yellow-200 hover:bg-white/10">
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" />
            </Button>
        </div>
      </Alert>
    </motion.div>
  );
};

export default DevelopmentBanner;