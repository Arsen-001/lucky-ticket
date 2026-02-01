import { VideoType } from '@/types/enums/video.enums';

export const videos = {
  support: {
    webm: { src: '/assets/videos/support-animation/support-animation.webm', type: VideoType.WEBM },
    mp4: { src: '/assets/videos/support-animation/support-animation.mp4', type: VideoType.MP4 },
  },
} as const;
