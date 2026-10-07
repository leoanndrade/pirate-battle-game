import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { StartMenu } from './menus/StartMenu';
import { OptionsMenu } from './menus/OptionsMenu';
import { GameOverMenu } from './menus/GameOverMenu';
import { PauseMenu } from './menus/PauseMenu';
import { CaptainsLog } from './menus/CaptainsLog';
import { HUD } from './HUD';
import { gameEvents } from '../../utils/EventEmitter';
import { gameEngine } from '../../game/GameApplication';

export const MenuOverlay: React.FC = () => {
  const { gameState, setGameState, setScore, setTimeRemaining, setLastResult } = useGameStore();

  useEffect(() => {
    const onGameOver = (reason?: 'TIME_UP' | 'PLAYER_DIED') => {
      const { matchDuration, timeRemaining } = useGameStore.getState();
      setLastResult({ reason: reason ?? 'TIME_UP', duration: matchDuration - timeRemaining });
      setGameState('GAME_OVER');
    };
    const onScoreChanged = (score: number) => {
      setScore(score);
    };
    const onTimeChanged = (time: number) => {
      setTimeRemaining(time);
    };

    gameEvents.on('GAME_OVER', onGameOver);
    gameEvents.on('SCORE_CHANGED', onScoreChanged);
    gameEvents.on('TIME_CHANGED', onTimeChanged);

    return () => {
      gameEvents.off('GAME_OVER', onGameOver);
      gameEvents.off('SCORE_CHANGED', onScoreChanged);
      gameEvents.off('TIME_CHANGED', onTimeChanged);
    };
  }, [setGameState, setScore, setTimeRemaining, setLastResult]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameState === 'PLAYING') {
        gameEngine.pauseGame();
        setGameState('PAUSED');
      } else if (e.key === 'Escape' && gameState === 'PAUSED') {
        gameEngine.resumeGame();
        setGameState('PLAYING');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, setGameState]);

  return (
    <>
      {gameState === 'PLAYING' && <HUD />}
      {gameState === 'START_MENU' && <StartMenu />}
      {gameState === 'OPTIONS_MENU' && <OptionsMenu />}
      {gameState === 'LOG_MENU' && <CaptainsLog />}
      {gameState === 'PAUSED' && <PauseMenu />}
      {gameState === 'GAME_OVER' && <GameOverMenu />}
    </>
  );
};
