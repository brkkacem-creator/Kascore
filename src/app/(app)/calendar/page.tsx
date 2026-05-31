import { createClient } from '@/lib/supabase/server';
import { MatchList } from '@/components/matches/MatchList';

export const revalidate = 60;

export default async function CalendarPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: matchesRaw } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .order('scheduled_at', { ascending: true });

  const matches = (matchesRaw ?? []) as any[];

  const { data: predictionsRaw } = user
    ? await supabase.from('predictions').select('*').eq('user_id', user.id)
    : { data: [] };

  const predictions = (predictionsRaw ?? []) as any[];

  const predMap: Record<string, { home_score: number; away_score: number; points: number | null }> = {};
  for (const p of predictions) {
    predMap[p.match_id] = { home_score: p.home_score, away_score: p.away_score, points: p.points };
  }

  const liveCount = matches.filter((m: any) => m.status === 'live').length;

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-[#E8D5A0] mb-0.5">Calendrier</h1>
          <p className="text-[#5A4E35] text-sm">{matches.length} matchs · USA / Canada / Mexique</p>
        </div>
        {liveCount > 0 && (
          <div className="ka-badge-live">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-dot" />
            {liveCount} en direct
          </div>
        )}
      </div>
      <MatchList
        initialMatches={matches}
        predictions={predMap}
        userId={user?.id}
      />
    </div>
  );
}
