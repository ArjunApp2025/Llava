# Videos Folder

This folder contains video files that can be used in the ITF Curb Zone Map.

## How to Use

1. Place your video files (`.mp4`, `.webm`, `.ogg`, etc.) in this folder
2. Update the `publicVideos` array in `src/components/liveops/ZoneMap.tsx` to include your videos:

```typescript
const publicVideos: VideoOption[] = [
  { id: 'video1', name: 'Curb Zone Camera 1', path: '/videos/camera1.mp4', type: 'public' },
  { id: 'video2', name: 'Curb Zone Camera 2', path: '/videos/camera2.mp4', type: 'public' },
];
```

3. The videos will appear in the "Select Video" dropdown in the UI
4. Videos will automatically loop when selected

## Uploading Videos

You can also upload videos directly from the UI using the "Upload Media" button. Uploaded videos are stored in the browser's localStorage and will persist until cleared.


