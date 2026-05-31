import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { NotificationBell } from '@/components/ui/NotificationBell';

interface Props {
  profile: { username?: string; avatar_url?: string; total_points?: number } | null;
  userId?: string;
}

export function Navbar({ profile, userId }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#C9A84C]/15">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">

        {/* Logo */}
        <Link href="/calendar" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Kascore" width={34} height={34} className="rounded-lg" />
          <span className="font-display font-black text-xl tracking-tight text-gold-gradient">
            Kascore
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {profile && (
            <div className="ka-badge-gold hidden sm:flex text-xs">
              ⭐ {profile.total_points ?? 0} pts
            </div>
          )}

          {/* Notification bell */}
          {userId && <NotificationBell userId={userId} />}

          {/* Avatar */}
          {profile && (
            <Link href="/profil">
              <div className="w-8 h-8 rounded-full gold-gradient-bg flex items-center justify-center text-[#0A0A0A] text-xs font-black shadow-gold">
                {profile.username?.slice(0, 1).toUpperCase() ?? '?'}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
