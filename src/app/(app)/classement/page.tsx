import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';

export const revalidate = 60;

export default async function ClassementPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: leaderboardRaw } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(100);

  const leaderboard = (leaderboardRaw ?? []) as any[];

  const myRank = leaderboard.findIndex(e => e.user_id === user?.id) ?? -1;

  const medals = ['🥇', '🥈', '🥉'];
  const avatarColors = [
    'from-amber-500 to-yellow-600',
    'from-blue-500 to-blue-700',
    'from-emerald-500 to-green-700',
    'from-purple-500 to-purple-700',
    'from-rose-500 to-red-700',
    'from-teal-500 to-cyan-700',
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-[#E8D5A0] mb-1">Classement</h1>
        <p className="text-[#5A4E35] text-sm">{leaderboard.length ?? 0} participants</p>
      </div>

      {/* My rank banner */}
      {myRank >= 0 && (
        <div className="relative overflow-hidden rounded-2xl p-5 mb-6 border border-[#C9A84C]/40 shadow-gold"
             style={{ background: 'linear-gradient(135deg, #1A1500 0%, #2A2000 50%, #1A1500 100%)' }}>
          <div className="absolute inset-0 opacity-10"
               style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C9A84C 0%, transparent 50%)' }} />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-[#8B7030] text-xs mb-1 uppercase tracking-wider">Mon classement</div>
              <div className="font-display font-black text-5xl text-gold-gradient">
                #{myRank + 1}
              </div>
            </div>
            <Image src="/logo.png" alt="" width={48} height={48} className="opacity-30" />
            <div className="text-right">
              <div className="text-[#8B7030] text-xs mb-1 uppercase tracking-wider">Points</div>
              <div className="font-display font-black text-5xl text-[#C9A84C]">
                {leaderboard[myRank]?.total_points ?? 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Podium top 3 */}
      {(leaderboard.length ?? 0) >= 3 && (
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[1, 0, 2].map((idx) => {
            const entry = leaderboard![idx];
            const rank = idx + 1;
            const isFirst = idx === 0;
            return (
              <div key={entry.user_id}
                   className={`ka-card p-3 text-center flex flex-col items-center gap-1.5 ${isFirst ? 'border-[#C9A84C]/50 shadow-gold' : ''}`}
                   style={isFirst ? { background: 'linear-gradient(180deg, #1A1500 0%, #111111 100%)' } : {}}>
                <div className="text-2xl">{medals[idx]}</div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white bg-gradient-to-br ${avatarColors[idx % avatarColors.length]}`}>
                  {entry.username?.slice(0, 1).toUpperCase() ?? '?'}
                </div>
                <div className="text-xs font-medium text-[#E8D5A0] truncate w-full text-center">
                  {entry.username?.split(' ')[0]}
                </div>
                <div className={`font-display font-black text-lg ${isFirst ? 'text-[#C9A84C]' : 'text-[#8B7030]'}`}>
                  {entry.total_points}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="ka-divider mb-4" />

      {/* Full leaderboard */}
      <div className="flex flex-col gap-2">
        {(leaderboard).map((entry, i) => {
          const isMe = entry.user_id === user?.id;
          const colorIdx = (entry.username?.charCodeAt(0) ?? 0) % avatarColors.length;

          return (
            <div key={entry.user_id}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                   isMe
                     ? 'bg-[#1A1500] border-[#C9A84C]/40'
                     : 'bg-[#111111] border-[#2A2410] hover:border-[#C9A84C]/20'
                 }`}>
              {/* Rank */}
              <div className="w-8 text-center font-display font-black text-lg text-[#5A4E35]">
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>

              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black bg-gradient-to-br ${avatarColors[colorIdx]} flex-shrink-0`}>
                {entry.username?.slice(0, 1).toUpperCase() ?? '?'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-[#E8D5A0] truncate">
                  {entry.username ?? 'Joueur'}
                  {isMe && <span className="text-[#C9A84C] text-xs ml-1">(moi)</span>}
                </div>
                <div className="text-xs text-[#3A3020]">
                  {entry.total_predictions} pronos · {entry.exact_scores} exacts
                </div>
              </div>

              {/* Points */}
              <div className={`font-display font-black text-xl ${isMe ? 'text-[#C9A84C]' : 'text-[#8B7030]'}`}>
                {entry.total_points}
              </div>
            </div>
          );
        })}

        {(leaderboard.length ?? 0) === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-[#5A4E35] font-medium">Aucun participant encore</p>
            <p className="text-[#3A3020] text-sm mt-1">Commence par pronostiquer !</p>
          </div>
        )}
      </div>
    </div>
  );
}
