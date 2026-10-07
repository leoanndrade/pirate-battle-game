import { GameCanvas } from './ui/components/GameCanvas';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}>
      <GameCanvas />
      <Analytics />
    </div>
  );
}

export default App;
