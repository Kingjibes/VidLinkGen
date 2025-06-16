import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { LifeBuoy } from 'lucide-react';

const SupportModal = ({ open, onOpenChange, user }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Missing Information", description: "Please provide both subject and message.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to submit a ticket.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        user_email: user.email,
        subject,
        message,
        priority: user.is_premium ? 'high' : 'normal',
        status: 'open'
      });

    setIsLoading(false);
    if (error) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket Submitted!", description: "Our support team will get back to you shortly.", variant: "default" });
      setSubject('');
      setMessage('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-gradient font-orbitron flex items-center">
            <LifeBuoy className="h-6 w-6 mr-2 text-blue-500" /> Submit Support Ticket
          </DialogTitle>
          <DialogDescription>
            {user?.is_premium ? "As a premium user, your ticket will be prioritized." : "Describe your issue, and we'll get back to you."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="support-subject">Subject</Label>
            <Input 
              id="support-subject" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="e.g., Issue with video upload"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="support-message">Message</Label>
            <Textarea 
              id="support-message" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Please describe your issue in detail..."
              rows={5}
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" className="cyber-glow" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportModal;