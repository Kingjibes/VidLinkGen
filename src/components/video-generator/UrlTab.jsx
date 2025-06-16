import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UrlTab = ({ user, initialUrl = '', triggerAuthModal }) => {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const onInputChange = (e) => {
    if (!user && e.target.value) {
      triggerAuthModal();
      return;
    }
    setUrl(e.target.value);
  };


  return (
    <div className="space-y-3 md:space-y-4">
      <div className="space-y-1 md:space-y-2">
        <Label htmlFor="video-url" className="text-sm md:text-base">Video URL</Label>
        <Input
          id="video-url"
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          className="bg-background/50 text-sm md:text-base"
          value={url}
          onChange={onInputChange}
          disabled={!user && !initialUrl}
        />
      </div>
    </div>
  );
};

export default UrlTab;