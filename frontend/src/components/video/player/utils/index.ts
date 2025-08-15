import { PLAYER_CONSTANTS, QUALITY_LEVELS } from '../constants';
import type { ThumbnailCue, AnalyticsEvent } from '../types';

/**
 * Format time in MM:SS or HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse WebVTT thumbnail file
 */
export function parseWebVTT(vttText: string): ThumbnailCue[] {
  const cues: ThumbnailCue[] = [];
  const lines = vttText.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Skip headers and empty lines
    if (!line || line.startsWith('WEBVTT') || line.startsWith('NOTE')) {
      i++;
      continue;
    }
    
    // Parse timestamp line
    const timestampMatch = line.match(/^(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})$/);
    if (timestampMatch) {
      const startTime = parseTimeString(timestampMatch[1]);
      const endTime = parseTimeString(timestampMatch[2]);
      
      i++;
      if (i < lines.length) {
        const urlLine = lines[i].trim();
        const urlMatch = urlLine.match(/^(.+?)#xywh=(\d+),(\d+),(\d+),(\d+)$/);
        
        if (urlMatch) {
          cues.push({
            startTime,
            endTime,
            url: urlMatch[1],
            x: parseInt(urlMatch[2]),
            y: parseInt(urlMatch[3]),
            width: parseInt(urlMatch[4]),
            height: parseInt(urlMatch[5]),
          });
        }
      }
    }
    
    i++;
  }
  
  return cues;
}

/**
 * Parse time string to seconds
 */
function parseTimeString(timeString: string): number {
  const parts = timeString.split(':');
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const [seconds, milliseconds] = parts[2].split('.');
  
  return hours * 3600 + minutes * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
}

/**
 * Get thumbnail for specific time
 */
export function getThumbnailAtTime(thumbnails: ThumbnailCue[], time: number): ThumbnailCue | null {
  return thumbnails.find(thumb => time >= thumb.startTime && time <= thumb.endTime) || null;
}

/**
 * Generate session ID for analytics
 */
export function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get video quality label
 */
export function getQualityLabel(quality: string): string {
  return QUALITY_LEVELS[quality as keyof typeof QUALITY_LEVELS]?.label || quality;
}

/**
 * Check if browser supports features
 */
export const browserSupport = {
  hls: () => {
    const video = document.createElement('video');
    return video.canPlayType('application/vnd.apple.mpegurl') !== '';
  },
  
  mse: () => {
    return typeof window !== 'undefined' && 'MediaSource' in window;
  },
  
  pip: () => {
    return typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;
  },
  
  fullscreen: () => {
    return typeof document !== 'undefined' && (
      'fullscreenEnabled' in document ||
      'webkitFullscreenEnabled' in document ||
      'mozFullScreenEnabled' in document ||
      'msFullscreenEnabled' in document
    );
  },
  
  airplay: () => {
    const video = document.createElement('video');
    return 'webkitShowPlaybackTargetPicker' in video;
  },
  
  mediaSession: () => {
    return typeof navigator !== 'undefined' && 'mediaSession' in navigator;
  },
  
  webrtc: () => {
    return typeof window !== 'undefined' && 'RTCPeerConnection' in window;
  },
};

/**
 * Detect device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || 
    (navigator.maxTouchPoints > 1 && window.screen.width >= 768);
  
  if (isMobile && !isTablet) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

/**
 * Check if device is touch-enabled
 */
export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCallTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallTime >= delay) {
      func(...args);
      lastCallTime = now;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastCallTime = Date.now();
      }, delay - (now - lastCallTime));
    }
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if value is in range
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Get buffered percentage
 */
export function getBufferedPercentage(buffered: TimeRanges, duration: number): number {
  if (!buffered || !duration || buffered.length === 0) return 0;
  
  let bufferedAmount = 0;
  for (let i = 0; i < buffered.length; i++) {
    bufferedAmount += buffered.end(i) - buffered.start(i);
  }
  
  return Math.min((bufferedAmount / duration) * 100, 100);
}

/**
 * Get buffered ranges array
 */
export function getBufferedRanges(buffered: TimeRanges): Array<{start: number, end: number}> {
  const ranges = [];
  if (buffered) {
    for (let i = 0; i < buffered.length; i++) {
      ranges.push({
        start: buffered.start(i),
        end: buffered.end(i),
      });
    }
  }
  return ranges;
}

/**
 * Storage utilities for resume position
 */
export const storage = {
  get: (key: string): any => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  },
};

/**
 * Create analytics event
 */
export function createAnalyticsEvent(
  type: string,
  sessionId: string,
  videoElement: HTMLVideoElement,
  additionalData: Partial<AnalyticsEvent> = {}
): AnalyticsEvent {
  return {
    type,
    sessionId,
    timestamp: Date.now(),
    currentTime: videoElement.currentTime,
    duration: videoElement.duration,
    bufferedRanges: videoElement.buffered,
    ...additionalData,
  } as AnalyticsEvent;
}

/**
 * Get video stats for analytics
 */
export function getVideoStats(videoElement: HTMLVideoElement) {
  return {
    currentTime: videoElement.currentTime,
    duration: videoElement.duration,
    buffered: getBufferedRanges(videoElement.buffered),
    playbackRate: videoElement.playbackRate,
    volume: videoElement.volume,
    muted: videoElement.muted,
    paused: videoElement.paused,
    ended: videoElement.ended,
    readyState: videoElement.readyState,
    networkState: videoElement.networkState,
    videoWidth: videoElement.videoWidth,
    videoHeight: videoElement.videoHeight,
  };
}

/**
 * Calculate bandwidth from video stats
 */
export function calculateBandwidth(
  videoElement: HTMLVideoElement
): number | null {
  // This would need access to HLS.js instance for accurate bandwidth
  // For now, return null and let HLS.js handle bandwidth detection
  return null;
}

/**
 * Get error message from error code
 */
export function getErrorMessage(error: any, locale: 'en' | 'vi' = 'vi'): string {
  const messages = {
    vi: {
      [1]: 'Quá trình tải video bị hủy bỏ',
      [2]: 'Lỗi mạng khi tải video',
      [3]: 'Lỗi giải mã video',
      [4]: 'Định dạng video không được hỗ trợ',
      'HLS_NETWORK_ERROR': 'Lỗi mạng khi phát video',
      'HLS_MEDIA_ERROR': 'Lỗi media khi phát video',
      'HLS_OTHER_ERROR': 'Lỗi không xác định',
      'DRM_ERROR': 'Lỗi bảo vệ bản quyền',
      'STREAM_EXPIRED': 'Liên kết video đã hết hạn',
      'default': 'Đã xảy ra lỗi khi phát video',
    },
    en: {
      [1]: 'Video loading was aborted',
      [2]: 'Network error while loading video',
      [3]: 'Video decoding error',
      [4]: 'Video format not supported',
      'HLS_NETWORK_ERROR': 'Network error during playback',
      'HLS_MEDIA_ERROR': 'Media error during playback',
      'HLS_OTHER_ERROR': 'Unknown error occurred',
      'DRM_ERROR': 'DRM protection error',
      'STREAM_EXPIRED': 'Video stream has expired',
      'default': 'An error occurred during video playback',
    },
  };
  
  const errorCode = error?.code || error?.type || 'default';
  return messages[locale][errorCode] || messages[locale]['default'];
}
