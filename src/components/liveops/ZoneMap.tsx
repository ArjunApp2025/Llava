import React, { useState, useRef, useEffect } from 'react';
import type { ZoneMetric, ZoneType } from '../../types';

interface ZoneMapProps {
  zones: ZoneMetric[];
  selectedZoneId: string | null;
  onZoneClick: (zoneId: string) => void;
  onZoneFocus: (zoneId: string | null) => void;
}

type MediaType = 'image' | 'video' | null;

interface VideoOption {
  id: string;
  name: string;
  path: string;
  type: 'uploaded' | 'public';
}

export function ZoneMap({ zones, selectedZoneId, onZoneClick, onZoneFocus }: ZoneMapProps) {
  const [mediaSource, setMediaSource] = useState<string>('');
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [uploadedVideos, setUploadedVideos] = useState<VideoOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load uploaded videos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('uploadedVideos');
    if (stored) {
      try {
        const videos = JSON.parse(stored) as VideoOption[];
        setUploadedVideos(videos);
      } catch (e) {
        console.error('Failed to load uploaded videos', e);
      }
    }
  }, []);

  // Available videos in public/videos folder
  const publicVideos: VideoOption[] = [
    { id: 'video1', name: 'Curb Zone Camera 1 (4K 60fps)', path: '/videos/13348446_3840_2160_60fps.mp4', type: 'public' },
    { id: 'video2', name: 'Curb Zone Camera 2 (HD 30fps)', path: '/videos/3611605-hd_1920_1080_30fps.mp4', type: 'public' },
  ];

  const allVideos = [...publicVideos, ...uploadedVideos];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const videoOption: VideoOption = {
            id: `uploaded-${Date.now()}`,
            name: file.name,
            path: dataUrl,
            type: 'uploaded',
          };
          
          // Save to localStorage
          const updated = [...uploadedVideos, videoOption];
          setUploadedVideos(updated);
          localStorage.setItem('uploadedVideos', JSON.stringify(updated));
          
          // Auto-select the uploaded video
          setSelectedVideo(videoOption.id);
          setMediaSource(dataUrl);
          setMediaType('video');
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setMediaSource(event.target?.result as string);
          setMediaType('image');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideo(videoId);
    const video = allVideos.find((v) => v.id === videoId);
    if (video) {
      setMediaSource(video.path);
      setMediaType('video');
    }
  };

  const handleUrlChange = (url: string) => {
    setMediaSource(url);
    setSelectedVideo(''); // Clear video selection when using URL
    if (url) {
      // Simple detection
      if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        setMediaType('image');
      } else if (url.match(/\.(mp4|webm|ogg)$/i) || url.includes('youtube') || url.includes('vimeo')) {
        setMediaType('video');
      } else {
        setMediaType('image'); // Default to image
      }
    } else {
      setMediaType(null);
    }
  };

  const handleClear = () => {
    setMediaSource('');
    setMediaType(null);
    setSelectedVideo('');
  };

  return (
    <div ref={containerRef} className="bg-gray-800 rounded-lg p-4 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20 relative">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-lg font-semibold">ITF Curb Zone Map</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Video Selector Dropdown */}
          {allVideos.length > 0 && (
            <select
              value={selectedVideo}
              onChange={(e) => handleVideoSelect(e.target.value)}
              className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select video"
            >
              <option value="">Select Video</option>
              {publicVideos.length > 0 && (
                <optgroup label="Public Videos">
                  {publicVideos.map((video) => (
                    <option key={video.id} value={video.id}>
                      {video.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {uploadedVideos.length > 0 && (
                <optgroup label="Uploaded Videos">
                  {uploadedVideos.map((video) => (
                    <option key={video.id} value={video.id}>
                      {video.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload image or video"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
          >
            Upload Media
          </button>
          <input
            type="text"
            placeholder="Or enter URL"
            value={selectedVideo ? '' : mediaSource}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={!!selectedVideo}
            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {mediaSource && (
            <button
              onClick={handleClear}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm text-white transition-colors"
              aria-label="Clear media"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Zone indicator boxes at the top */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {zones.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => onZoneClick(zone.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-label={`Select ${zone.name} zone`}
            >
              {zone.name}
            </button>
          );
        })}
      </div>

      {/* Map container with image/video background - NO zone overlays */}
      <div className="relative w-full rounded-lg overflow-hidden" style={{ height: '400px' }}>
        {/* Background image or video */}
        {mediaSource && mediaType === 'image' && (
          <img
            src={mediaSource}
            alt="ITF Curb Zone"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          />
        )}
        {mediaSource && mediaType === 'video' && (
          <video
            key={mediaSource} // Force re-render when source changes
            src={mediaSource}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            style={{ zIndex: 0 }}
            controls={false}
          />
        )}

        {/* Fallback background if no media */}
        {!mediaSource && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center" style={{ zIndex: 0 }}>
            <div className="text-center">
              <p className="text-gray-500 mb-2">Upload an image or video, or select from videos</p>
              <p className="text-xs text-gray-600">Place video files in /public/videos/ folder to access them</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
