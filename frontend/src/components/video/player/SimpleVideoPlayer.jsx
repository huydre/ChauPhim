'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize
} from 'lucide-react';

// Dynamic import for HLS.js
let Hls = null;
if (typeof window !== 'undefined') {
  import('hls.js').then((hlsModule) => {
    Hls = hlsModule.default;
  }).catch(() => {
    console.warn('HLS.js not available');
  });
}

export function VideoPlayer({
  src,
  title,
  poster,
  autoPlay = false,
  muted = false,
  className,
  onPlay,
  onPause,
  onTimeUpdate,
  onError,
  ...props
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHLSLoaded, setIsHLSLoaded] = useState(false);

  // Progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Format time helper
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Handle volume
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Handle mute
  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  // Handle fullscreen
  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Handle progress seek
  const handleProgressClick = (e) => {
    if (!videoRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    videoRef.current.currentTime = newTime;
  };

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('Video player initialized with src:', src);

    const handlePlay = () => {
      console.log('Video started playing');
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      console.log('Video paused');
      setIsPlaying(false);
      onPause?.();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded, duration:', video.duration);
      setDuration(video.duration);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleError = (e) => {
      console.error('Video error details:', {
        error: e,
        target: e.target,
        networkState: video?.networkState,
        readyState: video?.readyState,
        src: video?.src
      });
      onError?.(e);
    };

    const handleCanPlay = () => {
      console.log('Video can play');
    };

    const handleLoadStart = () => {
      console.log('Video load started');
    };

    // Add event listeners
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onPlay, onPause, onTimeUpdate, onError]);

  // HLS setup effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    console.log('Setting up video with src:', src);

    const setupVideo = async () => {
      // Check if src is HLS
      if (src.includes('.m3u8')) {
        console.log('HLS stream detected');
        
        // Wait for HLS.js to load if not available
        if (!Hls) {
          try {
            const hlsModule = await import('hls.js');
            Hls = hlsModule.default;
          } catch (error) {
            console.error('Failed to load HLS.js:', error);
            return;
          }
        }

        if (Hls && Hls.isSupported()) {
          console.log('HLS is supported, setting up HLS.js');
          
          // Destroy existing HLS instance
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }

          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
          });

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest parsed');
            setIsHLSLoaded(true);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', event, data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Network error, trying to recover');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Media error, trying to recover');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('Fatal error, destroying HLS');
                  hls.destroy();
                  break;
              }
            }
          });

          hlsRef.current = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          console.log('Native HLS support detected');
          video.src = src;
          setIsHLSLoaded(true);
        } else {
          console.error('HLS not supported');
        }
      } else {
        console.log('Regular video source');
        video.src = src;
        setIsHLSLoaded(true);
      }
    };

    setupVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  return (
    <div 
      className={cn('relative bg-black group', className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(!isPlaying)}
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
        controls={false}
      />

      {/* Controls Overlay */}
      <div className={cn(
        'absolute inset-0 flex flex-col justify-end',
        'bg-gradient-to-t from-black/60 via-transparent to-transparent',
        'transition-opacity duration-300',
        showControls ? 'opacity-100' : 'opacity-0'
      )}>
        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <div 
            className="w-full h-1 bg-white/20 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4">
          {/* Left controls */}
          <div className="flex items-center space-x-4">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMuteToggle}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-full appearance-none slider"
              />
            </div>

            {/* Time */}
            <div className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center space-x-4">
            {/* Title */}
            {title && (
              <div className="text-white text-sm font-medium max-w-xs truncate">
                {title}
              </div>
            )}

            {/* Fullscreen */}
            <button
              onClick={handleFullscreenToggle}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {!isHLSLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div>Đang tải video...</div>
          </div>
        </div>
      )}

      {/* Click to play overlay */}
      {!isPlaying && isHLSLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <Play className="w-8 h-8 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
