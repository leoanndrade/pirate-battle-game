import React, { useState } from 'react';
import uiSheet from '../../../public/assets/spritesheet/ui_sheet.json';
import { SpriteIcon } from './SpriteIcon';
import { soundManager } from '../../game/SoundManager';

type ButtonBase = 'button_primary' | 'button_secondary' | 'button_round';

interface SpriteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  baseName: ButtonBase;
  scale?: number;
  icon?: string;
  iconScale?: number;
  text?: string;
  textStyle?: React.CSSProperties;
}

const hasFrame = (name: string) =>

  Boolean((uiSheet.frames as any)[name]);

export const SpriteButton: React.FC<SpriteButtonProps> = ({
  baseName, scale = 1, icon, iconScale = 1, text, textStyle, disabled, style, ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  let state: 'normal' | 'hover' | 'pressed' | 'disabled' = 'normal';
  if (disabled) state = 'disabled';
  else if (isPressed) state = 'pressed';
  else if (isHovered) state = 'hover';

  let spriteName = `${baseName}_${state}`;

  let useHoverFilter = false;
  if (!hasFrame(spriteName)) {
    if (state === 'hover') useHoverFilter = true;
    spriteName = `${baseName}_normal`;
  }

  const yOffset = isPressed ? '-42%' : '-55%';

  return (
    <button
      {...props}
      disabled={disabled}
      onPointerEnter={(e) => {
        if (!disabled) { setIsHovered(true); soundManager.play('ui_hover'); }
        props.onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => { setIsHovered(false); setIsPressed(false); props.onPointerLeave?.(e); }}
      onPointerDown={(e) => { if (!disabled) setIsPressed(true); props.onPointerDown?.(e); }}
      onPointerUp={(e) => { setIsPressed(false); props.onPointerUp?.(e); }}
      style={{
        position: 'relative', background: 'none', border: 'none', padding: 0, margin: '10px',
        cursor: disabled ? 'default' : 'pointer',
        filter: useHoverFilter ? 'brightness(1.2)' : disabled ? 'grayscale(0.6)' : 'none',
        transition: 'filter 0.1s',
        ...style,
      }}
    >
      <SpriteIcon name={spriteName} scale={scale} />

      {icon && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, ${yOffset})`, display: 'flex', pointerEvents: 'none' }}>
          <SpriteIcon name={icon} scale={iconScale} />
        </div>
      )}

      {text && (
        <span style={{
          position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, ${yOffset})`,
          color: disabled ? '#8a7a5a' : baseName === 'button_primary' ? '#3b2410' : '#f8e4b5',
          fontSize: '1.4rem', fontWeight: 900, letterSpacing: 0.5,
          fontFamily: '"Trebuchet MS", "Segoe UI", Arial, sans-serif',
          textShadow: baseName === 'button_primary' ? '0 1px 0 rgba(255,230,160,0.6)' : '0 2px 0 rgba(0,0,0,0.6)',
          pointerEvents: 'none', whiteSpace: 'nowrap',
          ...textStyle,
        }}>
          {text}
        </span>
      )}
    </button>
  );
};
