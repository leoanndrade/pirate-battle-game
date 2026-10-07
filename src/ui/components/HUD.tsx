import React, { useEffect, useState } from 'react';
import { gameEvents } from '../../utils/EventEmitter';
import { SpriteIcon } from './SpriteIcon';
import { useGameStore } from '../../store/gameStore';
import { gameEngine } from '../../game/GameApplication';
import { soundManager } from '../../game/SoundManager';
import { SpriteButton } from './SpriteButton';

export const HUD: React.FC = () => {
  const { score, timeRemaining, setGameState } = useGameStore();
  const [playerHealth, setPlayerHealth] = useState(100);
  const [damageFlash, setDamageFlash] = useState(false);

  useEffect(() => {

    const unsubHealth = gameEvents.on('PLAYER_HEALTH_CHANGED', (health) => setPlayerHealth(health));
    const unsubDamage = gameEvents.on('PLAYER_TOOK_DAMAGE', () => {
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 200);
    });

    return () => {
      unsubHealth();
      unsubDamage();
    };
  }, []);

  const handlePause = () => {
    soundManager.play('ui_click');
    gameEngine.pauseGame();
    setGameState('PAUSED');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#fff',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        textShadow: '2px 2px 0px #000',
        transition: 'box-shadow 0.2s',
        boxShadow: damageFlash ? 'inset 0 0 150px rgba(255, 0, 0, 0.8)' : 'none'
      }}
    >
      {/* TOP AREA */}
      <div style={{ position: 'relative', width: '100%', height: '64px' }}>
        
        {/* Center: Score and Time */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', fontSize: '24px' }}>
          
          {/* Score Panel */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <SpriteIcon name="counter_panel" scale={1.2} />
            <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', top: '50%', transform: 'translateY(-55%)' }}>
              <div style={{ marginRight: 10, transform: 'translateY(2px)' }}><SpriteIcon name="icon_score" scale={0.7} /></div>
              <span>{score}</span>
            </div>
          </div>
          
          {/* Time Panel */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <SpriteIcon name="counter_panel" scale={1.2} />
            <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', top: '50%', transform: 'translateY(-55%)' }}>
              <span>{formatTime(timeRemaining)}</span>
              <div style={{ marginLeft: 10, transform: 'translateY(2px)' }}><SpriteIcon name="icon_time" scale={0.7} /></div>
            </div>
          </div>

        </div>

        {/* Right: Pause Button */}
        <div style={{ position: 'absolute', right: 0, top: 0 }}>
          <SpriteButton 
            baseName="button_round"
            scale={1.2}
            icon="icon_pause"
            iconScale={0.7}
            onClick={handlePause}
            style={{ pointerEvents: 'auto', margin: 0 }}
          />
        </div>
      </div>

      {/* BOTTOM AREA: Health Bar */}
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
          <div style={{ transform: 'translateY(3px)' }}><SpriteIcon name="icon_heart" scale={0.7} /></div>
          <span style={{ marginLeft: 5 }}>HP: {Math.max(0, playerHealth)}</span>
        </div>
        
        {/* Health bar scaled by 1.6 */}
        <div style={{ position: 'relative', width: 256 * 1.6, height: 48 * 1.6 }}>
          <div style={{ position: 'absolute', top: 0, left: 0 }}>
            <SpriteIcon name="health_frame" scale={1.6} />
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, width: `${Math.max(0, playerHealth)}%`, height: '100%', overflow: 'hidden', transition: 'width 0.2s' }}>
            <SpriteIcon 
              name={playerHealth > 50 ? 'health_fill_green' : playerHealth > 25 ? 'health_fill_amber' : 'health_fill_red'} 
              scale={1.6} 
            />
          </div>
        </div>
      </div>

    </div>
  );
};
