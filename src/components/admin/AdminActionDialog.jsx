import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

const AdminActionDialog = ({ isOpen, onOpenChange, onConfirm, isLoading, title, description, confirmText, confirmVariant = 'destructive' }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="glassmorphic-card modern-border sm:max-w-md">
      <DialogHeader>
        <DialogHeader>
          <DialogTitle className={`font-space-grotesk ${confirmVariant === 'destructive' ? 'text-red-500' : 'text-yellow-500'}`}>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
        </DialogClose>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Processing...' : confirmText}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AdminActionDialog;