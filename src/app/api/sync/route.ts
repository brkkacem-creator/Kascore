import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { fetchLiveMatches, fetchTodayMatches, mapAPIStatus, mapAPIPhase } from '@/lib/football-api';
import { calculatePoints } from '@/lib/scoring';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Fetch live + today matches from football API
    const [liveMatches, todayMatches] = await Promise.all([
      fetchLiveMatches(),
      fetchTodayMatches(),
    ]);

    const allMatches = [...liveMatches, ...todayMatches];
    const seen = new Set<number>();
    const uniqueMatches = allMatches.filter(m => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    let updatedCount = 0;
    const pointsRecalculated: string[] = [];

    for (const apiMatch of uniqueMatches) {
      const status = mapAPIStatus(apiMatch.status);
      const homeScore = apiMatch.score.fullTime.home;
      const awayScore = apiMatch.score.fullTime.away;

      // Find match in DB by api_id
      const { data: dbMatch } = await supabase
        .from('matches')
        .select('id, status, home_score, away_score')
        .eq('api_id', apiMatch.id)
        .single();

      if (!dbMatch) continue;

      // Only update if something changed
      if (dbMatch.status === status && dbMatch.home_score === homeScore && dbMatch.away_score === awayScore) {
        continue;
      }

      await supabase
        .from('matches')
        .update({
          status,
          home_score: homeScore,
          away_score: awayScore,
          minute: apiMatch.minute ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dbMatch.id);

      updatedCount++;

      // If match just finished, recalculate all predictions for this match
      if (status === 'finished' && homeScore !== null && awayScore !== null) {
        const { data: preds } = await supabase
          .from('predictions')
          .select('id, user_id, home_score, away_score')
          .eq('match_id', dbMatch.id);

        for (const pred of preds ?? []) {
          const result = calculatePoints(pred.home_score, pred.away_score, homeScore, awayScore);
          await supabase
            .from('predictions')
            .update({ points: result.points })
            .eq('id', pred.id);

          pointsRecalculated.push(pred.user_id);
        }

        // Refresh user points aggregates
        const uniqueUsers = Array.from(new Set(pointsRecalculated));
        for (const userId of uniqueUsers) {
          const { data: userPreds } = await supabase
            .from('predictions')
            .select('points')
            .eq('user_id', userId)
            .not('points', 'is', null);

          const totalPoints = userPreds?.reduce((s, p) => s + (p.points ?? 0), 0) ?? 0;
          const exactScores = userPreds?.filter(p => p.points === 3).length ?? 0;
          const correctResults = userPreds?.filter(p => p.points === 1).length ?? 0;

          await supabase
            .from('profiles')
            .update({
              total_points: totalPoints,
              exact_scores: exactScores,
              correct_results: correctResults,
              total_predictions: userPreds?.length ?? 0,
            })
            .eq('id', userId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      updatedMatches: updatedCount,
      recalculatedUsers: Array.from(new Set(pointsRecalculated)).length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Sync error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
