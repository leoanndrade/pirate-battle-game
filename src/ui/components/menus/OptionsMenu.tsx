import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import { SpriteButton } from '../SpriteButton';
import { soundManager } from '../../../game/SoundManager';
import { MenuScreen, Panel, MenuTitle, theme } from './MenuKit';

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ label, value, min, max, step, format, onChange }) => {
  const change = (dir: number) => {
    const next = Math.round((value + dir * step) * 100) / 100;
    if (next < min || next > max) return;
    soundManager.play('ui_click');
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14 }}>
      <span style={{ fontSize: '1rem', fontWeight: 700, color: theme.cream, marginBottom: 6 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <SpriteButton data-testid={`${label}-minus`} baseName="button_round" scale={0.75} icon="icon_minus" iconScale={0.55} disabled={value <= min} onClick={() => change(-1)} style={{ margin: 0 }} />
        <span style={{ width: 190, textAlign: 'center', fontSize: '1.5rem', fontWeight: 900, color: theme.cream }}>{format(value)}</span>
        <SpriteButton data-testid={`${label}-plus`} baseName="button_round" scale={0.75} icon="icon_plus" iconScale={0.55} disabled={value >= max} onClick={() => change(1)} style={{ margin: 0 }} />
      </div>
    </div>
  );
};

export const OptionsMenu: React.FC = () => {
  const { setGameState, matchDuration, setMatchDuration, spawnRate, setSpawnRate, optionsReturnTo } = useGameStore();
  const fromPause = optionsReturnTo === 'PAUSED';

  const handleBack = () => {
    soundManager.play('ui_click');
    setGameState(optionsReturnTo);
  };

  return (
    <MenuScreen dim={fromPause}>
      <Panel width={780} minHeight={660} style={{ justifyContent: 'center' }}>
        <MenuTitle style={{ marginBottom: 24 }}>OPTIONS</MenuTitle>

        <Stepper label="Game session time" value={matchDuration} min={30} max={300} step={10} format={(v) => `${v} s`} onChange={setMatchDuration} />
        <Stepper label="Enemy spawn time" value={spawnRate} min={0.5} max={10} step={0.5} format={(v) => `${v} s`} onChange={setSpawnRate} />

        {fromPause && (
          <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: theme.muted }}>Changes apply to the next battle.</p>
        )}

        <SpriteButton baseName="button_primary" scale={1.25} text={fromPause ? 'BACK' : 'MAIN MENU'} textStyle={{ fontSize: '1.6rem' }} onClick={handleBack} />
      </Panel>
    </MenuScreen>
  );
};
