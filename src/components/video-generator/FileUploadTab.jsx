import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileVideo } from 'lucide-react';
import config from '@/config';

const FileUploadTab = ({ user, isUploading, uploadProgress, handleFileUpload, triggerAuthModal, triggerPremiumModal, currentFile }) => {
  
  const onFileChoose = () => {
    if (!user) {
      triggerAuthModal();
      return;
    }
    document.getElementById('video-upload-input').click();
  };

  const getUploadLimitText = () => {
    if (!user) return `${(config.uploadLimits.free / (1024*1024)).toFixed(0)}MB`; // Default to free limit if no user
    if (user.is_premium && user.premium_tier) {
      const limit = config.uploadLimits[user.premium_tier] || config.uploadLimits.legacy_premium; // Fallback for older premium
      if (limit >= 1024 * 1024 * 1024 * 1024) { // TB
        return `${(limit / (1024*1024*1024*1024)).toFixed(0)}TB`;
      } else { // GB
        return `${(limit / (1024*1024*1024)).toFixed(0)}GB`;
      }
    }
    return `${(config.uploadLimits.free / (1024*1024)).toFixed(0)}MB`;
  };


  return (
    <div className="space-y-4 md:space-y-6">
      <div className="upload-zone rounded-lg p-6 md:p-8 text-center">
        {currentFile && !isUploading ? (
          <div className="flex flex-col items-center">
            <FileVideo className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-green-500" />
            <p className="text-sm text-muted-foreground mb-2">Selected: {currentFile.name}</p>
            <Button
              onClick={onFileChoose}
              className="cyber-glow text-sm md:text-base"
              size="sm"
              variant="outline"
            >
              Change File
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-blue-500" />
            <h3 className="text-md md:text-lg font-semibold mb-2">Upload your video</h3>
            <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
              Maximum file size: {getUploadLimitText()}
              {!user?.is_premium && user && (
                <span className="block text-yellow-500 text-xs mt-1">
                  Upgrade to Premium for larger uploads!
                </span>
              )}
            </p>
            <Button
              onClick={onFileChoose}
              disabled={isUploading}
              className="cyber-glow text-sm md:text-base"
              size="sm"
            >
              {isUploading ? `Uploading... ${uploadProgress}%` : 'Choose Video File'}
            </Button>
          </>
        )}
        <input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
          id="video-upload-input"
          disabled={isUploading || !user}
        />
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