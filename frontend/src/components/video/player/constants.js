export const PLAYER_CONSTANTS = {
  // UI timing
  CONTROLS_AUTO_HIDE_DELAY: 2500,
  NEXT_EPISODE_SHOW_TIME: 30, // seconds before end
  NEXT_EPISODE_AUTO_PLAY_DELAY: 10, // seconds
  TOAST_DURATION: 3000,
  
  // Seek amounts
  SEEK_SMALL: 5, // seconds
  SEEK_MEDIUM: 10, // seconds
  SEEK_LARGE: 30, // seconds
  
  // Volume steps
  VOLUME_STEP: 0.1,
  
  // Playback rates
  PLAYBACK_RATES: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  
  // Buffer thresholds
  BUFFER_AHEAD: 30, // seconds
  BUFFER_BEHIND: 5, // seconds
  
  // Error retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  
  // Analytics
  HEARTBEAT_INTERVAL: 30000, // ms
  
  // Gesture sensitivity
  DOUBLE_TAP_THRESHOLD: 300, // ms
  SWIPE_THRESHOLD: 50, // pixels
  PINCH_THRESHOLD: 0.1,
};

export const QUALITY_LEVELS = {
  'auto': { label: 'Tự động', height: 0, bitrate: 0 },
  '360p': { label: '360p', height: 360, bitrate: 400000 },
  '480p': { label: '480p', height: 480, bitrate: 800000 },
  '720p': { label: '720p HD', height: 720, bitrate: 1500000 },
  '1080p': { label: '1080p FHD', height: 1080, bitrate: 3000000 },
  '4K': { label: '4K UHD', height: 2160, bitrate: 8000000 },
};

export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: ['k', ' '] as string[],
  SEEK_BACKWARD_SMALL: ['ArrowLeft'] as string[],
  SEEK_FORWARD_SMALL: ['ArrowRight'] as string[],
  SEEK_BACKWARD_MEDIUM: ['j'] as string[],
  SEEK_FORWARD_MEDIUM: ['l'] as string[],
  VOLUME_UP: ['ArrowUp'] as string[],
  VOLUME_DOWN: ['ArrowDown'] as string[],
  MUTE: ['m'] as string[],
  FULLSCREEN: ['f'] as string[],
  CAPTIONS: ['c'] as string[],
  PICTURE_IN_PICTURE: ['i'] as string[],
  FRAME_BACKWARD: [','] as string[],
  FRAME_FORWARD: ['.'] as string[],
  SKIP_INTRO: ['s'] as string[],
  SPEED_UP: ['>'] as string[],
  SPEED_DOWN: ['<'] as string[],
  QUALITY_UP: ['+'] as string[],
  QUALITY_DOWN: ['-'] as string[],
};

export const MOBILE_GESTURES = {
  DOUBLE_TAP_SEEK: true,
  SWIPE_VOLUME: true,
  SWIPE_BRIGHTNESS: false, // UI only, no OS control
  PINCH_ZOOM: false,
};

export const ANALYTICS_EVENTS = {
  PLAYER_READY: 'player_ready',
  PLAY: 'play',
  PAUSE: 'pause',
  SEEK: 'seek',
  BUFFER_START: 'buffer_start',
  BUFFER_END: 'buffer_end',
  QUALITY_CHANGE: 'quality_change',
  SUBTITLE_CHANGE: 'subtitle_change',
  AUDIO_CHANGE: 'audio_change',
  VOLUME_CHANGE: 'volume_change',
  FULLSCREEN_ENTER: 'fullscreen_enter',
  FULLSCREEN_EXIT: 'fullscreen_exit',
  PIP_ENTER: 'pip_enter',
  PIP_EXIT: 'pip_exit',
  ERROR: 'error',
  CHAPTER_SKIP: 'chapter_skip',
  NEXT_EPISODE_SHOWN: 'next_episode_shown',
  NEXT_EPISODE_ACCEPTED: 'next_episode_accepted',
  NEXT_EPISODE_DISMISSED: 'next_episode_dismissed',
  PLAYBACK_RATE_CHANGE: 'playback_rate_change',
  ENDED: 'ended',
  HEARTBEAT: 'heartbeat',
};

export const ERROR_CODES = {
  MEDIA_ERR_ABORTED: 1,
  MEDIA_ERR_NETWORK: 2,
  MEDIA_ERR_DECODE: 3,
  MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
  HLS_NETWORK_ERROR: 'HLS_NETWORK_ERROR',
  HLS_MEDIA_ERROR: 'HLS_MEDIA_ERROR',
  HLS_OTHER_ERROR: 'HLS_OTHER_ERROR',
  DRM_ERROR: 'DRM_ERROR',
  STREAM_EXPIRED: 'STREAM_EXPIRED',
};

export const SUBTITLE_STYLES = {
  fontSize: {
    small: '14px',
    medium: '18px',
    large: '22px',
    xlarge: '26px',
  },
  fontFamily: {
    default: 'Arial, sans-serif',
    roboto: 'Roboto, sans-serif',
    opensans: 'Open Sans, sans-serif',
    montserrat: 'Montserrat, sans-serif',
  },
  color: {
    white: '#FFFFFF',
    yellow: '#FFFF00',
    green: '#00FF00',
    cyan: '#00FFFF',
    red: '#FF0000',
    magenta: '#FF00FF',
    blue: '#0000FF',
    black: '#000000',
  },
  backgroundColor: {
    none: 'transparent',
    black: 'rgba(0, 0, 0, 0.8)',
    white: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(0, 0, 0, 0.6)',
  },
  outline: {
    none: 'none',
    black: '1px solid #000000',
    white: '1px solid #FFFFFF',
    shadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
  },
  position: {
    bottom: 'bottom',
    top: 'top',
    center: 'center',
  },
};

export const TAILWIND_THEME = {
  colors: {
    panel: '#12182A',
    border: '#22304F',
    text: '#E6EAF2',
    textMuted: '#9AA6C1',
    primary: '#60A5FA',
    accent: '#F5C84B',
    accentText: '#0B1020',
    elevated: '#1A2138',
    overlay: 'rgba(0, 0, 0, 0.8)',
    glass: 'rgba(18, 24, 42, 0.8)',
  },
  backdrop: 'backdrop-blur-sm',
  radius: 'rounded-2xl',
  shadow: 'shadow-2xl',
  transition: 'transition-all duration-200',
};

export const HLS_CONFIG = {
  debug: false,
  enableWorker: true,
  lowLatencyMode: true,
  backBufferLength: 90,
  maxBufferLength: 30,
  maxMaxBufferLength: 600,
  maxBufferSize: 60 * 1000 * 1000,
  maxBufferHole: 0.5,
  highBufferWatchdogPeriod: 2,
  nudgeOffset: 0.1,
  nudgeMaxRetry: 3,
  maxFragLookUpTolerance: 0.25,
  liveSyncDurationCount: 3,
  liveMaxLatencyDurationCount: 10,
  enableCEA708Captions: true,
  enableWebVTT: true,
  captionsTextTrack1Label: 'Vietnamese',
  captionsTextTrack1LanguageCode: 'vi',
  captionsTextTrack2Label: 'English',
  captionsTextTrack2LanguageCode: 'en',
  abrEwmaFastLive: 3.0,
  abrEwmaSlowLive: 9.0,
  abrEwmaFastVoD: 3.0,
  abrEwmaSlowVoD: 9.0,
  abrEwmaDefaultEstimate: 500000,
  abrBandWidthFactor: 0.95,
  abrBandWidthUpFactor: 0.7,
  abrMaxWithRealBitrate: false,
  maxStarvationDelay: 4,
  maxLoadingDelay: 4,
  minAutoBitrate: 0,
  emeEnabled: false,
  widevineLicenseUrl: undefined,
  xhrSetup: undefined,
  fetchSetup: undefined,
};

export const MEDIA_SESSION_METADATA = {
  artwork: [
    { src: '/icons/media-96.png', sizes: '96x96', type: 'image/png' },
    { src: '/icons/media-128.png', sizes: '128x128', type: 'image/png' },
    { src: '/icons/media-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/media-256.png', sizes: '256x256', type: 'image/png' },
    { src: '/icons/media-384.png', sizes: '384x384', type: 'image/png' },
    { src: '/icons/media-512.png', sizes: '512x512', type: 'image/png' },
  ],
};
