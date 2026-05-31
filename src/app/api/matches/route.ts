import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phase = searchParams.get('phase');
  const group = searchParams.get('group');
  const status = searchParams.get('status');

  const supabase = createClient();
  let query = supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .order('scheduled_at', { ascending: true });

  if (phase) query = query.eq('phase', phase);
  if (group) query = query.eq('group_id', group);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
