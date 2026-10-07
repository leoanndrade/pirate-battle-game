import { http, HttpResponse } from 'msw';

export const PLAYER_NAME = 'Captain Jack';

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  date: string;
  isPlayer?: boolean;
}

export interface HistoryEntry {
  id: string;
  score: number;
  date: string;
  /** Seconds played */
  duration: number;
  result: 'TIME_UP' | 'PLAYER_DIED';
}

export interface PostScoreBody {
  score: number;
  duration: number;
  result: HistoryEntry['result'];
}

const uid = () => Math.random().toString(36).substring(2, 9);

const getScores = (): ScoreEntry[] => {
  const data = localStorage.getItem('pirate_ranking');
  return data ? JSON.parse(data) : [];
};
const saveScores = (scores: ScoreEntry[]) => {
  localStorage.setItem('pirate_ranking', JSON.stringify(scores));
};

const getHistory = (): HistoryEntry[] => {
  const data = localStorage.getItem('pirate_history');
  return data ? JSON.parse(data) : [];
};
const saveHistory = (history: HistoryEntry[]) => {
  localStorage.setItem('pirate_history', JSON.stringify(history));
};

export const handlers = [
  http.get('*/api/ranking', () => {
    const sorted = getScores().sort((a, b) => b.score - a.score);
    return HttpResponse.json(sorted);
  }),

  http.get('*/api/history', () => {
    const sorted = getHistory().sort((a, b) => b.date.localeCompare(a.date));
    return HttpResponse.json(sorted);
  }),

  http.post('*/api/ranking', async ({ request }) => {
    const body = await request.json() as PostScoreBody;
    const date = new Date().toISOString();

    const entry: ScoreEntry = { id: uid(), name: PLAYER_NAME, score: body.score, date, isPlayer: true };

    if (body.score > 0) {
      const scores = getScores();
      scores.push(entry);
      saveScores(scores);
    }

    const history = getHistory();
    history.push({ id: entry.id, score: body.score, date, duration: body.duration, result: body.result });
    saveHistory(history);

    return HttpResponse.json(entry, { status: 201 });
  })
];
