'use client';

import { useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import type { VideoSource } from '../types';
import { HLS_CONFIG, ERROR_CODES } from '../constants';
import { browserSupport } from '../utils';

interface UseHLSEngineProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  sources: VideoSource[];
  autoplay?: boolean;
  onLoadedData?: () => void;
  onError?: (error: any) => void;
  onQualityLevelsLoaded?: (levels: any[]) => void;
  onQualityChanged?: (level: any) => void;
  onRequestStreamRefresh?: () => Promise<VideoSource[]>;
}

export function useHLSEngine({
  videoRef,
  sources,
  autoplay = false,
  onLoadedData,
  onError,
  onQualityLevelsLoaded,
  onQualityChanged,
  onRequestStreamRefresh,
}: UseHLSEngineProps) {
  const hlsRef = useRef<Hls | null>(null);
  const currentSourceIndex = useRef(0);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Initialize HLS
  const initializeHLS = useCallback((sourceUrl: string) => {
    const video = videoRef.current;
    if (!video) return;

    // Destroy existing instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check HLS support
    if (!Hls.isSupported()) {
      // Try native HLS support (Safari)
      if (browserSupport.hls()) {
        video.src = sourceUrl;
        if (autoplay) {
          video.play().catch(console.error);
        }
        onLoadedData?.();
        return;
      } else {
        onError?.({
          type: ERROR_CODES.MEDIA_ERR_SRC_NOT_SUPPORTED,
          message: 'HLS not supported',
        });
        return;
      }
    }

    // Create HLS instance
    const hls = new Hls({
      ...HLS_CONFIG,
      debug: process.env.NODE_ENV === 'development',
    });

    hlsRef.current = hls;

    // Attach media
    hls.attachMedia(video);

    // Load source
    hls.loadSource(sourceUrl);

    // Event handlers
    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      console.log('HLS manifest parsed:', data);
      
      // Get quality levels
      const levels = hls.levels.map((level, index) => ({
        index,
        height: level.height,
        width: level.width,
        bitrate: level.bitrate,
        label: getQualityLabel(level.height),
      }));
      
      onQualityLevelsLoaded?.(levels);
      onLoadedData?.();
      
      if (autoplay) {
        video.play().catch(console.error);
      }
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      const level = hls.levels[data.level];
      onQualityChanged?.(level);
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS Error:', data);
      
      if (data.fatal) {
        handleHLSError(data);
      }
    });

    hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
      console.log('Fragment loaded:', data);
    });

  }, [videoRef, autoplay, onLoadedData, onError, onQualityLevelsLoaded, onQualityChanged]);

  // Handle HLS errors with fallback
  const handleHLSError = useCallback(async (data: any) => {
    const { type, details, fatal } = data;
    
    if (!fatal) return;

    // Try to recover from certain errors
    if (type === Hls.ErrorTypes.NETWORK_ERROR) {
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        console.log(`Retrying HLS load (${retryCount.current}/${maxRetries})`);
        
        setTimeout(() => {
          if (hlsRef.current) {
            hlsRef.current.startLoad();
          }
        }, 1000 * retryCount.current);
        return;
      }
      
      // Try next source if available
      if (currentSourceIndex.current < sources.length - 1) {
        currentSourceIndex.current++;
        retryCount.current = 0;
        const nextSource = sources[currentSourceIndex.current];
        console.log('Switching to next source:', nextSource.url);
        initializeHLS(nextSource.url);
        return;
      }
      
      // Try to refresh stream URL
      if (onRequestStreamRefresh) {
        try {
          const newSources = await onRequestStreamRefresh();
          if (newSources.length > 0) {
            currentSourceIndex.current = 0;
            retryCount.current = 0;
            initializeHLS(newSources[0].url);
            return;
          }
        } catch (error) {
          console.error('Failed to refresh stream:', error);
        }
      }
    }
    
    if (type === Hls.ErrorTypes.MEDIA_ERROR) {
      // Try to recover from media error
      if (hlsRef.current) {
        hlsRef.current.recoverMediaError();
        return;
      }
    }
    
    // Report fatal error
    onError?.({
      type: type === Hls.ErrorTypes.NETWORK_ERROR ? ERROR_CODES.HLS_NETWORK_ERROR :
            type === Hls.ErrorTypes.MEDIA_ERROR ? ERROR_CODES.HLS_MEDIA_ERROR :
            ERROR_CODES.HLS_OTHER_ERROR,
      message: `HLS Error: ${details}`,
      details: data,
    });
  }, [sources, initializeHLS, onRequestStreamRefresh, onError]);

  // Load source
  const loadSource = useCallback((sourceIndex: number = 0) => {
    if (sourceIndex >= sources.length) return;
    
    currentSourceIndex.current = sourceIndex;
    retryCount.current = 0;
    const source = sources[sourceIndex];
    
    console.log('Loading HLS source:', source.url);
    initializeHLS(source.url);
  }, [sources, initializeHLS]);

  // Set quality level
  const setQuality = useCallback((quality: string) => {
    if (!hlsRef.current) return;
    
    if (quality === 'auto') {
      hlsRef.current.currentLevel = -1; // Auto
    } else {
      const levelIndex = hlsRef.current.levels.findIndex(level => 
        getQualityLabel(level.height).toLowerCase() === quality.toLowerCase()
      );
      if (levelIndex !== -1) {
        hlsRef.current.currentLevel = levelIndex;
      }
    }
  }, []);

  // Get current quality
  const getCurrentQuality = useCallback(() => {
    if (!hlsRef.current) return 'auto';
    
    const currentLevel = hlsRef.current.currentLevel;
    if (currentLevel === -1) return 'auto';
    
    const level = hlsRef.current.levels[currentLevel];
    return level ? getQualityLabel(level.height) : 'auto';
  }, []);

  // Get available qualities
  const getAvailableQualities = useCallback(() => {
    if (!hlsRef.current) return [{ label: 'Auto', value: 'auto' }];
    
    const qualities = [{ label: 'Tự động', value: 'auto' }];
    
    hlsRef.current.levels.forEach(level => {
      const label = getQualityLabel(level.height);
      if (!qualities.find(q => q.value === label.toLowerCase())) {
        qualities.push({
          label,
          value: label.toLowerCase(),
        });
      }
    });
    
    return qualities.sort((a, b) => {
      if (a.value === 'auto') return -1;
      if (b.value === 'auto') return 1;
      return parseInt(b.value) - parseInt(a.value);
    });
  }, []);

  // Get stats
  const getStats = useCallback(() => {
    if (!hlsRef.current) return null;
    
    const currentLevel = hlsRef.current.currentLevel;
    const level = currentLevel !== -1 ? hlsRef.current.levels[currentLevel] : null;
    
    return {
      currentLevel,
      currentBitrate: level?.bitrate || 0,
      currentResolution: level ? `${level.width}x${level.height}` : '',
      droppedFrames: 0, // HLS.js doesn't expose this directly
      totalBytesLoaded: 0, // HLS.js doesn't expose this directly
    };
  }, []);

  // Destroy HLS
  const destroy = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    currentSourceIndex.current = 0;
    retryCount.current = 0;
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (sources.length > 0) {
      loadSource(0);
    }
    
    return destroy;
  }, [sources, loadSource, destroy]);

  return {
    loadSource,
    setQuality,
    getCurrentQuality,
    getAvailableQualities,
    getStats,
    destroy,
    isSupported: Hls.isSupported() || browserSupport.hls(),
  };
}

// Helper function to get quality label from height
function getQualityLabel(height: number): string {
  if (height >= 2160) return '4K';
  if (height >= 1080) return '1080p';
  if (height >= 720) return '720p';
  if (height >= 480) return '480p';
  if (height >= 360) return '360p';
  return `${height}p`;
}
