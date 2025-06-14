
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Lock, Copy, Download, Shield } from 'lucide-react';
import QRCode from 'qrcode.react';

const GeneratedLinkDisplay = ({ generatedLink, generatedLinkData, copyToClipboard, downloadQR, qrRef }) => {
  if (!generatedLink || !generatedLinkData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 md:mt-8 p-4 md:p-6 glass-effect rounded-lg border border-green-500/30"
    >
      <h3 className="text-md md:text-lg font-semibold text-green-400 mb-3 md:mb-4 flex items-center space-x-2">
        <Shield className="h-4 w-4" />
        <span>Secure Link Generated!</span>
      </h3>
      
      <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
          <div className="flex-grow w-full">
            <div className="flex items-center space-x-2">
              <Input
                value={generatedLink}
                readOnly
                className="bg-background/50 text-xs md:text-sm"
              />
              <Button onClick={copyToClipboard} size="icon" variant="outline" className="h-8 w-8 md:h-9 md:w-9">
                <Copy className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
              <Button onClick={downloadQR} variant="outline" size="sm" className="text-xs md:text-sm">
                <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Download QR
              </Button>
              <Button asChild variant="outline" size="sm" className="text-xs md:text-sm">
                  <a href={generatedLink} target="_blank" rel="noopener noreferrer">Test Link</a>
              </Button>
              {generatedLinkData.password && (
                <Badge variant="outline" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Protected
                </Badge>
              )}
              {generatedLinkData.is_encrypted && (
                <Badge className="premium-badge text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Encrypted
                </Badge>
              )}
            </div>
          </div>
          <div ref={qrRef} className="p-1.5 md:p-2 bg-white rounded-md hidden">
              <QRCode value={generatedLink} size={96} />
          </div>
          <div className="p-1.5 md:p-2 bg-white rounded-md">
              <QRCode value={generatedLink} size={96} fgColor="#000000" bgColor="#ffffff" />
          </div>
      </div>
    </motion.div>
  );
};

export default GeneratedLinkDisplay;
