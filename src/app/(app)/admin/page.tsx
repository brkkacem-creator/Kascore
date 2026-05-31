import { createClient, createAdminClient } from '@/lib/supabase/server';
import { SyncButton } from '@/components/ui/SyncButton';

export const revalidate = 0;

export default async function AdminPage() {
  const admin = createAdminClient();

  const { data: matchesRaw } = await admin
    .from('matches')
    .select('*, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)')
    .order('scheduled_at')
    .limit(30);

  const matches = (matchesRaw ?? []) as any[];

  const { count: usersCount } = await admin.from('profiles').select('*', { count: 'exact', head: true });
  const { count: predsCount }  = await admin.from('predictions').select('*', { count: 'exact', head: true });
  const liveCount = matches.filter((m: any) => m.status === 'live').length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl text-[#E8D5A0]">Administration</h1>
          <p className="text-[#5A4E35] text-sm">Coupe du Monde 2026</p>
        </div>
        <SyncButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { n: usersCount ?? 0, l: 'Utilisateurs', icon: '👥' },
          { n: predsCount ?? 0, l: 'Pronostics',   icon: '🎯' },
          { n: liveCount,       l: 'En direct',    icon: '🔴' },
        ].map(s => (
          <div key={s.l} className="ka-card p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-display font-bold text-2xl text-[#C9A84C]">{s.n}</div>
            <div className="text-xs text-[#5A4E35] mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Auto-sync info */}
      <div className="ka-card p-4 mb-4 border-[#C9A84C]/20 bg-[#1A1500]">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-dot" />
          <span className="text-sm font-medium text-[#C9A84C]">Sync automatique active</span>
        </div>
        <p className="text-xs text-[#5A4E35]">
          Le cron Vercel appelle <code className="text-[#C9A84C]">/api/sync</code> toutes les 2 minutes.
          Les scores, statuts et points sont mis à jour automatiquement.
        </p>
      </div>

      {/* Match list */}
      <div className="ka-card overflow-hidden">
        <div className="px-5 py-3 border-b border-[#2A2410] font-medium text-sm text-[#E8D5A0]">
          Matchs récents
        </div>
        {(matches ?? []).map(m => (
          <div key={m.id}
               className="flex items-center justify-between px-5 py-3 border-b border-[#2A2410] last:border-0 text-sm hover:bg-[#1A1A1A] transition-colors">
            <span className="text-[#E8D5A0] truncate flex-1">
              {m.home_team?.name} vs {m.away_team?.name}
            </span>
            <div className="flex items-center gap-3 ml-2 flex-shrink-0">
              {m.home_score !== null
                ? <span className="font-display font-bold text-[#C9A84C]">{m.home_score}–{m.away_score}</span>
                : <span className="text-[#3A3020]">–</span>
              }
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                m.status === 'live'     ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                m.status === 'finished' ? 'bg-[#2A2410] text-[#5A4E35]' :
                'bg-[#1A1500] text-[#8B7030] border border-[#C9A84C]/20'
              }`}>
                {m.status === 'live' ? '🔴 Live' : m.status === 'finished' ? 'Terminé' : 'À venir'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
