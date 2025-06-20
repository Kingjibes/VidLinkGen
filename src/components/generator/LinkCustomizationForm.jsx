import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, LockKeyhole } from 'lucide-react';

const LinkCustomizationForm = ({ formData, onInputChange, isLoading }) => {
  return (
    <>
      <div>
        <Label htmlFor="customName" className="text-slate-300">Custom Link Alias (Optional)</Label>
        <Input 
          id="customName" 
          name="customName" 
          placeholder="e.g., my-project-preview" 
          value={formData.customName} 
          onChange={onInputChange} 
          className="bg-[hsl(var(--input))] border-[hsl(var(--border))]" 
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="description" className="text-slate-300">Description (Optional)</Label>
        <Input 
          id="description" 
          name="description" 
          placeholder="A brief note about this video" 
          value={formData.description} 
          onChange={onInputChange} 
          className="bg-[hsl(var(--input))] border-[hsl(var(--border))]" 
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expirationDate" className="text-slate-300 flex items-center gap-1.5"><CalendarDays className="w-4 h-4" />Expires On</Label>
          <Input 
            id="expirationDate" 
            name="expirationDate" 
            type="datetime-local" 
            value={formData.expirationDate} 
            onChange={onInputChange} 
            className="bg-[hsl(var(--input))] border-[hsl(var(--border))]" 
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-slate-300 flex items-center gap-1.5"><LockKeyhole className="w-4 h-4" />Set Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="Leave blank if not needed" 
            value={formData.password} 
            onChange={onInputChange} 
            className="bg-[hsl(var(--input))] border-[hsl(var(--border))]" 
            disabled={isLoading}
          />
        </div>
      </div>
    </>
  );
};

export default LinkCustomizationForm;