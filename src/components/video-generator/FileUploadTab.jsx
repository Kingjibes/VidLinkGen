import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload } from 'lucide-react';

const FileUploadTab = ({ user, isUploading, uploadProgress, handleFileUpload, triggerAuthModal, triggerPremiumModal }) => {
  
  const onFileChoose = () => {
    if (!user) {
      triggerAuthModal();
      return;
    }
    document.getElementById('video-upload-input').click();
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="upload-zone rounded-lg p-6 md:p-8 text-center">
        <Upload className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-blue-500" />
        <h3 className="text-md md:text-lg font-semibold mb-2">Upload your video</h3>
        <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
          Maximum file size: {user?.is_premium ? '2TB' : '2GB'}
          {!user?.is_premium && user && (
            <span className="block text-yellow-500 text-xs mt-1">
              Upgrade to Premium for 2TB uploads!
            </span>
          )}
        </p>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
          id="video-upload-input"
          disabled={isUploading || !user}
        />
        <Button
          onClick={onFileChoose}
          disabled={isUploading}
          className="cyber-glow text-sm md:text-base"
          size="sm"
        >
          {isUploading ? `Uploading... ${uploadProgress}%` : 'Choose Video File'}
        </Button>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs md:text-sm">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full h-2 md:h-3" />
        </div>
      )}
    </div>
  );
};

export default FileUploadTab;