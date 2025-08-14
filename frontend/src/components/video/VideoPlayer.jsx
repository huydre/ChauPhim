'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Captions } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const VideoPlayer = ({ 
  src, 
  poster, 
  subtitles = [], 
  qualities = [],
  onTimeUpdate,
  onEnded,
  autoplay = false,
  className 
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedSubtitle, setSelectedSubtitle] = useState(-1);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoplay) {
          video.play();
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS Error:', data);
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = src;
      if (autoplay) {
        video.play();
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, autoplay]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      onTimeUpdate && onTimeUpdate(time);
    };
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded && onEnded();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate, onEnded]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!videoRef.current) return;
      
      switch (e.key.toLowerCase()) {
        case 'k':
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          e.preventDefault();
          seek(-5);
          break;
        case 'arrowright':
          e.preventDefault();
          seek(5);
          break;
        case 'arrowup':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, []);

  const seek = useCallback((seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  }, [currentTime, duration]);

  const changeVolume = useCallback((delta) => {
    if (!videoRef.current) return;
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  }, [volume]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const handleProgressClick = useCallback((e) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    videoRef.current.currentTime = newTime;
  }, [duration]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black overflow-hidden group",
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        onClick={togglePlayPause}
      />

      {/* Loading spinner */}
      {!duration && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-16 h-16 bg-black/50 hover:bg-black/70 text-white border-0",
              showControls ? "opacity-100" : "opacity-0"
            )}
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress bar */}
          <div
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-4"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-brand-primary rounded-full"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 border-0"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 border-0"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Subtitle menu */}
              {subtitles.length > 0 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 border-0"
                    onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                  >
                    <Captions className="w-5 h-5" />
                  </Button>
                  
                  {showSubtitleMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-brand-panel border border-brand-border rounded-lg p-2 min-w-[150px]">
                      <div
                        className={cn(
                          "px-3 py-2 text-sm cursor-pointer rounded hover:bg-brand-elevated",
                          selectedSubtitle === -1 ? "bg-brand-elevated text-brand-accent" : "text-brand-text-primary"
                        )}
                        onClick={() => {
                          setSelectedSubtitle(-1);
                          setShowSubtitleMenu(false);
                        }}
                      >
                        Tắt
                      </div>
                      {subtitles.map((subtitle, index) => (
                        <div
                          key={index}
                          className={cn(
                            "px-3 py-2 text-sm cursor-pointer rounded hover:bg-brand-elevated",
                            selectedSubtitle === index ? "bg-brand-elevated text-brand-accent" : "text-brand-text-primary"
                          )}
                          onClick={() => {
                            setSelectedSubtitle(index);
                            setShowSubtitleMenu(false);
                          }}
                        >
                          {subtitle.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quality menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 border-0"
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                >
                  <Settings className="w-5 h-5" />
                </Button>
                
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-brand-panel border border-brand-border rounded-lg p-2 min-w-[120px]">
                    <div
                      className={cn(
                        "px-3 py-2 text-sm cursor-pointer rounded hover:bg-brand-elevated",
                        selectedQuality === 'auto' ? "bg-brand-elevated text-brand-accent" : "text-brand-text-primary"
                      )}
                      onClick={() => {
                        setSelectedQuality('auto');
                        setShowQualityMenu(false);
                      }}
                    >
                      Tự động
                    </div>
                    {qualities.map((quality) => (
                      <div
                        key={quality.value}
                        className={cn(
                          "px-3 py-2 text-sm cursor-pointer rounded hover:bg-brand-elevated",
                          selectedQuality === quality.value ? "bg-brand-elevated text-brand-accent" : "text-brand-text-primary"
                        )}
                        onClick={() => {
                          setSelectedQuality(quality.value);
                          setShowQualityMenu(false);
                        }}
                      >
                        {quality.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 border-0"
                onClick={toggleFullscreen}
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
