import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { calculatePoints } from '@/lib/scoring';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { match_id, home_score, away_score } = body;

  if (typeof home_score !== 'number' || typeof away_score !== 'number') {
    return NextResponse.json({ error: 'Invalid scores' }, { status: 400 });
  }

  // Get match to check if it's still open and if it has a result
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', match_id)
    .single();

  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  if (match.status === 'finished') {
    return NextResponse.json({ error: 'Match already finished' }, { status: 400 });
  }

  // Calculate points if match has result (shouldn't happen for open matches, but just in case)
  let points: number | null = null;
  if (match.home_score !== null && match.away_score !== null) {
    const result = calculatePoints(home_score, away_score, match.home_score, match.away_score);
    points = result.points;
  }

  const { data: existing } = await supabase
    .from('predictions')
    .select('id')
    .eq('user_id', user.id)
    .eq('match_id', match_id)
    .single();

  if (existing) {
    await supabase
      .from('predictions')
      .update({ home_score, away_score, points, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase.from('predictions').insert({
      user_id: user.id,
      match_id,
      home_score,
      away_score,
      points,
    });
  }

  return NextResponse.json({ success: true, points });
}
