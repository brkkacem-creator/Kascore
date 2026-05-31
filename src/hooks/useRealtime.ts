'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Subscribes to Supabase Realtime for match score updates.
 * Calls onUpdate(matchId, homeScore, awayScore) whenever a match row changes.
 */
export function useRealtimeMatches(
  onUpdate: (matchId: string, homeScore: number | null, awayScore: number | null, status: string) => void
) {
  const supabase = createClient();
  const cbRef = useRef(onUpdate);
  cbRef.current = onUpdate;

  useEffect(() => {
    const channel = supabase
      .channel('kascore-matches')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches' },
        (payload) => {
          const m = payload.new as any;
          cbRef.current(m.id, m.home_score, m.away_score, m.status);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
}

/**
 * Subscribes to prediction updates for the current user's leaderboard position.
 */
export function useRealtimeLeaderboard(onUpdate: () => void) {
  const supabase = createClient();
  const cbRef = useRef(onUpdate);
  cbRef.current = onUpdate;

  useEffect(() => {
    const channel = supabase
      .channel('kascore-leaderboard')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        () => cbRef.current()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
}
