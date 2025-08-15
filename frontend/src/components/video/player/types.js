export interface VideoSource {
  url: string;
  quality: 'auto' | '360p' | '480p' | '720p' | '1080p' | '4K';
  label: string;
  isDefault?: boolean;
}

export interface SubtitleTrack {
  url: string;
  label: string;
  language: string;
  isDefault?: boolean;
}

export interface AudioTrack {
  id: string;
  label: string;
  language: string;
  isDefault?: boolean;
}

export interface Chapter {
  title: string;
  start: number;
  end: number;
  type?: 'intro' | 'recap' | 'ending' | 'chapter';
}

export interface NextEpisode {
  id: string;
  title: string;
  poster: string;
  episode?: number;
  season?: number;
  duration?: number;
}

export interface PlayerMarkers {
  intro?: { start: number; end: number };
  recap?: { start: number; end: number };
  ending?: { start: number; end: number };
}

export interface ThumbnailCue {
  startTime: number;
  endTime: number;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DRMConfig {
  type: 'widevine' | 'playready' | 'fairplay';
  licenseUrl: string;
  certificateUrl?: string;
  headers?: Record<string, string>;
}

export interface AnalyticsEvent {
  type: 'play' | 'pause' | 'seek' | 'buffer' | 'error' | 'quality_change' | 'subtitle_change' | 'chapter_skip' | 'next_episode_shown' | 'next_episode_accepted';
  sessionId: string;
  timestamp: number;
  currentTime: number;
  duration: number;
  bitrate?: number;
  quality?: string;
  subtitle?: string;
  volume?: number;
  muted?: boolean;
  playbackRate?: number;
  audio?: string;
  chapterType?: string;
  bufferedRanges?: TimeRanges;
  error?: {
    code: number;
    message: string;
    details?: any;
  };
}

export interface PlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  isPiP: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  currentQuality: string;
  currentSubtitle: string | null;
  currentAudio: string | null;
  bufferedRanges: TimeRanges | null;
  error: string | null;
}

export interface PlayerConfig {
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  crossOrigin?: 'anonymous' | 'use-credentials';
  controls?: boolean;
  fluid?: boolean;
  responsive?: boolean;
  aspectRatio?: string;
  playsinline?: boolean;
  poster?: string;
  startTime?: number;
  endTime?: number;
  maxBitrate?: number;
  minBitrate?: number;
  bufferLength?: number;
  enableWorker?: boolean;
  lowLatencyMode?: boolean;
  debug?: boolean;
}

export interface VideoPlayerProps {
  // Required
  sources: VideoSource[];
  
  // Optional content
  poster?: string;
  subtitles?: SubtitleTrack[];
  audioTracks?: AudioTrack[];
  chapters?: Chapter[];
  markers?: PlayerMarkers;
  nextEpisode?: NextEpisode;
  thumbnailVttUrl?: string;
  
  // Player config
  config?: PlayerConfig;
  drm?: DRMConfig;
  
  // UI customization
  title?: string;
  titleEn?: string;
  season?: number;
  episode?: number;
  className?: string;
  theme?: 'dark' | 'light';
  
  // Persistence
  persistKey?: string;
  resumePosition?: number;
  
  // Callbacks
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  onProgress?: (buffered: TimeRanges) => void;
  onQualityChange?: (quality: string) => void;
  onSubtitleChange?: (subtitle: string | null) => void;
  onAudioChange?: (audio: string | null) => void;
  onError?: (error: any) => void;
  onAnalytics?: (event: AnalyticsEvent) => void;
  onRequestStreamRefresh?: () => Promise<VideoSource[]>;
  onNextEpisode?: () => void;
  onChapterSkip?: (chapter: Chapter) => void;
  
  // Feature flags
  enablePiP?: boolean;
  enableFullscreen?: boolean;
  enableAirPlay?: boolean;
  enableChromecast?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableMobileGestures?: boolean;
  enableAnalytics?: boolean;
  enableAds?: boolean;
  enableAutoNextEpisode?: boolean;
  enableChapterSkipping?: boolean;
  enableThumbnailPreview?: boolean;
  
  // Internationalization
  locale?: 'en' | 'vi';
}

export interface PlayerContextType {
  state: PlayerState;
  actions: {
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    setPlaybackRate: (rate: number) => void;
    setQuality: (quality: string) => void;
    setSubtitle: (subtitle: string | null) => void;
    setAudio: (audio: string | null) => void;
    enterFullscreen: () => void;
    exitFullscreen: () => void;
    toggleFullscreen: () => void;
    enterPiP: () => void;
    exitPiP: () => void;
    togglePiP: () => void;
    skipChapter: (type: 'intro' | 'recap' | 'ending') => void;
    goToNextEpisode: () => void;
    restart: () => void;
    destroy: () => void;
  };
  refs: {
    videoRef: React.RefObject<HTMLVideoElement>;
    containerRef: React.RefObject<HTMLDivElement>;
  };
}
