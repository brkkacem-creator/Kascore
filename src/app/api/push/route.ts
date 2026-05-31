import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/push — save push token
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token, platform } = await request.json();
  if (!token || !platform) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  await supabase.from('push_tokens').upsert(
    { user_id: user.id, token, platform, last_seen: new Date().toISOString() },
    { onConflict: 'token' }
  );

  return NextResponse.json({ success: true });
}

// GET /api/push — get unread notifications
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .is('read_at', null)
    .order('sent_at', { ascending: false })
    .limit(20);

  return NextResponse.json(data ?? []);
}

// PATCH /api/push — mark notifications as read
export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids } = await request.json();
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .in('id', ids ?? [])
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
