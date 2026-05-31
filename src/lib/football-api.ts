const BASE = process.env.FOOTBALL_API_BASE ?? 'https://api.football-data.org/v4';
const KEY = process.env.FOOTBALL_API_KEY ?? '';

// FIFA World Cup 2026 competition ID on football-data.org
const WC2026_ID = 2000;

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': KEY },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Football API error: ${res.status} ${path}`);
  return res.json() as T;
}

export interface APIMatch {
  id: number;
  utcDate: string;
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'POSTPONED' | 'CANCELLED';
  minute?: number;
  stage: string;
  group?: string;
  homeTeam: { id: number; name: string; shortName: string; tla: string };
  awayTeam: { id: number; name: string; shortName: string; tla: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  venue?: string;
}

export interface APIMatchesResponse {
  matches: APIMatch[];
  resultSet: { count: number; played: number };
}

export async function fetchAllMatches(): Promise<APIMatch[]> {
  const data = await apiFetch<APIMatchesResponse>(`/competitions/${WC2026_ID}/matches`);
  return data.matches;
}

export async function fetchLiveMatches(): Promise<APIMatch[]> {
  const data = await apiFetch<APIMatchesResponse>(
    `/competitions/${WC2026_ID}/matches?status=IN_PLAY,PAUSED`
  );
  return data.matches;
}

export async function fetchTodayMatches(): Promise<APIMatch[]> {
  const today = new Date().toISOString().split('T')[0];
  const data = await apiFetch<APIMatchesResponse>(
    `/competitions/${WC2026_ID}/matches?dateFrom=${today}&dateTo=${today}`
  );
  return data.matches;
}

export function mapAPIStatus(status: APIMatch['status']): 'upcoming' | 'live' | 'finished' | 'postponed' {
  if (['SCHEDULED', 'TIMED'].includes(status)) return 'upcoming';
  if (['IN_PLAY', 'PAUSED'].includes(status)) return 'live';
  if (status === 'FINISHED') return 'finished';
  return 'postponed';
}

export function mapAPIPhase(stage: string) {
  const map: Record<string, string> = {
    GROUP_STAGE: 'GROUP_STAGE',
    ROUND_OF_32: 'ROUND_OF_32',
    ROUND_OF_16: 'ROUND_OF_16',
    QUARTER_FINALS: 'QUARTER_FINALS',
    SEMI_FINALS: 'SEMI_FINALS',
    THIRD_PLACE: 'THIRD_PLACE',
    FINAL: 'FINAL',
  };
  return map[stage] ?? 'GROUP_STAGE';
}
