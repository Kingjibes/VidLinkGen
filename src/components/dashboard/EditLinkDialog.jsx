import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import LinkCustomizationForm from '@/components/generator/LinkCustomizationForm';

const EditLinkDialog = ({ isOpen, onOpenChange, currentLink, formData, onInputChange, onSubmit, isLoading }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="glassmorphic-card modern-border sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="font-space-grotesk">Edit Link Settings</DialogTitle>
        <DialogDescription>
          Update the customization options for your video link.
        </DialogDescription>
      </DialogHeader>
      {currentLink && (
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <LinkCustomizationForm
            formData={formData}
            onInputChange={onInputChange}
            isLoading={isLoading}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      )}
    </DialogContent>
  </Dialog>
);

export default EditLinkDialog;