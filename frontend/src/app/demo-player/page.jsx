'use client';

import { VideoPlayer } from '@/components/video/player';

export default function VideoPlayerDemo() {
  const handlePlay = () => {
    console.log('Video started playing');
  };

  const handlePause = () => {
    console.log('Video paused');
  };

  const handleTimeUpdate = (currentTime) => {
    console.log('Time update:', currentTime);
  };

  const handleError = (error) => {
    console.error('Video error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-6">Video Player Demo</h1>
        
        {/* Test với HLS stream */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <VideoPlayer
            src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
            title="Demo Video"
            poster="https://via.placeholder.com/1280x720/000000/FFFFFF?text=Video+Poster"
            autoPlay={false}
            muted={false}
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onError={handleError}
            subtitles={[
              {
                src: '/subtitles/demo-en.vtt',
                lang: 'en',
                label: 'English',
                default: true
              }
            ]}
            className="w-full h-full"
          />
        </div>

        <div className="mt-6 text-white">
          <h2 className="text-lg font-semibold mb-2">Features:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>HLS Adaptive Streaming</li>
            <li>Keyboard shortcuts (Space, Arrow keys, M, F, etc.)</li>
            <li>Mobile touch gestures</li>
            <li>Fullscreen support</li>
            <li>Picture-in-Picture</li>
            <li>Volume control</li>
            <li>Progress seeking</li>
            <li>Auto-hiding controls</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
