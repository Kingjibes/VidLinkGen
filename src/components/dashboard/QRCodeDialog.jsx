import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Download } from 'lucide-react';

const QRCodeDialog = ({ isOpen, onOpenChange, link }) => {
  const downloadQRCode = () => {
    const canvas = document.getElementById('qrcode-canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${link.short_code}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (!link) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glassmorphic-card modern-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-space-grotesk text-primary">Link QR Code</DialogTitle>
          <DialogDescription>
            Scan this code to open the link on any device.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCodeCanvas
            id="qrcode-canvas"
            value={link.url}
            size={256}
            bgColor={"#ffffff"}
            fgColor={"#0f172a"}
            level={"H"}
            includeMargin={true}
          />
        </div>
        <DialogFooter>
          <Button onClick={downloadQRCode} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;