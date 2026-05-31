'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LogOut, User, Bell, Share2, Moon, Sun, ChevronRight } from 'lucide-react';

export default function ProfilPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [editing, setEditing] = useState(false);
  const [dark, setDark] = useState(true); // app is always dark now

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          const d = data as any;
          setProfile(d);
          setUsername(d?.username ?? '');
        });
    });
  }, []);

  const saveUsername = async () => {
    if (!username.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ username: username.trim() }).eq('id', user.id);
    setEditing(false);
    toast.success('Profil mis à jour !', {
      style: { background: '#111111', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const shareLink = () => {
    const url = `${window.location.origin}/u/${profile?.username ?? profile?.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    toast.success('Lien copié !', {
      style: { background: '#111111', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' },
    });
  };

  if (!profile) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const accuracy = profile.total_predictions > 0
    ? Math.round(((profile.exact_scores + profile.correct_results) / profile.total_predictions) * 100)
    : 0;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-[#E8D5A0]">Mon profil</h1>
      </div>

      {/* Profile hero card */}
      <div className="relative overflow-hidden rounded-2xl p-6 mb-5 border border-[#C9A84C]/40 shadow-gold"
           style={{ background: 'linear-gradient(135deg, #1A1500 0%, #2A2000 50%, #1A1500 100%)' }}>
        {/* Background logo watermark */}
        <div className="absolute right-4 top-4 opacity-10">
          <Image src="/logo.png" alt="" width={80} height={80} />
        </div>

        <div className="relative flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full gold-gradient-bg flex items-center justify-center text-[#0A0A0A] font-display font-black text-2xl shadow-gold">
            {profile.username?.slice(0, 1).toUpperCase() ?? '?'}
          </div>
          <div>
            <div className="font-display font-bold text-xl text-[#E8D5A0]">{profile.username}</div>
            <div className="text-[#8B7030] text-sm mt-0.5">
              🏆 Rang #{profile.rank ?? '—'} · Kascore 2026
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { n: profile.total_points ?? 0,      l: 'Points' },
            { n: profile.total_predictions ?? 0, l: 'Pronos' },
            { n: `${accuracy}%`,                 l: 'Précision' },
          ].map(s => (
            <div key={s.l} className="bg-black/30 rounded-xl p-3 text-center border border-[#C9A84C]/10">
              <div className="font-display font-black text-2xl text-[#C9A84C]">{s.n}</div>
              <div className="text-[#5A4E35] text-xs mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Accuracy breakdown */}
      <div className="ka-card p-5 mb-4">
        <div className="text-sm font-medium text-[#E8D5A0] mb-4">Précision par type</div>
        {[
          { l: 'Score exact',  n: profile.exact_scores ?? 0,    color: 'bg-emerald-500', pct: profile.total_predictions > 0 ? (profile.exact_scores / profile.total_predictions) * 100 : 0 },
          { l: 'Bon résultat', n: profile.correct_results ?? 0, color: 'bg-amber-400',   pct: profile.total_predictions > 0 ? (profile.correct_results / profile.total_predictions) * 100 : 0 },
        ].map(row => (
          <div key={row.l} className="flex items-center gap-3 mb-3 last:mb-0">
            <span className="text-xs text-[#5A4E35] w-24 flex-shrink-0">{row.l}</span>
            <div className="flex-1 h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${row.color} transition-all duration-700`}
                   style={{ width: `${row.pct}%` }} />
            </div>
            <span className="text-xs font-medium text-[#C9A84C] w-4 text-right">{row.n}</span>
          </div>
        ))}
      </div>

      {/* Edit username */}
      <div className="ka-card p-5 mb-4">
        <div className="text-sm font-medium text-[#E8D5A0] mb-3 flex items-center gap-2">
          <User size={15} className="text-[#C9A84C]" /> Nom d'utilisateur
        </div>
        {editing ? (
          <div className="flex gap-2">
            <input
              className="ka-input flex-1"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveUsername()}
              autoFocus
            />
            <button className="ka-btn-primary" onClick={saveUsername}>Sauver</button>
            <button className="ka-btn-ghost px-3" onClick={() => setEditing(false)}>✕</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-[#8B7030]">{profile.username}</span>
            <button className="text-xs text-[#C9A84C] hover:underline" onClick={() => setEditing(true)}>
              Modifier
            </button>
          </div>
        )}
      </div>

      {/* Settings actions */}
      <div className="ka-card overflow-hidden mb-4">
        {[
          { icon: Bell,   label: 'Notifications',       action: () => toast('Bientôt disponible !') },
          { icon: Share2, label: 'Partager mon lien',   action: shareLink },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm hover:bg-[#1A1500] transition-colors border-b border-[#2A2410] last:border-0 text-left"
          >
            <Icon size={16} className="text-[#C9A84C]" />
            <span className="flex-1 text-[#E8D5A0]">{label}</span>
            <ChevronRight size={14} className="text-[#3A3020]" />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 px-5 py-4 text-sm text-red-400 ka-card hover:bg-red-950/20 hover:border-red-900/40 transition-all"
      >
        <LogOut size={16} /> Déconnexion
      </button>
    </div>
  );
}
