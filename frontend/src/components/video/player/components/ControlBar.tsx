'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  PictureInPicture,
  Captions,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { formatTime } from '../utils';
import { PLAYER_CONSTANTS } from '../constants';

interface ControlBarProps {
  // State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isPiP: boolean;
  bufferedRanges: TimeRanges | null;
  
  // Actions
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
  onPiPToggle: () => void;
  onSettingsClick: () => void;
  onSubtitlesClick: () => void;
  
  // Options
  showPiP?: boolean;
  showSubtitles?: boolean;
  className?: string;
}

export function ControlBar({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  isPiP,
  bufferedRanges,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreenToggle,
  onPiPToggle,
  onSettingsClick,
  onSubtitlesClick,
  showPiP = true,
  showSubtitles = true,
  className,
}: ControlBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Calculate buffered ranges
  const bufferedPercentages = React.useMemo(() => {
    if (!bufferedRanges || !duration) return [];
    
    const ranges = [];
    for (let i = 0; i < bufferedRanges.length; i++) {
      const start = (bufferedRanges.start(i) / duration) * 100;
      const end = (bufferedRanges.end(i) / duration) * 100;
      ranges.push({ start, end });
    }
    return ranges;
  }, [bufferedRanges, duration]);

  // Handle progress bar interaction
  const handleProgressInteraction = useCallback((clientX: number) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = percentage * duration;
    onSeek(newTime);
  }, [duration, onSeek]);

  const handleProgressClick = useCallback((event: React.MouseEvent) => {
    handleProgressInteraction(event.clientX);
  }, [handleProgressInteraction]);

  const handleProgressMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    handleProgressInteraction(event.clientX);
    
    const handleMouseMove = (e: MouseEvent) => {
      handleProgressInteraction(e.clientX);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleProgressInteraction]);

  // Handle volume slider
  const handleVolumeSliderChange = useCallback((values: number[]) => {
    onVolumeChange(values[0] / 100);
  }, [onVolumeChange]);

  const handleVolumeMouseEnter = useCallback(() => {
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    setShowVolumeSlider(true);
  }, []);

  const handleVolumeMouseLeave = useCallback(() => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 500);
  }, []);

  // Seek buttons
  const handleSeekBackward = useCallback(() => {
    const newTime = Math.max(0, currentTime - PLAYER_CONSTANTS.SEEK_MEDIUM);
    onSeek(newTime);
  }, [currentTime, onSeek]);

  const handleSeekForward = useCallback(() => {
    const newTime = Math.min(duration, currentTime + PLAYER_CONSTANTS.SEEK_MEDIUM);
    onSeek(newTime);
  }, [currentTime, duration, onSeek]);

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {/* Progress Bar */}
      <div className="relative group">
        <div
          ref={progressRef}
          className="h-1 bg-white/20 rounded-full cursor-pointer group-hover:h-1.5 transition-all duration-200"
          onClick={handleProgressClick}
          onMouseDown={handleProgressMouseDown}
        >
          {/* Buffered ranges */}
          {bufferedPercentages.map((range, index) => (
            <div
              key={index}
              className="absolute top-0 h-full bg-white/40 rounded-full"
              style={{
                left: `${range.start}%`,
                width: `${range.end - range.start}%`,
              }}
            />
          ))}
          
          {/* Progress */}
          <div
            className="absolute top-0 h-full bg-blue-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* Thumb */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full transition-opacity duration-200',
              isDragging || progressPercentage > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
            style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%) translateY(-50%)' }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left controls */}
        <div className="flex items-center space-x-2">
          {/* Play/Pause */}
          <Button
            variant="ghost"
            size="sm"
            onClick={isPlaying ? onPause : onPlay}
            className="text-white hover:bg-white/20 p-2"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>

          {/* Seek buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSeekBackward}
            className="text-white hover:bg-white/20 p-2"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSeekForward}
            className="text-white hover:bg-white/20 p-2"
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          {/* Volume */}
          <div className="relative flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMuteToggle}
              onMouseEnter={handleVolumeMouseEnter}
              onMouseLeave={handleVolumeMouseLeave}
              className="text-white hover:bg-white/20 p-2"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>

            {/* Volume slider */}
            {showVolumeSlider && (
              <div
                className="absolute bottom-full left-0 mb-2 p-2 bg-black/80 rounded-lg backdrop-blur-sm"
                onMouseEnter={handleVolumeMouseEnter}
                onMouseLeave={handleVolumeMouseLeave}
              >
                <div className="w-20 h-1">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeSliderChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Time */}
          <div className="text-white text-sm font-mono min-w-max">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center space-x-2">
          {/* Subtitles */}
          {showSubtitles && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSubtitlesClick}
              className="text-white hover:bg-white/20 p-2"
            >
              <Captions className="w-4 h-4" />
            </Button>
          )}

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="text-white hover:bg-white/20 p-2"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Picture in Picture */}
          {showPiP && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPiPToggle}
              className="text-white hover:bg-white/20 p-2"
            >
              <PictureInPicture className="w-4 h-4" />
            </Button>
          )}

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onFullscreenToggle}
            className="text-white hover:bg-white/20 p-2"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
