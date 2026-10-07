import React from 'react';

export const theme = {
  cream: '#f8e4b5',
  gold: '#f5c451',
  muted: '#c9c1ae',
  red: '#e88a7a',
  font: '"Trebuchet MS", "Segoe UI", Arial, sans-serif',
  titleShadow: '0 3px 0 rgba(0,0,0,0.45)',
};

export const Panel: React.FC<{ width: number; minHeight?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  width, minHeight, children, style,
}) => (
  <div style={{
    width, maxWidth: '96vw', minHeight, boxSizing: 'border-box',
    borderStyle: 'solid', borderWidth: 56,
    borderImageSource: 'url(/assets/png/default/ui/menu/panel_menu.png)',
    borderImageSlice: '56 fill',
    borderImageRepeat: 'stretch',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    color: theme.cream, fontFamily: theme.font,
    ...style,
  }}>
    {children}
  </div>
);

export const MenuScreen: React.FC<{ dim?: boolean; children: React.ReactNode }> = ({ dim, children }) => (
  <div style={{
    position: 'absolute', inset: 0, overflow: 'auto',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    ...(dim
      ? { backgroundColor: 'rgba(0,0,0,0.25)' }
      : { backgroundColor: '#1a4e76', backgroundImage: 'url(/assets/png/default/tiles/tile_73.png)', backgroundRepeat: 'repeat' }),
  }}>
    {children}
  </div>
);

export const MenuTitle: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <h1 style={{
    margin: 0, fontSize: '2.4rem', fontWeight: 900, letterSpacing: 0.5,
    color: theme.cream, textShadow: theme.titleShadow, ...style,
  }}>
    {children}
  </h1>
);

export const formatClock = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const formatDay = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
};
export const formatHour = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
