'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number[];
  onValueChange: (values: number[]) => void;
  max?: number;
  min?: number;
  step?: number;
  className?: string;
}

export function Slider({ 
  value, 
  onValueChange, 
  max = 100, 
  min = 0, 
  step = 1, 
  className 
}: SliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentValue = value[0] || 0;
  const percentage = ((currentValue - min) / (max - min)) * 100;

  const handleInteraction = (clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = min + percent * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    
    onValueChange([steppedValue]);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    handleInteraction(event.clientX);
    
    const handleMouseMove = (e: MouseEvent) => {
      handleInteraction(e.clientX);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={sliderRef}
      className={cn(
        'relative flex items-center w-full h-5 cursor-pointer',
        className
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Track */}
      <div className="relative w-full h-1 bg-white/30 rounded-full">
        {/* Range */}
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white transition-transform',
            isDragging ? 'scale-125' : 'scale-100'
          )}
          style={{ 
            left: `${percentage}%`, 
            transform: 'translateX(-50%) translateY(-50%)' 
          }}
        />
      </div>
    </div>
  );
}
