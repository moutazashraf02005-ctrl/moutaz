import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeftRightIcon } from './Icons';

interface ImageComparatorProps {
  beforeImageUrl: string;
  afterImageUrl: string;
}

const ImageComparator: React.FC<ImageComparatorProps> = ({ beforeImageUrl, afterImageUrl }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    handleMove(clientX);
  }, [handleMove]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  useEffect(() => {
    if (!isDragging) return;

    const onDrag = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      handleMove(clientX);
    };

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, { passive: true });
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleMove, handleDragEnd]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full max-w-full aspect-square overflow-hidden rounded-lg select-none shadow-2xl cursor-ew-resize transition-all duration-200 ${isDragging ? 'ring-4 ring-fuchsia-500/50 scale-[1.02]' : 'ring-0 scale-100'}`}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      role="slider"
      aria-valuenow={sliderPosition}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="سلايدر مقارنة الصور"
    >
      {/* After Image (the result) - bottom layer */}
      <img 
        src={afterImageUrl} 
        alt="الصورة الجديدة" 
        className="absolute w-full h-full object-contain pointer-events-none"
        draggable="false"
      />
      
      {/* Before Image (the original) - top layer, clipped */}
      <div 
        className="absolute w-full h-full overflow-hidden pointer-events-none" 
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img 
          src={beforeImageUrl} 
          alt="الصورة الأصلية" 
          className="w-full h-full object-contain pointer-events-none"
          draggable="false"
        />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 h-full w-1 bg-white/75 backdrop-filter backdrop-blur-sm pointer-events-none transition-opacity duration-300"
        style={{ 
          left: `calc(${sliderPosition}% - 1px)`,
          opacity: isDragging ? 0.2 : 1
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 text-gray-800 shadow-lg pointer-events-none">
          <ArrowLeftRightIcon />
        </div>
      </div>
      
      <div className="absolute top-2 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-semibold pointer-events-none">الأصلية</div>
      <div className="absolute top-2 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-semibold pointer-events-none">الجديدة</div>
    </div>
  );
};

export default ImageComparator;