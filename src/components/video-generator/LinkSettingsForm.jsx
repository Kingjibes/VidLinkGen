import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Shield, Info, Users, PlusCircle, XCircle, CheckSquare } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

const LinkSettingsForm = ({ 
  user, 
  linkSettings, 
  setLinkSettings, 
  currentEmailInput, 
  setCurrentEmailInput, 
  isEditing, 
  onSave,
  triggerAuthModal,
  triggerPremiumModal,
  handleAttemptPremiumFeature
}) => {
  
  const handleAddEmail = () => {
     handleAttemptPremiumFeature("Advanced Access Control", () => {
        if (currentEmailInput && !linkSettings.allowedEmails.includes(currentEmailInput) && /\S+@\S+\.\S+/.test(currentEmailInput)) {
          setLinkSettings(prev => ({ ...prev, allowedEmails: [...prev.allowedEmails, currentEmailInput] }));
          setCurrentEmailInput('');
        }
    });
  };

  const handleRemoveEmail = (emailToRemove) => {
     handleAttemptPremiumFeature("Advanced Access Control", () => {
        setLinkSettings(prev => ({ ...prev, allowedEmails: prev.allowedEmails.filter(email => email !== emailToRemove) }));
    });
  };
  
  const handlePasswordChange = (e) => {
    if (!user) { triggerAuthModal(); return; }
    if (!user.is_premium) { 
      if(e.target.value) triggerPremiumModal("Password Protection"); 
      return; 
    }
    setLinkSettings({...linkSettings, password: e.target.value});
  };

  const handleEncryptionToggle = (checked) => {
     handleAttemptPremiumFeature("File Encryption", () => {
        setLinkSettings(prev => ({ ...prev, isEncrypted: checked }));
    });
  };


  return (
    <div className="mt-6 md:mt-8 space-y-3 md:space-y-4 border-t border-white/10 pt-4 md:pt-6">
      <h3 className="text-md md:text-lg font-semibold flex items-center space-x-2">
        <Lock className="h-4 w-4" />
        <span>Link Settings</span>
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-1 md:space-y-2">
          <Label htmlFor="custom-name" className="text-xs md:text-sm">Custom Name</Label>
          <Input
            id="custom-name"
            placeholder="My awesome video"
            value={linkSettings.customName}
            onChange={(e) => user ? setLinkSettings({...linkSettings, customName: e.target.value}) : triggerAuthModal()}
            disabled={!user} className="text-xs md:text-sm"
          />
        </div>
        
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs md:text-sm">Password Protection</Label>
            {!user?.is_premium && user && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-yellow-500 cursor-help" onClick={() => triggerPremiumModal("Password Protection")} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upgrade to Premium to enable password protection.</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Optional password"
            value={linkSettings.password}
            onChange={handlePasswordChange}
            disabled={!user || !user.is_premium} 
            className="text-xs md:text-sm"
          />
        </div>
        
        <div className="space-y-1 md:space-y-2">
          <Label htmlFor="expiry" className="text-xs md:text-sm">Expiry Date</Label>
          <Input
            id="expiry"
            type="date"
            value={linkSettings.expiryDate}
            onChange={(e) => user ? setLinkSettings({...linkSettings, expiryDate: e.target.value}) : triggerAuthModal()}
            disabled={!user} className="text-xs md:text-sm"
          />
        </div>
        
        <div className="space-y-1 md:space-y-2">
          <Label htmlFor="description" className="text-xs md:text-sm">Description</Label>
          <Input
            id="description"
            placeholder="Video description"
            value={linkSettings.description}
            onChange={(e) => user ? setLinkSettings({...linkSettings, description: e.target.value}) : triggerAuthModal()}
            disabled={!user} className="text-xs md:text-sm"
          />
        </div>
      </div>

      
      <div className="pt-4 border-t border-white/10 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm md:text-base font-semibold flex items-center space-x-2">
              <Users className={`h-4 w-4 ${user?.is_premium ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span>Advanced Access Control</span>
            </h4>
             {!user?.is_premium && user && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-yellow-500 cursor-help" onClick={() => triggerPremiumModal("Advanced Access Control")} />
                </TooltipTrigger>
                <TooltipContent><p>Upgrade to Premium feature.</p></TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="allowed-emails" className="text-xs">Allowed Emails (one per entry)</Label>
            <div className="flex space-x-2">
              <Input
                id="allowed-emails"
                type="email"
                placeholder="user@example.com"
                value={currentEmailInput}
                onChange={(e) => user ? setCurrentEmailInput(e.target.value) : triggerAuthModal()}
                disabled={!user || !user.is_premium}
                className="text-xs"
              />
              <Button type="button" onClick={handleAddEmail} size="sm" variant="outline" className="text-xs" disabled={!user || !user.is_premium}>
                <PlusCircle className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            {linkSettings.allowedEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {linkSettings.allowedEmails.map(email => (
                  <Badge key={email} variant="secondary" className="text-xs py-1 px-2">
                    {email}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveEmail(email)}
                       disabled={!user || !user.is_premium}
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              If no emails are added, the link will be public (respecting password/expiry). Adding emails restricts access to only those users. (Premium Feature)
            </p>
          </div>
        </div>
      

     
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
                 <Shield className={`h-4 w-4 md:h-5 md:w-5 ${user?.is_premium ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                <Label htmlFor="encryption-switch" className="text-xs md:text-sm">File Encryption</Label>
            </div>
            <div className="flex items-center space-x-2">
                {!user?.is_premium && user && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-yellow-500 cursor-help" onClick={() => triggerPremiumModal("File Encryption")} />
                    </TooltipTrigger>
                    <TooltipContent><p>Upgrade to Premium feature.</p></TooltipContent>
                  </Tooltip>
                )}
                <Switch
                    id="encryption-switch"
                    checked={linkSettings.isEncrypted}
                    onCheckedChange={handleEncryptionToggle}
                    disabled={!user || !user.is_premium}
                />
            </div>
        </div>
     

      
        <Button onClick={onSave} className="w-full mt-6 cyber-glow" disabled={!user && !isEditing}>
          {isEditing ? "Save Changes" : "Generate Secure Link"}
        </Button>
      
    </div>
  );
};

export default LinkSettingsForm;