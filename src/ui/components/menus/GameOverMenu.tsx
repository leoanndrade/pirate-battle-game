import React, { useEffect } from 'react';
import { useGameStore } from '../../../store/gameStore';
import { soundManager } from '../../../game/SoundManager';
import { gameEngine } from '../../../game/GameApplication';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { PostScoreBody } from '../../../mocks/handlers';
import { SpriteButton } from '../SpriteButton';
import { MenuScreen, Panel, MenuTitle, theme, formatClock } from './MenuKit';

export const GameOverMenu: React.FC = () => {
  const { setGameState, score, lastResult, matchDuration, spawnRate } = useGameStore();
  const queryClient = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (body: PostScoreBody) => axios.post('/api/ranking', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  });

  const hasPosted = React.useRef(false);
  useEffect(() => {
    if (!hasPosted.current && lastResult) {
      hasPosted.current = true;
      mutate({ score, duration: lastResult.duration, result: lastResult.reason });
    }
  }, [score, lastResult, mutate]);

  const handlePlayAgain = () => {
    soundManager.play('ui_click');
    setGameState('PLAYING');
    gameEngine.startGame(matchDuration, spawnRate);
  };

  const handleMainMenu = () => {
    soundManager.play('ui_click');
    setGameState('START_MENU');
  };

  const died = lastResult?.reason === 'PLAYER_DIED';
  const big = { fontSize: '1.6rem' };

  return (
    <MenuScreen dim>
      <Panel width={780} minHeight={660} style={{ justifyContent: 'center' }}>
        <MenuTitle>{died ? 'SHIP SUNK' : 'BATTLE COMPLETE'}</MenuTitle>

        <div style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, color: theme.gold, textShadow: theme.titleShadow, marginTop: 10 }}>
          {score}
        </div>
        <p style={{ margin: '4px 0 16px', fontSize: '0.95rem', fontWeight: 700, color: theme.cream }}>
          POINTS · {formatClock(lastResult?.duration ?? 0)} · {died ? 'DEFEATED' : 'TIME UP'}
        </p>

        <div style={{ height: 18, fontSize: '0.8rem', color: isError ? theme.red : theme.muted }}>
          {isPending ? 'Saving to the Captain\'s Log...' : isError ? 'Could not save score.' : ''}
        </div>

        <SpriteButton baseName="button_primary" scale={1.25} text="PLAY AGAIN" textStyle={big} onClick={handlePlayAgain} disabled={isPending} style={{ margin: 6 }} />
        <SpriteButton baseName="button_primary" scale={1.25} text="MAIN MENU" textStyle={big} onClick={handleMainMenu} disabled={isPending} style={{ margin: 6 }} />
      </Panel>
    </MenuScreen>
  );
};
