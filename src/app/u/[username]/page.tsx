import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('username', params.username).single();

  if (!profile) notFound();

  const { data: leaderboard } = await supabase
    .from('leaderboard').select('rank').eq('user_id', profile.id).single();

  const accuracy = profile.total_predictions > 0
    ? Math.round(((profile.exact_scores + profile.correct_results) / profile.total_predictions) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl p-8 text-center mb-4 border border-[#C9A84C]/40 shadow-gold"
             style={{ background: 'linear-gradient(135deg, #1A1500 0%, #2A2000 50%, #1A1500 100%)' }}>
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <Image src="/logo.png" alt="" width={200} height={200} />
          </div>
          <div className="relative">
            <div className="w-20 h-20 rounded-full gold-gradient-bg flex items-center justify-center text-[#0A0A0A] font-display font-black text-3xl mx-auto mb-4 shadow-gold">
              {profile.username.slice(0, 1).toUpperCase()}
            </div>
            <h1 className="font-display font-black text-2xl text-[#E8D5A0] mb-1">{profile.username}</h1>
            <p className="text-[#8B7030] text-sm mb-6">🏆 Rang #{leaderboard?.rank ?? '—'} · Kascore 2026</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { n: profile.total_points, l: 'Points' },
                { n: profile.total_predictions, l: 'Pronos' },
                { n: `${accuracy}%`, l: 'Précision' },
              ].map(s => (
                <div key={s.l} className="bg-black/40 rounded-2xl p-3 border border-[#C9A84C]/10">
                  <div className="font-display font-black text-2xl text-[#C9A84C]">{s.n}</div>
                  <div className="text-[#5A4E35] text-xs mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <a href="/" className="block text-center ka-btn-primary px-6 py-4 rounded-2xl text-base w-full">
          Rejoindre Kascore →
        </a>
        <div className="flex justify-center mt-4">
          <Image src="/logo.png" alt="Kascore" width={28} height={28} className="opacity-30" />
        </div>
      </div>
    </main>
  );
}
