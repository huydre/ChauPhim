'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { PlayerProvider } from './context/PlayerContext';
import { useHLSEngine } from './hooks/useHLSEngine';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useMobileGestures } from './hooks/useMobileGestures';
import { ControlBar } from './components/ControlBar';
import { PLAYER_CONSTANTS } from './constants';

export function VideoPlayer({
  src,
  title,
  poster,
  subtitles = [],
  autoPlay = false,
  muted = false,
  width = '100%',
  height = '100%',
  className,
  onReady,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
  onProgress,
  onLoadedMetadata,
  onVolumeChange,
  onFullscreenChange,
  children,
  ...props
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [bufferedRanges, setBufferedRanges] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState('auto');

  // Initialize HLS engine
  const { hlsInstance, isHLSSupported, destroy: destroyHLS } = useHLSEngine({
    videoElement: videoRef.current,
    src,
    onError,
    onQualityLevelsUpdated: setQualities,
  });

  // Controls visibility
  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, PLAYER_CONSTANTS.CONTROLS_HIDE_DELAY);
    setControlsTimeout(timeout);
  };

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  // Video event handlers
  function handlePlay() {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }

  function handlePause() {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }

  function handleSeek(time) {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }

  function handleVolumeChange(newVolume) {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  }

  function handleMuteToggle() {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }

  function handleFullscreenToggle() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  function handlePiPToggle() {
    if (videoRef.current) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else {
        videoRef.current.requestPictureInPicture();
      }
    }
  }

  function handlePlaybackRateChange(rate) {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    videoElement: videoRef.current,
    containerElement: containerRef.current,
    onPlay: handlePlay,
    onPause: handlePause,
    onSeek: handleSeek,
    onVolumeChange: handleVolumeChange,
    onMuteToggle: handleMuteToggle,
    onFullscreenToggle: handleFullscreenToggle,
    onPlaybackRateChange: handlePlaybackRateChange,
  });

  // Mobile gestures
  const gestureHandlers = useMobileGestures({
    containerElement: containerRef.current,
    onPlay: handlePlay,
    onPause: handlePause,
    onSeek: handleSeek,
    onVolumeChange: handleVolumeChange,
    onBrightnessChange: (brightness) => {
      console.log('Brightness:', brightness);
    },
  });

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoPlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handleVideoPause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleVideoTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleVideoLoadedMetadata = () => {
      setDuration(video.duration);
      onLoadedMetadata?.(video);
    };

    const handleVideoProgress = () => {
      setBufferedRanges(video.buffered);
      onProgress?.(video.buffered);
    };

    const handleVideoVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
      onVolumeChange?.(video.volume, video.muted);
    };

    const handleVideoEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleVideoError = (event) => {
      onError?.(event);
    };

    // Add event listeners
    video.addEventListener('play', handleVideoPlay);
    video.addEventListener('pause', handleVideoPause);
    video.addEventListener('timeupdate', handleVideoTimeUpdate);
    video.addEventListener('loadedmetadata', handleVideoLoadedMetadata);
    video.addEventListener('progress', handleVideoProgress);
    video.addEventListener('volumechange', handleVideoVolumeChange);
    video.addEventListener('ended', handleVideoEnded);
    video.addEventListener('error', handleVideoError);

    return () => {
      video.removeEventListener('play', handleVideoPlay);
      video.removeEventListener('pause', handleVideoPause);
      video.removeEventListener('timeupdate', handleVideoTimeUpdate);
      video.removeEventListener('loadedmetadata', handleVideoLoadedMetadata);
      video.removeEventListener('progress', handleVideoProgress);
      video.removeEventListener('volumechange', handleVideoVolumeChange);
      video.removeEventListener('ended', handleVideoEnded);
      video.removeEventListener('error', handleVideoError);
    };
  }, [onPlay, onPause, onTimeUpdate, onLoadedMetadata, onProgress, onVolumeChange, onEnded, onError]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullscreen(isFS);
      onFullscreenChange?.(isFS);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onFullscreenChange]);

  // Picture-in-Picture listener
  useEffect(() => {
    const handlePiPChange = () => {
      setIsPiP(!!document.pictureInPictureElement);
    };

    document.addEventListener('enterpictureinpicture', handlePiPChange);
    document.addEventListener('leavepictureinpicture', handlePiPChange);
    
    return () => {
      document.removeEventListener('enterpictureinpicture', handlePiPChange);
      document.removeEventListener('leavepictureinpicture', handlePiPChange);
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      destroyHLS();
    };
  }, [controlsTimeout, destroyHLS]);

  // Auto-hide controls when playing
  useEffect(() => {
    if (isPlaying) {
      showControlsTemporarily();
    } else {
      setShowControls(true);
    }
  }, [isPlaying]);

  const containerStyle = {
    width,
    height,
  };

  return (
    <PlayerProvider
      value={{
        // State
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isFullscreen,
        isPiP,
        bufferedRanges,
        playbackRate,
        qualities,
        currentQuality,
        
        // Actions
        play: handlePlay,
        pause: handlePause,
        seek: handleSeek,
        setVolume: handleVolumeChange,
        toggleMute: handleMuteToggle,
        toggleFullscreen: handleFullscreenToggle,
        togglePiP: handlePiPToggle,
        setPlaybackRate: handlePlaybackRateChange,
        
        // References
        videoRef,
        containerRef,
        hlsInstance,
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          'relative bg-black overflow-hidden group',
          'focus:outline-none',
          isFullscreen && 'fixed inset-0 z-50',
          className
        )}
        style={containerStyle}
        tabIndex={0}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...gestureHandlers}
        {...props}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={poster}
          autoPlay={autoPlay}
          muted={muted}
          playsInline
          preload="metadata"
        >
          {/* Subtitles */}
          {subtitles.map((subtitle, index) => (
            <track
              key={index}
              kind="subtitles"
              src={subtitle.src}
              srcLang={subtitle.lang}
              label={subtitle.label}
              default={subtitle.default}
            />
          ))}
        </video>

        {/* Custom Content Overlay */}
        {children}

        {/* Controls Overlay */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col justify-end',
            'bg-gradient-to-t from-black/60 via-transparent to-transparent',
            'transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="p-4">
            <ControlBar
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              isFullscreen={isFullscreen}
              isPiP={isPiP}
              bufferedRanges={bufferedRanges}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
              onFullscreenToggle={handleFullscreenToggle}
              onPiPToggle={handlePiPToggle}
              onSettingsClick={() => console.log('Settings clicked')}
              onSubtitlesClick={() => console.log('Subtitles clicked')}
            />
          </div>
        </div>

        {/* Loading Overlay */}
        {!duration && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </PlayerProvider>
  );
}
