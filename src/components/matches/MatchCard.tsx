'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { getResultColor, getResultLabel } from '@/lib/scoring';
import { hapticTap, hapticSuccess } from '@/hooks/useNativeApp';
import { MapPin, Clock } from 'lucide-react';

interface Props {
  match: any;
  prediction?: { home_score: number; away_score: number; points: number | null };
  userId?: string;
  onPredict?: (matchId: string, home: number, away: number) => void;
}

export function MatchCard({ match, prediction, userId, onPredict }: Props) {
  const [homeInput, setHomeInput] = useState<string>(prediction?.home_score?.toString() ?? '');
  const [awayInput, setAwayInput] = useState<string>(prediction?.away_score?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!prediction);

  const isLive     = match.status === 'live';
  const isFinished = match.status === 'finished';
  const hasScore   = match.home_score !== null && match.away_score !== null;
  const canPredict = userId && !isFinished && !isLive;

  const matchDate = new Date(match.scheduled_at);
  const timeStr = matchDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris',
  });

  const pts     = prediction?.points;
  let ptsType: 'exact' | 'result' | 'miss' | null = null;
  if (pts === 3) ptsType = 'exact';
  else if (pts === 1) ptsType = 'result';
  else if (pts === 0) ptsType = 'miss';

  const phaseLabel: Record<string, string> = {
    GROUP_STAGE:   `Groupe ${match.group_id ?? ''}`,
    ROUND_OF_32:   '32èmes de finale',
    ROUND_OF_16:   '8èmes de finale',
    QUARTER_FINALS:'Quarts de finale',
    SEMI_FINALS:   'Demi-finales',
    THIRD_PLACE:   'Petite finale',
    FINAL:         '🏆 FINALE',
  };

  const saveProno = async () => {
    const h = parseInt(homeInput);
    const a = parseInt(awayInput);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      hapticTap();
      toast.error('Entre un score valide');
      return;
    }
    setSaving(true);
    hapticTap();
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: match.id, home_score: h, away_score: a }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      onPredict?.(match.id, h, a);
      hapticSuccess();
      toast.success('🎯 Pronostic sauvegardé !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn(
      'ka-card-hover p-4',
      isLive && 'border-l-4 border-l-emerald-500',
      match.phase === 'FINAL' && 'border-[#C9A84C]/50 shadow-gold animate-glow-pulse'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#5A4E35] font-medium">
          {phaseLabel[match.phase] ?? match.phase}
        </span>
        {isLive ? (
          <span className="ka-badge-live">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-dot" />
            EN DIRECT {match.minute ? `${match.minute}'` : ''}
          </span>
        ) : isFinished ? (
          <span className="text-xs text-[#3A3020]">Terminé</span>
        ) : (
          <div className="flex items-center gap-1 text-xs text-[#5A4E35]">
            <Clock size={11} />{timeStr}
          </div>
        )}
      </div>

      {/* Teams & Score */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-3">
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-3xl leading-none">{match.home_team?.flag_emoji ?? '🏳️'}</span>
          <span className="text-xs font-semibold text-center text-[#E8D5A0] leading-tight">
            {match.home_team?.short_name ?? match.home_team?.name ?? '?'}
          </span>
        </div>

        <div className="flex flex-col items-center">
          {hasScore ? (
            <div className="font-display font-black text-3xl text-[#C9A84C] tracking-tight drop-shadow-[0_0_8px_rgba(201,168,76,0.4)]">
              {match.home_score}–{match.away_score}
            </div>
          ) : (
            <div className="font-display font-bold text-lg text-[#3A3020]">vs</div>
          )}
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-3xl leading-none">{match.away_team?.flag_emoji ?? '🏳️'}</span>
          <span className="text-xs font-semibold text-center text-[#E8D5A0] leading-tight">
            {match.away_team?.short_name ?? match.away_team?.name ?? '?'}
          </span>
        </div>
      </div>

      {/* Venue */}
      <div className="flex items-center justify-center gap-1 text-xs text-[#3A3020] mb-3">
        <MapPin size={10} />{match.stadium}, {match.city}
      </div>

      <div className="ka-divider mb-3" />

      {/* Result + my prediction (finished) */}
      {isFinished && prediction && ptsType && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#5A4E35]">
            Mon prono : <span className="font-semibold text-[#C9A84C]">
              {prediction.home_score}–{prediction.away_score}
            </span>
          </span>
          <span className={cn('text-xs font-semibold', getResultColor(ptsType))}>
            {getResultLabel(ptsType)} · +{pts} pts
          </span>
        </div>
      )}

      {/* Prediction inputs (upcoming) */}
      {canPredict && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5A4E35] flex-shrink-0">Mon prono</span>
          <div className="flex items-center gap-1.5 flex-1">
            <input
              type="number" min="0" max="20"
              inputMode="numeric"
              className="w-10 h-9 text-center bg-[#1A1A1A] border border-[#2A2410] focus:border-[#C9A84C]/60 rounded-lg text-base font-display font-bold text-[#C9A84C] outline-none transition-all"
              value={homeInput}
              onChange={e => { setHomeInput(e.target.value); setSaved(false); }}
              placeholder="–"
            />
            <span className="text-[#3A3020] font-bold text-sm">–</span>
            <input
              type="number" min="0" max="20"
              inputMode="numeric"
              className="w-10 h-9 text-center bg-[#1A1A1A] border border-[#2A2410] focus:border-[#C9A84C]/60 rounded-lg text-base font-display font-bold text-[#C9A84C] outline-none transition-all"
              value={awayInput}
              onChange={e => { setAwayInput(e.target.value); setSaved(false); }}
              placeholder="–"
            />
          </div>
          <button
            onClick={saveProno}
            disabled={saving}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95',
              saved
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'ka-btn-primary'
            )}
          >
            {saving ? '…' : saved ? '✓ Sauvé' : 'Sauver'}
          </button>
        </div>
      )}

      {/* Live + my prediction badge */}
      {isLive && prediction && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#5A4E35]">
            Mon prono : <span className="font-semibold text-[#C9A84C]">
              {prediction.home_score}–{prediction.away_score}
            </span>
          </span>
          <span className="text-xs text-emerald-400 font-medium">En cours…</span>
        </div>
      )}
    </div>
  );
}
