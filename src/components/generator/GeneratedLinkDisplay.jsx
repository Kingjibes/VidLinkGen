import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, Copy, CheckCircle2 } from 'lucide-react';

const GeneratedLinkDisplay = ({ generatedLink, isCopied, onCopyToClipboard, passwordSet, expirationDateSet }) => {
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
          <div className="space-y-3">
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