import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/calendar';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert profile on first login
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email ?? '',
        username: data.user.user_metadata?.full_name ??
          data.user.email?.split('@')[0] ??
          `joueur_${data.user.id.slice(0, 6)}`,
        avatar_url: data.user.user_metadata?.avatar_url ?? null,
        total_points: 0,
        exact_scores: 0,
        correct_results: 0,
        total_predictions: 0,
      }, { onConflict: 'id', ignoreDuplicates: true });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
