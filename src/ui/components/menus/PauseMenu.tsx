import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import { gameEngine } from '../../../game/GameApplication';
import { soundManager } from '../../../game/SoundManager';
import { SpriteButton } from '../SpriteButton';
import { MenuScreen, Panel, MenuTitle, theme } from './MenuKit';

export const PauseMenu: React.FC = () => {
  const { setGameState, openOptions } = useGameStore();

  const handleResume = () => {
    soundManager.play('ui_click');
    setGameState('PLAYING');
    gameEngine.resumeGame();
  };

  const handleQuit = () => {
    soundManager.play('ui_click');
    gameEngine.endGame();
    setGameState('START_MENU');
  };

  const big = { fontSize: '1.6rem' };

  return (
    <MenuScreen dim>
      <Panel width={780} minHeight={660} style={{ justifyContent: 'center' }}>
        <MenuTitle>PAUSED</MenuTitle>
        <p style={{ margin: '14px 0 16px', fontSize: '1rem', fontWeight: 700, color: theme.cream }}>Ready when you are.</p>

        <SpriteButton baseName="button_primary" scale={1.25} text="RESUME" textStyle={big} onClick={handleResume} style={{ margin: 6 }} />
        <SpriteButton baseName="button_primary" scale={1.25} text="OPTIONS" textStyle={big} onClick={() => { soundManager.play('ui_click'); openOptions('PAUSED'); }} style={{ margin: 6 }} />
        <SpriteButton baseName="button_primary" scale={1.25} text="MAIN MENU" textStyle={big} onClick={handleQuit} style={{ margin: 6 }} />
      </Panel>
    </MenuScreen>
  );
};
