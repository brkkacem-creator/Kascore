'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MatchCard } from './MatchCard';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type PredMap = Record<string, { home_score: number; away_score: number; points: number | null }>;

interface Props {
  initialMatches: any[];
  predictions: PredMap;
  userId?: string;
  'pronos-only'?: boolean;
}

const PHASES = [
  { key: 'all',           label: 'Tous' },
  { key: 'live',          label: '🔴 Live' },
  { key: 'GROUP_STAGE',   label: 'Groupes' },
  { key: 'ROUND_OF_16',   label: '8èmes' },
  { key: 'QUARTER_FINALS',label: 'Quarts' },
  { key: 'SEMI_FINALS',   label: 'Demis' },
  { key: 'FINAL',         label: '🏆 Finale' },
];

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

export function MatchList({ initialMatches, predictions: initPreds, userId }: Props) {
  const [matches, setMatches] = useState(initialMatches);
  const [predictions, setPredictions] = useState<PredMap>(initPreds);
  const [search, setSearch] = useState('');
  const [activePhase, setActivePhase] = useState('all');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('matches-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, (payload) => {
        setMatches(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handlePredict = useCallback((matchId: string, h: number, a: number) => {
    setPredictions(prev => ({ ...prev, [matchId]: { home_score: h, away_score: a, points: null } }));
  }, []);

  const filtered = matches.filter(m => {
    if (search) {
      const q = search.toLowerCase();
      if (!m.home_team?.name?.toLowerCase().includes(q) && !m.away_team?.name?.toLowerCase().includes(q)) return false;
    }
    if (activePhase === 'live') return m.status === 'live';
    if (activeGroup) return m.group_id === activeGroup;
    if (activePhase !== 'all') return m.phase === activePhase;
    return true;
  });

  const byDate: Record<string, any[]> = {};
  for (const m of filtered) {
    const date = new Date(m.scheduled_at).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(m);
  }

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-2 bg-[#111111] border border-[#2A2410] focus-within:border-[#C9A84C]/40 rounded-2xl px-4 py-3 mb-4 transition-colors">
        <Search size={16} className="text-[#5A4E35] flex-shrink-0" />
        <input
          type="text"
          placeholder="Chercher une équipe…"
          className="flex-1 bg-transparent text-sm outline-none text-[#E8D5A0] placeholder:text-[#3A3020]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Phase filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-2 pb-1">
        {PHASES.map(p => (
          <button
            key={p.key}
            onClick={() => { setActivePhase(p.key); setActiveGroup(null); }}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              activePhase === p.key && !activeGroup
                ? 'gold-gradient-bg text-[#0A0A0A] shadow-gold'
                : 'bg-[#111111] border border-[#2A2410] text-[#5A4E35] hover:border-[#C9A84C]/30 hover:text-[#C9A84C]'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Group filters */}
      {(activePhase === 'all' || activePhase === 'GROUP_STAGE') && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
          <button
            onClick={() => setActiveGroup(null)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              !activeGroup
                ? 'bg-[#1A1A1A] border border-[#C9A84C]/40 text-[#C9A84C]'
                : 'bg-[#111111] border border-[#2A2410] text-[#3A3020]'
            )}
          >
            Tous
          </button>
          {GROUPS.map(g => (
            <button
              key={g}
              onClick={() => { setActiveGroup(g); setActivePhase('GROUP_STAGE'); }}
              className={cn(
                'flex-shrink-0 w-9 h-7 rounded-full text-xs font-bold transition-all',
                activeGroup === g
                  ? 'gold-gradient-bg text-[#0A0A0A]'
                  : 'bg-[#111111] border border-[#2A2410] text-[#5A4E35] hover:border-[#C9A84C]/30'
              )}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Match list grouped by date */}
      {Object.entries(byDate).length === 0 ? (
        <div className="text-center py-16 text-[#3A3020]">
          <div className="text-5xl mb-3">⚽</div>
          <p className="font-medium text-[#5A4E35]">Aucun match trouvé</p>
        </div>
      ) : (
        Object.entries(byDate).map(([date, dayMatches]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold text-[#5A4E35] uppercase tracking-wide capitalize">
                {date}
              </span>
              <div className="flex-1 ka-divider" />
              <span className="text-xs text-[#3A3020]">
                {dayMatches.length} match{dayMatches.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {dayMatches.map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  prediction={predictions[m.id]}
                  userId={userId}
                  onPredict={handlePredict}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
