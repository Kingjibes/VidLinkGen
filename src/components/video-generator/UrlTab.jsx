import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UrlTab = ({ user, handleUrlSubmit, initialUrl = '', triggerAuthModal }) => {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const onInputChange = (e) => {
    if (!user) {
      triggerAuthModal();
      return;
    }
    setUrl(e.target.value);
  };

  const onButtonClick = () => {
    if (!user) {
      triggerAuthModal();
      return;
    }
    handleUrlSubmit();
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
        />
      </div>
      <Button onClick={onButtonClick} className="w-full cyber-glow text-sm md:text-base">
        {initialUrl ? "Update Link from URL" : "Generate Secure Link from URL"}
      </Button>
    </div>
  );
};

export default UrlTab;