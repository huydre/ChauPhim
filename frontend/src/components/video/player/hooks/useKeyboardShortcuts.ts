'use client';

import { useEffect, useCallback } from 'react';
import { KEYBOARD_SHORTCUTS, PLAYER_CONSTANTS } from '../constants';
import { usePlayer } from '../context/PlayerContext';

interface UseKeyboardShortcutsProps {
  enabled?: boolean;
  containerRef: React.RefObject<HTMLElement>;
}

export function useKeyboardShortcuts({ enabled = true, containerRef }: UseKeyboardShortcutsProps) {
  const { state, actions } = usePlayer();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Only handle shortcuts when player container is focused or hovered
    const container = containerRef.current;
    if (!container || !container.contains(target)) {
      return;
    }

    const key = event.key;
    let handled = false;

    // Play/Pause
    if (KEYBOARD_SHORTCUTS.PLAY_PAUSE.includes(key)) {
      event.preventDefault();
      actions.togglePlay();
      handled = true;
    }
    
    // Seek backward (small)
    else if (KEYBOARD_SHORTCUTS.SEEK_BACKWARD_SMALL.includes(key)) {
      event.preventDefault();
      const newTime = Math.max(0, state.currentTime - PLAYER_CONSTANTS.SEEK_SMALL);
      actions.seek(newTime);
      handled = true;
    }
    
    // Seek forward (small)
    else if (KEYBOARD_SHORTCUTS.SEEK_FORWARD_SMALL.includes(key)) {
      event.preventDefault();
      const newTime = Math.min(state.duration, state.currentTime + PLAYER_CONSTANTS.SEEK_SMALL);
      actions.seek(newTime);
      handled = true;
    }
    
    // Seek backward (medium)
    else if (KEYBOARD_SHORTCUTS.SEEK_BACKWARD_MEDIUM.includes(key)) {
      event.preventDefault();
      const newTime = Math.max(0, state.currentTime - PLAYER_CONSTANTS.SEEK_MEDIUM);
      actions.seek(newTime);
      handled = true;
    }
    
    // Seek forward (medium)
    else if (KEYBOARD_SHORTCUTS.SEEK_FORWARD_MEDIUM.includes(key)) {
      event.preventDefault();
      const newTime = Math.min(state.duration, state.currentTime + PLAYER_CONSTANTS.SEEK_MEDIUM);
      actions.seek(newTime);
      handled = true;
    }
    
    // Volume up
    else if (KEYBOARD_SHORTCUTS.VOLUME_UP.includes(key)) {
      event.preventDefault();
      const newVolume = Math.min(1, state.volume + PLAYER_CONSTANTS.VOLUME_STEP);
      actions.setVolume(newVolume);
      handled = true;
    }
    
    // Volume down
    else if (KEYBOARD_SHORTCUTS.VOLUME_DOWN.includes(key)) {
      event.preventDefault();
      const newVolume = Math.max(0, state.volume - PLAYER_CONSTANTS.VOLUME_STEP);
      actions.setVolume(newVolume);
      handled = true;
    }
    
    // Mute
    else if (KEYBOARD_SHORTCUTS.MUTE.includes(key)) {
      event.preventDefault();
      actions.toggleMute();
      handled = true;
    }
    
    // Fullscreen
    else if (KEYBOARD_SHORTCUTS.FULLSCREEN.includes(key)) {
      event.preventDefault();
      actions.toggleFullscreen();
      handled = true;
    }
    
    // Captions
    else if (KEYBOARD_SHORTCUTS.CAPTIONS.includes(key)) {
      event.preventDefault();
      // Toggle between first subtitle and off
      const newSubtitle = state.currentSubtitle ? null : 'first';
      actions.setSubtitle(newSubtitle);
      handled = true;
    }
    
    // Picture in Picture
    else if (KEYBOARD_SHORTCUTS.PICTURE_IN_PICTURE.includes(key)) {
      event.preventDefault();
      actions.togglePiP();
      handled = true;
    }
    
    // Frame by frame (only when paused)
    else if (state.isPaused && KEYBOARD_SHORTCUTS.FRAME_BACKWARD.includes(key)) {
      event.preventDefault();
      const newTime = Math.max(0, state.currentTime - 1/30); // 1 frame at 30fps
      actions.seek(newTime);
      handled = true;
    }
    
    else if (state.isPaused && KEYBOARD_SHORTCUTS.FRAME_FORWARD.includes(key)) {
      event.preventDefault();
      const newTime = Math.min(state.duration, state.currentTime + 1/30); // 1 frame at 30fps
      actions.seek(newTime);
      handled = true;
    }
    
    // Skip intro
    else if (KEYBOARD_SHORTCUTS.SKIP_INTRO.includes(key)) {
      event.preventDefault();
      actions.skipChapter('intro');
      handled = true;
    }
    
    // Speed controls
    else if (KEYBOARD_SHORTCUTS.SPEED_UP.includes(key)) {
      event.preventDefault();
      const currentIndex = PLAYER_CONSTANTS.PLAYBACK_RATES.indexOf(state.playbackRate);
      const nextIndex = Math.min(PLAYER_CONSTANTS.PLAYBACK_RATES.length - 1, currentIndex + 1);
      actions.setPlaybackRate(PLAYER_CONSTANTS.PLAYBACK_RATES[nextIndex]);
      handled = true;
    }
    
    else if (KEYBOARD_SHORTCUTS.SPEED_DOWN.includes(key)) {
      event.preventDefault();
      const currentIndex = PLAYER_CONSTANTS.PLAYBACK_RATES.indexOf(state.playbackRate);
      const nextIndex = Math.max(0, currentIndex - 1);
      actions.setPlaybackRate(PLAYER_CONSTANTS.PLAYBACK_RATES[nextIndex]);
      handled = true;
    }
    
    // Number keys for quick seek (1-9 = 10%-90%)
    else if (/^[1-9]$/.test(key)) {
      event.preventDefault();
      const percentage = parseInt(key) / 10;
      const newTime = state.duration * percentage;
      actions.seek(newTime);
      handled = true;
    }
    
    // 0 key to restart
    else if (key === '0') {
      event.preventDefault();
      actions.restart();
      handled = true;
    }

    // Show toast for feedback on certain actions
    if (handled) {
      showKeyboardFeedback(key, state);
    }
  }, [enabled, containerRef, state, actions]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}

// Helper function to show keyboard feedback
function showKeyboardFeedback(key: string, state: any) {
  // This would integrate with your toast system
  // For now, just log the action
  if (process.env.NODE_ENV === 'development') {
    console.log(`Keyboard shortcut: ${key}`);
  }
}
