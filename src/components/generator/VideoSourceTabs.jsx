import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileVideo, XCircle } from 'lucide-react';

const VideoSourceTabs = ({
  activeTab,
  onTabChange,
  videoUrl,
  onVideoUrlChange,
  selectedFile,
  onFileSelect,
  onClearFile,
  isLoading,
  fileInputRef,
  uploadProgress,
}) => {
  return (
    <Tabs defaultValue="url" className="w-full" onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2 bg-[hsl(var(--muted))]">
        <TabsTrigger value="url">From URL</TabsTrigger>
        <TabsTrigger value="upload">Upload File</TabsTrigger>
      </TabsList>
      <TabsContent value="url" className="mt-4">
        <div className="space-y-2">
          <Label htmlFor="videoUrl" className="text-slate-300">Video URL (YouTube, Vimeo, etc.)</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            type="url"
            placeholder="https://example.com/video.mp4"
            value={videoUrl}
            onChange={onVideoUrlChange}
            className="bg-[hsl(var(--input))] border-[hsl(var(--border))]"
            disabled={activeTab !== 'url' || isLoading}
          />
        </div>
      </TabsContent>
      <TabsContent value="upload" className="mt-4">
        <div className="space-y-2">
          <Label htmlFor="videoFile" className="text-slate-300">Upload Video (Max 10GB)</Label>
          {!selectedFile ? (
            <div className="relative flex items-center justify-center w-full h-32 border-2 border-dashed border-[hsl(var(--border))] rounded-lg hover:border-[hsl(var(--primary))] transition-colors duration-200 bg-[hsl(var(--input))] cursor-pointer">
              <Input
                id="videoFile"
                ref={fileInputRef}
                name="videoFile"
                type="file"
                accept="video/*"
                onChange={onFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={activeTab !== 'upload' || isLoading}
              />
              <div className="text-center">
                <UploadCloud className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-400">
                  <span className="font-semibold text-[hsl(var(--primary))]">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">MP4, MOV, AVI, etc. up to 10GB</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[hsl(var(--input))] rounded-md border border-[hsl(var(--border))]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300 truncate">
                  <FileVideo className="w-5 h-5 text-[hsl(var(--primary))]" />
                  <span className="truncate" title={selectedFile.name}>{selectedFile.name}</span>
                  <span className="text-xs text-slate-500">({(selectedFile.size / (1024*1024)).toFixed(2)} MB)</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onClearFile} disabled={isLoading} className="text-slate-400 hover:text-red-500">
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
              {isLoading && uploadProgress > 0 && activeTab === 'upload' && (
                <div className="mt-2 w-full bg-slate-700 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default VideoSourceTabs;