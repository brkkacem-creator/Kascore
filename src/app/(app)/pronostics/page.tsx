import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MatchList } from '@/components/matches/MatchList';

export const revalidate = 60;

export default async function PronosticsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: predictions } = await supabase
    .from('predictions')
    .select(`*, match:matches(*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*))`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const matches = predictions?.map(p => p.match).filter(Boolean) ?? [];
  const predMap: Record<string, { home_score: number; away_score: number; points: number | null }> = {};
  for (const p of (predictions ?? []) as any[]) {
    if (p.match_id) predMap[p.match_id] = { home_score: p.home_score, away_score: p.away_score, points: p.points };
  }

  const exact   = predictions?.filter(p => p.points === 3).length ?? 0;
  const result  = predictions?.filter(p => p.points === 1).length ?? 0;
  const missed  = predictions?.filter(p => p.points === 0 && p.points !== null).length ?? 0;
  const total   = predictions?.reduce((s, p) => s + (p.points ?? 0), 0) ?? 0;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-[#E8D5A0] mb-1">Mes pronostics</h1>
        <p className="text-[#5A4E35] text-sm">{predictions?.length ?? 0} pronostics enregistrés</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { n: total,  l: 'Points',  color: 'text-[#C9A84C]',   bg: 'border-[#C9A84C]/20 bg-[#1A1500]' },
          { n: exact,  l: 'Exacts',  color: 'text-emerald-400', bg: 'border-emerald-500/20' },
          { n: result, l: 'Résult.', color: 'text-amber-400',   bg: 'border-amber-500/20' },
          { n: missed, l: 'Ratés',   color: 'text-[#5A4E35]',   bg: 'border-[#2A2410]' },
        ].map(s => (
          <div key={s.l} className={`ka-card p-3 text-center border ${s.bg}`}>
            <div className={`font-display font-bold text-xl ${s.color}`}>{s.n}</div>
            <div className="text-xs text-[#3A3020] mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 ka-card">
          <div className="text-5xl mb-3">🎯</div>
          <p className="font-medium text-[#5A4E35]">Aucun pronostic encore</p>
          <p className="text-sm text-[#3A3020] mt-1">Va dans le calendrier pour pronostiquer !</p>
        </div>
      ) : (
        <MatchList
          initialMatches={matches as any}
          predictions={predMap}
          userId={user.id}
        />
      )}
    </div>
  );
}
