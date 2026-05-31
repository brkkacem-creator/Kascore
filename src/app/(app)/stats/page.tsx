import { createClient } from '@/lib/supabase/server';

export const revalidate = 120;

export default async function StatsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: predictions } = user
    ? await supabase.from('predictions').select('*, match:matches(*)').eq('user_id', user.id)
    : { data: [] };

  const total   = predictions?.length ?? 0;
  const exact   = predictions?.filter(p => p.points === 3).length ?? 0;
  const correct = predictions?.filter(p => p.points === 1).length ?? 0;
  const missed  = predictions?.filter(p => p.points === 0 && p.points !== null).length ?? 0;
  const points  = predictions?.reduce((s, p) => s + (p.points ?? 0), 0) ?? 0;
  const accuracy = total > 0 ? Math.round(((exact + correct) / total) * 100) : 0;
  const avgPts   = total > 0 ? (points / total).toFixed(1) : '0';

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-[#E8D5A0] mb-1">Statistiques</h1>
        <p className="text-[#5A4E35] text-sm">Tes performances détaillées</p>
      </div>

      {/* Hero points */}
      <div className="relative overflow-hidden ka-card p-6 mb-4 border-[#C9A84C]/30"
           style={{ background: 'linear-gradient(135deg, #1A1500 0%, #111111 100%)' }}>
        <div className="absolute top-0 right-0 text-[120px] leading-none opacity-5 font-display font-black text-[#C9A84C] select-none">
          {points}
        </div>
        <div className="relative">
          <div className="text-xs text-[#5A4E35] uppercase tracking-wider mb-1">Points totaux</div>
          <div className="font-display font-black text-6xl text-gold-gradient mb-1">{points}</div>
          <div className="text-sm text-[#5A4E35]">
            sur {total} pronostic{total > 1 ? 's' : ''} · moy. {avgPts} pts
          </div>
        </div>
      </div>

      {/* 3 stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { n: exact,   l: 'Exacts',   sub: '+3 pts', color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
          { n: correct, l: 'Résultat', sub: '+1 pt',  color: 'text-amber-400',   bg: 'bg-amber-500/5 border-amber-500/20' },
          { n: missed,  l: 'Ratés',    sub: '0 pt',   color: 'text-[#5A4E35]',   bg: 'bg-[#111111] border-[#2A2410]' },
        ].map(s => (
          <div key={s.l} className={`ka-card p-4 text-center border ${s.bg}`}>
            <div className={`font-display font-black text-3xl ${s.color}`}>{s.n}</div>
            <div className="text-xs text-[#5A4E35] mt-0.5">{s.l}</div>
            <div className={`text-xs font-medium mt-1 ${s.color}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Accuracy bar */}
      <div className="ka-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-sm text-[#E8D5A0]">Précision globale</span>
          <span className="font-display font-bold text-2xl text-[#C9A84C]">{accuracy}%</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
          <div className="bg-emerald-500 transition-all duration-700 rounded-l-full"
               style={{ width: `${total > 0 ? (exact / total) * 100 : 0}%` }} />
          <div className="bg-amber-400 transition-all duration-700"
               style={{ width: `${total > 0 ? (correct / total) * 100 : 0}%` }} />
          <div className="bg-[#2A2410] flex-1 rounded-r-full transition-all duration-700" />
        </div>
        <div className="flex gap-5 text-xs text-[#5A4E35]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Exact ({exact})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />Résultat ({correct})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#2A2410]" />Raté ({missed})
          </span>
        </div>
      </div>

      {/* Scoring rules */}
      <div className="ka-card p-5 mb-4">
        <div className="font-medium text-sm text-[#E8D5A0] mb-4">Système de points</div>
        <div className="flex flex-col gap-0">
          {[
            { icon: '🎯', label: 'Score exact',           pts: '+3 pts', color: 'text-emerald-400' },
            { icon: '✓',  label: 'Bon vainqueur / nul',  pts: '+1 pt',  color: 'text-amber-400' },
            { icon: '✗',  label: 'Mauvais résultat',     pts: '0 pt',   color: 'text-[#3A3020]' },
          ].map(r => (
            <div key={r.label}
                 className="flex items-center justify-between py-3 border-b border-[#2A2410] last:border-0">
              <span className="text-sm text-[#E8D5A0] flex items-center gap-2">
                <span>{r.icon}</span>{r.label}
              </span>
              <span className={`font-display font-bold ${r.color}`}>{r.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress to next rank */}
      {total === 0 && (
        <div className="text-center py-8 ka-card">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-[#5A4E35] font-medium">Aucun pronostic encore</p>
          <p className="text-[#3A3020] text-sm mt-1">Va dans le calendrier pour commencer !</p>
        </div>
      )}
    </div>
  );
}
