'use client';

import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react';
import type { PlayerState, PlayerContextType, VideoPlayerProps, AnalyticsEvent } from '../types';
import { PLAYER_CONSTANTS, ANALYTICS_EVENTS } from '../constants';
import { generateSessionId, createAnalyticsEvent, storage } from '../utils';

// Initial state
const initialState: PlayerState = {
  isPlaying: false,
  isPaused: true,
  isBuffering: false,
  isMuted: false,
  isFullscreen: false,
  isPiP: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  playbackRate: 1,
  currentQuality: 'auto',
  currentSubtitle: null,
  currentAudio: null,
  bufferedRanges: null,
  error: null,
};

// Action types
type PlayerAction =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_BUFFERING'; payload: boolean }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_FULLSCREEN'; payload: boolean }
  | { type: 'SET_PIP'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_PLAYBACK_RATE'; payload: number }
  | { type: 'SET_QUALITY'; payload: string }
  | { type: 'SET_SUBTITLE'; payload: string | null }
  | { type: 'SET_AUDIO'; payload: string | null }
  | { type: 'SET_BUFFERED_RANGES'; payload: TimeRanges | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Reducer
function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload, isPaused: !action.payload };
    case 'SET_BUFFERING':
      return { ...state, isBuffering: action.payload };
    case 'SET_MUTED':
      return { ...state, isMuted: action.payload };
    case 'SET_FULLSCREEN':
      return { ...state, isFullscreen: action.payload };
    case 'SET_PIP':
      return { ...state, isPiP: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_PLAYBACK_RATE':
      return { ...state, playbackRate: action.payload };
    case 'SET_QUALITY':
      return { ...state, currentQuality: action.payload };
    case 'SET_SUBTITLE':
      return { ...state, currentSubtitle: action.payload };
    case 'SET_AUDIO':
      return { ...state, currentAudio: action.payload };
    case 'SET_BUFFERED_RANGES':
      return { ...state, bufferedRanges: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Context
const PlayerContext = createContext<PlayerContextType | null>(null);

// Provider props
interface PlayerProviderProps {
  children: React.ReactNode;
  config: VideoPlayerProps;
}

// Provider component
export function PlayerProvider({ children, config }: PlayerProviderProps) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(generateSessionId());
  const analyticsTimer = useRef<NodeJS.Timeout | null>(null);

  // Analytics helper
  const sendAnalytics = useCallback((type: string, additionalData: Partial<AnalyticsEvent> = {}) => {
    if (!config.enableAnalytics || !config.onAnalytics || !videoRef.current) return;
    
    const event = createAnalyticsEvent(type, sessionId.current, videoRef.current, additionalData);
    config.onAnalytics(event);
  }, [config.enableAnalytics, config.onAnalytics]);

  // Save resume position
  const saveResumePosition = useCallback(() => {
    if (config.persistKey && videoRef.current && state.currentTime > 30) {
      storage.set(`resume_${config.persistKey}`, {
        time: state.currentTime,
        duration: state.duration,
        timestamp: Date.now(),
      });
    }
  }, [config.persistKey, state.currentTime, state.duration]);

  // Actions
  const actions = {
    play: useCallback(() => {
      if (!videoRef.current) return;
      
      const playPromise = videoRef.current.play();
      if (playPromise) {
        playPromise
          .then(() => {
            dispatch({ type: 'SET_PLAYING', payload: true });
            sendAnalytics(ANALYTICS_EVENTS.PLAY);
          })
          .catch((error) => {
            console.error('Play failed:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message });
          });
      }
    }, [sendAnalytics]),

    pause: useCallback(() => {
      if (!videoRef.current) return;
      
      videoRef.current.pause();
      dispatch({ type: 'SET_PLAYING', payload: false });
      sendAnalytics(ANALYTICS_EVENTS.PAUSE);
      saveResumePosition();
    }, [sendAnalytics, saveResumePosition]),

    togglePlay: useCallback(() => {
      if (state.isPlaying) {
        actions.pause();
      } else {
        actions.play();
      }
    }, [state.isPlaying]),

    seek: useCallback((time: number) => {
      if (!videoRef.current) return;
      
      const clampedTime = Math.max(0, Math.min(time, state.duration));
      videoRef.current.currentTime = clampedTime;
      dispatch({ type: 'SET_CURRENT_TIME', payload: clampedTime });
      sendAnalytics(ANALYTICS_EVENTS.SEEK, { currentTime: clampedTime });
    }, [state.duration, sendAnalytics]),

    setVolume: useCallback((volume: number) => {
      if (!videoRef.current) return;
      
      const clampedVolume = Math.max(0, Math.min(1, volume));
      videoRef.current.volume = clampedVolume;
      dispatch({ type: 'SET_VOLUME', payload: clampedVolume });
      dispatch({ type: 'SET_MUTED', payload: clampedVolume === 0 });
      sendAnalytics(ANALYTICS_EVENTS.VOLUME_CHANGE, { volume: clampedVolume });
    }, [sendAnalytics]),

    toggleMute: useCallback(() => {
      if (!videoRef.current) return;
      
      const newMuted = !state.isMuted;
      videoRef.current.muted = newMuted;
      dispatch({ type: 'SET_MUTED', payload: newMuted });
      sendAnalytics(ANALYTICS_EVENTS.VOLUME_CHANGE, { muted: newMuted });
    }, [state.isMuted, sendAnalytics]),

    setPlaybackRate: useCallback((rate: number) => {
      if (!videoRef.current) return;
      
      videoRef.current.playbackRate = rate;
      dispatch({ type: 'SET_PLAYBACK_RATE', payload: rate });
      sendAnalytics(ANALYTICS_EVENTS.PLAYBACK_RATE_CHANGE, { playbackRate: rate });
    }, [sendAnalytics]),

    setQuality: useCallback((quality: string) => {
      dispatch({ type: 'SET_QUALITY', payload: quality });
      sendAnalytics(ANALYTICS_EVENTS.QUALITY_CHANGE, { quality });
      config.onQualityChange?.(quality);
    }, [sendAnalytics, config.onQualityChange]),

    setSubtitle: useCallback((subtitle: string | null) => {
      dispatch({ type: 'SET_SUBTITLE', payload: subtitle });
      sendAnalytics(ANALYTICS_EVENTS.SUBTITLE_CHANGE, { subtitle });
      config.onSubtitleChange?.(subtitle);
    }, [sendAnalytics, config.onSubtitleChange]),

    setAudio: useCallback((audio: string | null) => {
      dispatch({ type: 'SET_AUDIO', payload: audio });
      sendAnalytics(ANALYTICS_EVENTS.AUDIO_CHANGE, { audio });
      config.onAudioChange?.(audio);
    }, [sendAnalytics, config.onAudioChange]),

    enterFullscreen: useCallback(async () => {
      if (!containerRef.current || state.isFullscreen) return;
      
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          await (containerRef.current as any).mozRequestFullScreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
        }
        dispatch({ type: 'SET_FULLSCREEN', payload: true });
        sendAnalytics(ANALYTICS_EVENTS.FULLSCREEN_ENTER);
      } catch (error) {
        console.error('Fullscreen failed:', error);
      }
    }, [state.isFullscreen, sendAnalytics]),

    exitFullscreen: useCallback(async () => {
      if (!state.isFullscreen) return;
      
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        dispatch({ type: 'SET_FULLSCREEN', payload: false });
        sendAnalytics(ANALYTICS_EVENTS.FULLSCREEN_EXIT);
      } catch (error) {
        console.error('Exit fullscreen failed:', error);
      }
    }, [state.isFullscreen, sendAnalytics]),

    toggleFullscreen: useCallback(() => {
      if (state.isFullscreen) {
        actions.exitFullscreen();
      } else {
        actions.enterFullscreen();
      }
    }, [state.isFullscreen]),

    enterPiP: useCallback(async () => {
      if (!videoRef.current || state.isPiP || !('pictureInPictureEnabled' in document)) return;
      
      try {
        await videoRef.current.requestPictureInPicture();
        dispatch({ type: 'SET_PIP', payload: true });
        sendAnalytics(ANALYTICS_EVENTS.PIP_ENTER);
      } catch (error) {
        console.error('PiP failed:', error);
      }
    }, [state.isPiP, sendAnalytics]),

    exitPiP: useCallback(async () => {
      if (!state.isPiP) return;
      
      try {
        await document.exitPictureInPicture();
        dispatch({ type: 'SET_PIP', payload: false });
        sendAnalytics(ANALYTICS_EVENTS.PIP_EXIT);
      } catch (error) {
        console.error('Exit PiP failed:', error);
      }
    }, [state.isPiP, sendAnalytics]),

    togglePiP: useCallback(() => {
      if (state.isPiP) {
        actions.exitPiP();
      } else {
        actions.enterPiP();
      }
    }, [state.isPiP]),

    skipChapter: useCallback((type: 'intro' | 'recap' | 'ending') => {
      if (!config.markers?.[type] || !videoRef.current) return;
      
      const chapter = config.markers[type];
      videoRef.current.currentTime = chapter.end;
      sendAnalytics(ANALYTICS_EVENTS.CHAPTER_SKIP, { chapterType: type });
      config.onChapterSkip?.({ title: type, start: chapter.start, end: chapter.end, type });
    }, [config.markers, sendAnalytics, config.onChapterSkip]),

    goToNextEpisode: useCallback(() => {
      sendAnalytics(ANALYTICS_EVENTS.NEXT_EPISODE_ACCEPTED);
      config.onNextEpisode?.();
    }, [sendAnalytics, config.onNextEpisode]),

    restart: useCallback(() => {
      if (!videoRef.current) return;
      
      videoRef.current.currentTime = 0;
      dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });
      sendAnalytics(ANALYTICS_EVENTS.SEEK, { currentTime: 0 });
    }, [sendAnalytics]),

    destroy: useCallback(() => {
      if (analyticsTimer.current) {
        clearInterval(analyticsTimer.current);
      }
      saveResumePosition();
      dispatch({ type: 'RESET' });
    }, [saveResumePosition]),
  };

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      dispatch({ type: 'SET_DURATION', payload: video.duration });
      
      // Restore resume position
      if (config.persistKey) {
        const resumeData = storage.get(`resume_${config.persistKey}`);
        if (resumeData && resumeData.time && resumeData.time > 30) {
          video.currentTime = resumeData.time;
          dispatch({ type: 'SET_CURRENT_TIME', payload: resumeData.time });
        }
      }
      
      // Set start time from props
      if (config.resumePosition && config.resumePosition > 0) {
        video.currentTime = config.resumePosition;
        dispatch({ type: 'SET_CURRENT_TIME', payload: config.resumePosition });
      }
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime });
      config.onTimeUpdate?.(currentTime);
    };

    const handleProgress = () => {
      dispatch({ type: 'SET_BUFFERED_RANGES', payload: video.buffered });
      config.onProgress?.(video.buffered);
    };

    const handleWaiting = () => {
      dispatch({ type: 'SET_BUFFERING', payload: true });
      sendAnalytics(ANALYTICS_EVENTS.BUFFER_START);
    };

    const handleCanPlay = () => {
      dispatch({ type: 'SET_BUFFERING', payload: false });
      sendAnalytics(ANALYTICS_EVENTS.BUFFER_END);
    };

    const handleEnded = () => {
      dispatch({ type: 'SET_PLAYING', payload: false });
      sendAnalytics(ANALYTICS_EVENTS.ENDED);
      saveResumePosition();
      config.onEnded?.();
    };

    const handleError = () => {
      const error = video.error;
      const errorMessage = error ? `Error ${error.code}: ${error.message}` : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      sendAnalytics(ANALYTICS_EVENTS.ERROR, { error: { code: error?.code || 0, message: errorMessage } });
      config.onError?.(error);
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [config, sendAnalytics, saveResumePosition]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      dispatch({ type: 'SET_FULLSCREEN', payload: isFullscreen });
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // PiP change listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePiPEnter = () => dispatch({ type: 'SET_PIP', payload: true });
    const handlePiPLeave = () => dispatch({ type: 'SET_PIP', payload: false });

    video.addEventListener('enterpictureinpicture', handlePiPEnter);
    video.addEventListener('leavepictureinpicture', handlePiPLeave);

    return () => {
      video.removeEventListener('enterpictureinpicture', handlePiPEnter);
      video.removeEventListener('leavepictureinpicture', handlePiPLeave);
    };
  }, []);

  // Analytics heartbeat
  useEffect(() => {
    if (!config.enableAnalytics) return;

    analyticsTimer.current = setInterval(() => {
      if (state.isPlaying) {
        sendAnalytics(ANALYTICS_EVENTS.HEARTBEAT);
      }
    }, PLAYER_CONSTANTS.HEARTBEAT_INTERVAL);

    return () => {
      if (analyticsTimer.current) {
        clearInterval(analyticsTimer.current);
      }
    };
  }, [config.enableAnalytics, state.isPlaying, sendAnalytics]);

  // Context value
  const contextValue: PlayerContextType = {
    state,
    actions,
    refs: {
      videoRef,
      containerRef,
    },
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}

// Hook to use player context
export function usePlayer(): PlayerContextType {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
