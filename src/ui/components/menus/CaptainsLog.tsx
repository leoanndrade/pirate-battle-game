import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useGameStore } from '../../../store/gameStore';
import type { LogTab } from '../../../store/gameStore';
import type { ScoreEntry, HistoryEntry } from '../../../mocks/handlers';
import { soundManager } from '../../../game/SoundManager';
import { SpriteButton } from '../SpriteButton';
import { SpriteIcon } from '../SpriteIcon';
import { MenuScreen, Panel, MenuTitle, theme, formatClock, formatDay, formatHour } from './MenuKit';

const PAGE_SIZE = 5;

const rowStyle = (highlight: boolean): React.CSSProperties => ({
  display: 'grid', alignItems: 'center', height: 50, marginBottom: 8, borderRadius: 6,
  background: highlight ? 'rgba(160,130,60,0.45)' : 'rgba(10,20,35,0.55)',
  border: highlight ? '1px solid rgba(245,196,81,0.5)' : '1px solid rgba(0,0,0,0.25)',
  fontSize: '1.05rem', fontWeight: 700,
});
const cell: React.CSSProperties = { padding: '0 14px', height: '100%', display: 'flex', alignItems: 'center', borderRight: '1px solid rgba(0,0,0,0.25)' };
const headerStyle: React.CSSProperties = { display: 'grid', padding: '0 0 10px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 1.5, color: theme.muted };

const RANK_COLS = '1.2fr 3fr 1.4fr 2fr';
const HIST_COLS = '2.6fr 1.6fr 2fr 1.6fr';

const fetchJson = <T,>(url: string) => async () => (await axios.get<T>(url)).data;

export const CaptainsLog: React.FC = () => {
  const { setGameState, logTab, setLogTab, matchDuration, spawnRate } = useGameStore();
  const [page, setPage] = useState(0);

  const ranking = useQuery<ScoreEntry[]>({ queryKey: ['ranking'], queryFn: fetchJson('/api/ranking') });
  const history = useQuery<HistoryEntry[]>({ queryKey: ['history'], queryFn: fetchJson('/api/history') });

  const rows = (logTab === 'RANKING' ? ranking.data : history.data) ?? [];
  const list = Array.isArray(rows) ? rows : [];
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const visible = list.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const switchTab = (tab: LogTab) => {
    if (tab === logTab) return;
    soundManager.play('ui_click');
    setLogTab(tab);
    setPage(0);
  };

  const turnPage = (dir: number) => {
    soundManager.play('ui_click');
    setPage((p) => Math.min(pageCount - 1, Math.max(0, p + dir)));
  };

  return (
    <MenuScreen>
      <Panel width={1400} minHeight={740} style={{ padding: '0 20px' }}>
        <MenuTitle style={{ marginTop: -16 }}>CAPTAIN'S LOG</MenuTitle>

        {/* Tabs: active tab uses the gold primary button, inactive the dark secondary */}
        <div style={{ display: 'flex', gap: 30, margin: '10px 0 14px' }}>
          <SpriteButton baseName={logTab === 'RANKING' ? 'button_primary' : 'button_secondary'} scale={0.9} text="RANKING" textStyle={{ fontSize: '1.2rem' }} onClick={() => switchTab('RANKING')} style={{ margin: 0 }} />
          <SpriteButton baseName={logTab === 'HISTORY' ? 'button_primary' : 'button_secondary'} scale={0.9} text="MATCH HISTORY" textStyle={{ fontSize: '1.2rem' }} onClick={() => switchTab('HISTORY')} style={{ margin: 0 }} />
        </div>

        <p style={{ margin: '0 0 22px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: 0.5 }}>
          {logTab === 'RANKING'
            ? `${matchDuration} SECOND BATTLES · ${spawnRate} SECOND SPAWN INTERVAL`
            : 'CAPTAIN JACK · YOUR RECENT BATTLES'}
        </p>

        <div style={{ width: '100%', minHeight: 5 * 58 + 26 }}>
          {logTab === 'RANKING' ? (
            <>
              <div style={{ ...headerStyle, gridTemplateColumns: RANK_COLS }}>
                <span style={{ paddingLeft: 14 }}>RANK</span><span style={{ paddingLeft: 14 }}>CAPTAIN</span>
                <span style={{ paddingLeft: 14 }}>POINTS</span><span style={{ paddingLeft: 14 }}>PLAYED</span>
              </div>
              {(visible as ScoreEntry[]).map((e, i) => {
                const rank = page * PAGE_SIZE + i + 1;
                return (
                  <div key={e.id} style={{ ...rowStyle(!!e.isPlayer), gridTemplateColumns: RANK_COLS }}>
                    <span style={{ ...cell, color: theme.gold }}>{String(rank).padStart(2, '0')}</span>
                    <span style={{ ...cell, gap: 8 }}>
                      {rank === 1 && <SpriteIcon name="icon_score" scale={0.55} />}
                      {e.name}
                      {e.isPlayer && (
                        <span style={{ fontSize: '0.6rem', padding: '1px 5px', border: `1px solid ${theme.gold}`, borderRadius: 3, color: theme.gold }}>YOU</span>
                      )}
                    </span>
                    <span style={{ ...cell, color: theme.gold }}>{e.score}</span>
                    <span style={{ ...cell, borderRight: 'none', fontSize: '0.85rem' }}>{formatDay(e.date)} · {formatHour(e.date)}</span>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <div style={{ ...headerStyle, gridTemplateColumns: HIST_COLS }}>
                <span style={{ paddingLeft: 14 }}>DATE</span><span style={{ paddingLeft: 14 }}>POINTS</span>
                <span style={{ paddingLeft: 14 }}>DURATION</span><span style={{ paddingLeft: 14 }}>RESULT</span>
              </div>
              {(visible as HistoryEntry[]).map((e, i) => (
                <div key={e.id} style={{ ...rowStyle(page === 0 && i === 0), gridTemplateColumns: HIST_COLS }}>
                  <span style={cell}>{formatDay(e.date)}<span style={{ fontSize: '0.8rem', marginLeft: 6, color: theme.muted }}>· {formatHour(e.date)}</span></span>
                  <span style={{ ...cell, color: theme.gold }}>{e.score}</span>
                  <span style={cell}>{formatClock(e.duration)}</span>
                  <span style={{ ...cell, borderRight: 'none', fontSize: '0.8rem', color: e.result === 'TIME_UP' ? theme.cream : theme.red }}>
                    {e.result === 'TIME_UP' ? 'TIME UP' : 'DEFEATED'}
                  </span>
                </div>
              ))}
              {visible.length === 0 && !history.isLoading && (
                <p style={{ textAlign: 'center', color: theme.muted, marginTop: 60 }}>No battles yet. Set sail to start your log!</p>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '4px 0 6px' }}>
          <SpriteButton baseName="button_round" scale={0.65} icon="icon_turn_left" iconScale={0.5} disabled={page === 0} onClick={() => turnPage(-1)} style={{ margin: 0 }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>PAGE {page + 1} OF {pageCount}</span>
          <SpriteButton baseName="button_round" scale={0.65} icon="icon_turn_right" iconScale={0.5} disabled={page >= pageCount - 1} onClick={() => turnPage(1)} style={{ margin: 0 }} />
        </div>

        <SpriteButton baseName="button_primary" scale={1.1} text="MAIN MENU" textStyle={{ fontSize: '1.5rem' }}
          onClick={() => { soundManager.play('ui_click'); setGameState('START_MENU'); }} style={{ margin: '4px 0 -20px' }} />
      </Panel>
    </MenuScreen>
  );
};
