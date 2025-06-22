import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

const DeleteLinkDialog = ({ isOpen, onOpenChange, currentLink, onSubmit, isLoading }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="glassmorphic-card modern-border sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="font-space-grotesk text-red-500">Confirm Deletion</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this link? This action cannot be undone. 
          {currentLink?.storage_path && " The associated video file in storage will also be removed."}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
        </DialogClose>
        <Button variant="destructive" onClick={onSubmit} disabled={isLoading}>
          {isLoading ? 'Deleting...' : 'Yes, Delete Link'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DeleteLinkDialog;