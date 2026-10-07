import React from 'react';
import uiSheet from '../../../public/assets/spritesheet/ui_sheet.json';

interface SpriteIconProps {
  name: string;
  scale?: number;
}

export const SpriteIcon: React.FC<SpriteIconProps> = ({ name, scale = 1 }) => {

  const frameData = (uiSheet.frames as any)[name]?.frame;
  
  if (!frameData) {
    return <div style={{ width: 32, height: 32, background: 'red' }} title={`Missing: ${name}`} />;
  }

  const { x, y, w, h } = frameData;

  return (
    <div
      style={{
        width: w * scale,
        height: h * scale,
        backgroundImage: 'url(/assets/spritesheet/ui_sheet.png)',
        backgroundPosition: `-${x * scale}px -${y * scale}px`,
        backgroundSize: `${uiSheet.meta.size.w * scale}px ${uiSheet.meta.size.h * scale}px`,
        backgroundRepeat: 'no-repeat',
        display: 'inline-block'
      }}
    />
  );
};
