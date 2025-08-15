'use client';

import { useEffect, useCallback, useRef } from 'react';
import { PLAYER_CONSTANTS, MOBILE_GESTURES } from '../constants';
import { usePlayer } from '../context/PlayerContext';
import { isTouchDevice } from '../utils';

interface UseMobileGesturesProps {
  enabled?: boolean;
  containerRef: React.RefObject<HTMLElement>;
  onVolumeGesture?: (volume: number) => void;
  onBrightnessGesture?: (brightness: number) => void;
}

interface TouchData {
  startX: number;
  startY: number;
  startTime: number;
  lastTap: number;
}

export function useMobileGestures({
  enabled = true,
  containerRef,
  onVolumeGesture,
  onBrightnessGesture,
}: UseMobileGesturesProps) {
  const { state, actions } = usePlayer();
  const touchDataRef = useRef<TouchData>({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastTap: 0,
  });
  const isGesturingRef = useRef(false);
  const rippleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if gestures should be enabled
  const shouldEnableGestures = enabled && isTouchDevice();

  // Show seek ripple effect
  const showSeekRipple = useCallback((x: number, y: number, direction: 'forward' | 'backward') => {
    const container = containerRef.current;
    if (!container) return;

    // Create ripple element
    const ripple = document.createElement('div');
    ripple.className = `
      absolute pointer-events-none z-50 rounded-full
      ${direction === 'forward' ? 'bg-white/30' : 'bg-white/30'}
      animate-ping
    `;
    ripple.style.left = `${x - 30}px`;
    ripple.style.top = `${y - 30}px`;
    ripple.style.width = '60px';
    ripple.style.height = '60px';

    // Add directional icon
    const icon = document.createElement('div');
    icon.className = 'absolute inset-0 flex items-center justify-center text-white text-xl';
    icon.innerHTML = direction === 'forward' ? '⏭' : '⏮';
    ripple.appendChild(icon);

    container.appendChild(ripple);

    // Remove after animation
    if (rippleTimeoutRef.current) {
      clearTimeout(rippleTimeoutRef.current);
    }
    rippleTimeoutRef.current = setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }, [containerRef]);

  // Handle touch start
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!shouldEnableGestures) return;

    const touch = event.touches[0];
    const now = Date.now();
    
    touchDataRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: now,
      lastTap: touchDataRef.current.lastTap,
    };
    
    isGesturingRef.current = false;
  }, [shouldEnableGestures]);

  // Handle touch move
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!shouldEnableGestures || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const touchData = touchDataRef.current;
    const deltaX = touch.clientX - touchData.startX;
    const deltaY = touch.clientY - touchData.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if this is a meaningful gesture
    if (absDeltaX < PLAYER_CONSTANTS.SWIPE_THRESHOLD && absDeltaY < PLAYER_CONSTANTS.SWIPE_THRESHOLD) {
      return;
    }

    isGesturingRef.current = true;
    event.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Horizontal swipe - volume control (left side) or brightness control (right side)
    if (absDeltaX > absDeltaY) {
      const isLeftSide = touchData.startX < containerWidth / 2;
      
      if (isLeftSide && MOBILE_GESTURES.SWIPE_VOLUME) {
        // Volume control on left side
        const volumeDelta = -deltaY / containerHeight; // Invert Y for intuitive control
        const newVolume = Math.max(0, Math.min(1, state.volume + volumeDelta * 0.5));
        actions.setVolume(newVolume);
        onVolumeGesture?.(newVolume);
      } else if (!isLeftSide && MOBILE_GESTURES.SWIPE_BRIGHTNESS) {
        // Brightness control on right side (UI only)
        const brightnessDelta = -deltaY / containerHeight;
        const brightness = Math.max(0, Math.min(1, 0.5 + brightnessDelta * 0.5));
        onBrightnessGesture?.(brightness);
      }
    }
  }, [shouldEnableGestures, containerRef, state.volume, actions, onVolumeGesture, onBrightnessGesture]);

  // Handle touch end
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!shouldEnableGestures) return;

    const now = Date.now();
    const touchData = touchDataRef.current;
    const timeDiff = now - touchData.startTime;
    const lastTapDiff = now - touchData.lastTap;

    // If this was a gesture, don't process tap
    if (isGesturingRef.current) {
      isGesturingRef.current = false;
      return;
    }

    // Check for double tap
    if (MOBILE_GESTURES.DOUBLE_TAP_SEEK && 
        timeDiff < PLAYER_CONSTANTS.DOUBLE_TAP_THRESHOLD && 
        lastTapDiff < PLAYER_CONSTANTS.DOUBLE_TAP_THRESHOLD) {
      
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const tapX = touchData.startX - containerRect.left;
      const tapY = touchData.startY - containerRect.top;
      
      // Determine seek direction based on tap position
      const isRightSide = tapX > containerWidth / 2;
      const seekAmount = isRightSide ? PLAYER_CONSTANTS.SEEK_MEDIUM : -PLAYER_CONSTANTS.SEEK_MEDIUM;
      const newTime = Math.max(0, Math.min(state.duration, state.currentTime + seekAmount));
      
      actions.seek(newTime);
      showSeekRipple(tapX, tapY, isRightSide ? 'forward' : 'backward');
      
      // Reset last tap to prevent triple tap
      touchDataRef.current.lastTap = 0;
    } else {
      // Single tap - toggle play/pause (with delay to wait for potential second tap)
      setTimeout(() => {
        if (touchDataRef.current.lastTap === now) {
          actions.togglePlay();
        }
      }, PLAYER_CONSTANTS.DOUBLE_TAP_THRESHOLD);
      
      touchDataRef.current.lastTap = now;
    }
  }, [shouldEnableGestures, containerRef, state.currentTime, state.duration, actions, showSeekRipple]);

  // Prevent default touch behaviors that might interfere
  const handleTouchStartPrevent = useCallback((event: TouchEvent) => {
    if (!shouldEnableGestures) return;
    // Prevent default to avoid scrolling and other touch behaviors
    if (event.touches.length === 1) {
      event.preventDefault();
    }
  }, [shouldEnableGestures]);

  // Add event listeners
  useEffect(() => {
    if (!shouldEnableGestures) return;

    const container = containerRef.current;
    if (!container) return;

    // Use passive: false to allow preventDefault
    const options = { passive: false };

    container.addEventListener('touchstart', handleTouchStartPrevent, options);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, options);
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStartPrevent);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [shouldEnableGestures, containerRef, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchStartPrevent]);

  // Cleanup ripple timeout
  useEffect(() => {
    return () => {
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
    };
  }, []);

  return {
    isGesturingSupported: shouldEnableGestures,
  };
}
