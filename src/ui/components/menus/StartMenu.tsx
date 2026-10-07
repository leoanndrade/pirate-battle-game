import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import { SpriteIcon } from '../SpriteIcon';
import { SpriteButton } from '../SpriteButton';
import { gameEngine } from '../../../game/GameApplication';
import { soundManager } from '../../../game/SoundManager';
import { MenuScreen, Panel, theme } from './MenuKit';

export const StartMenu: React.FC = () => {
  const { setGameState, matchDuration, spawnRate, openOptions, openLog } = useGameStore();

  const handlePlay = () => {
    soundManager.play('ui_click');
    setGameState('PLAYING');
    gameEngine.startGame(matchDuration, spawnRate);
  };

  return (
    <MenuScreen>
      <Panel width={780} style={{ padding: '10px 20px 0' }}>
        <SpriteIcon name="title_pirate_battle" scale={1} />

        <p style={{ margin: '18px 0 10px', fontSize: '0.85rem', letterSpacing: 4, fontWeight: 700, color: theme.cream }}>
          SET SAIL. TAKE COMMAND.
        </p>

        <SpriteButton baseName="button_primary" scale={1.25} text="PLAY" textStyle={{ fontSize: '1.6rem' }} onClick={handlePlay} style={{ margin: '6px' }} />
        <SpriteButton
          baseName="button_primary" scale={1.25} text="OPTIONS" textStyle={{ fontSize: '1.6rem' }}
          onClick={() => { soundManager.play('ui_click'); openOptions('START_MENU'); }}
          style={{ margin: '6px' }}
        />

        <img src="/assets/png/default/ships/ship_1.png" alt="" style={{ height: 80, margin: '18px 0 14px', imageRendering: 'auto' }} />

        <p style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 600, color: theme.cream }}>
          Navigate the islands. Survive the battle.
        </p>

        <div style={{ display: 'flex', gap: 20 }}>
          <SpriteButton
            baseName="button_secondary" scale={0.85} text="RANKING" textStyle={{ fontSize: '1rem' }}
            onClick={() => { soundManager.play('ui_click'); openLog('RANKING'); }} style={{ margin: 0 }}
          />
          <SpriteButton
            baseName="button_secondary" scale={0.85} text="MATCH HISTORY" textStyle={{ fontSize: '1rem' }}
            onClick={() => { soundManager.play('ui_click'); openLog('HISTORY'); }} style={{ margin: 0 }}
          />
        </div>
      </Panel>
    </MenuScreen>
  );
};
