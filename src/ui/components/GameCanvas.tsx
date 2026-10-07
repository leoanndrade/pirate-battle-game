import React, { useEffect, useRef } from 'react';
import { gameEngine } from '../../game/GameApplication';
import { MenuOverlay } from './MenuOverlay';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const initGame = async () => {
      if (canvasRef.current && containerRef.current && isMounted) {
        await gameEngine.init(canvasRef.current, containerRef.current);
      }
    };

    initGame();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
      />
      
      <MenuOverlay />
    </div>
  );
};
