import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, Copy, CheckCircle2, ExternalLink, Download } from 'lucide-react';

const GeneratedLinkDisplay = ({ generatedLink, isCopied, onCopyToClipboard, passwordSet, expirationDateSet }) => {

  const downloadQRCode = () => {
    const canvas = document.getElementById('generated-qrcode');
    if (canvas && generatedLink) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      const shortCode = generatedLink.substring(generatedLink.lastIndexOf('/') + 1);
      downloadLink.download = `${shortCode || 'vidlinkgen'}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <Card className="glassmorphic-card modern-border">
      <CardHeader>
        <CardTitle className="font-space-grotesk text-2xl flex items-center gap-2">
          <CheckCircle2 className={`w-6 h-6 ${generatedLink ? 'text-green-500' : 'text-slate-500'}`} />
          Your Generated Link
        </CardTitle>
        <CardDescription>
          Share this link securely. It will appear here once generated.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {generatedLink ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[hsl(var(--input))] rounded-md border border-[hsl(var(--border))]">
              <span className="text-sm text-green-400 font-mono break-all mr-2">{generatedLink}</span>
              <Button size="sm" onClick={onCopyToClipboard} className={`bg-green-600 hover:bg-green-700 text-white ${isCopied ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isCopied}>
                {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-[hsla(var(--primary-raw),0.1)] rounded-md border border-[hsla(var(--primary-raw),0.2)]">
                <p className="font-semibold text-[hsl(var(--primary))]">Security</p>
                <p className="text-slate-300">{passwordSet ? 'Password Protected' : 'Public Link'}</p>
              </div>
              <div className="p-3 bg-[hsla(var(--secondary-raw),0.1)] rounded-md border border-[hsla(var(--secondary-raw),0.2)]">
                <p className="font-semibold text-[hsl(var(--secondary))]">Expiration</p>
                <p className="text-slate-300">{expirationDateSet ? new Date(expirationDateSet).toLocaleDateString() : 'No Expiry'}</p>
              </div>
            </div>
             <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-col items-center gap-4">
                <div className="p-2 bg-white rounded-lg border-4 border-primary shadow-lg">
                    <QRCodeCanvas
                        id="generated-qrcode"
                        value={generatedLink}
                        size={140}
                        bgColor={"#ffffff"}
                        fgColor={"#0f172a"}
                        level={"H"}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => window.open(generatedLink, '_blank')}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Test Link
                    </Button>
                    <Button onClick={downloadQRCode} className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90">
                        <Download className="mr-2 h-4 w-4" />
                        Download QR
                    </Button>
                </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <Link2 className="mx-auto h-12 w-12 mb-3" />
            <p>Your link will be displayed here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneratedLinkDisplay;