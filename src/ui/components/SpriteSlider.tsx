import React, { useRef, useState } from 'react';
import { SpriteIcon } from './SpriteIcon';
import { soundManager } from '../../game/SoundManager';

interface SpriteSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  scale?: number;
}

export const SpriteSlider: React.FC<SpriteSliderProps> = ({ value, min, max, step = 1, onChange, scale = 1 }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValue = (clientX: number) => {
    if (!barRef.current) return value;
    const rect = barRef.current.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    let val = min + percent * (max - min);
    
    if (step) {
      val = Math.round(val / step) * step;
    }
    return val;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    soundManager.play('ui_click');
    onChange(calculateValue(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      onChange(calculateValue(e.clientX));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const percent = (value - min) / (max - min);

  const w = 256 * scale;
  const h = 48 * scale;
  const fillW = w;
  const fillH = h;
  const topOffset = 0;
  const leftOffset = 0;

  return (
    <div 
      ref={barRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ 
        position: 'relative', width: w, height: h, cursor: 'pointer', touchAction: 'none', margin: '0 auto'
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <SpriteIcon name="health_frame" scale={scale} />
      </div>

      <div style={{
        position: 'absolute', top: topOffset, left: leftOffset, 
        width: `${percent * fillW}px`, height: fillH, 
        overflow: 'hidden', pointerEvents: 'none'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <SpriteIcon name="health_fill_amber" scale={scale} />
        </div>
      </div>
    </div>
  );
};
