'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Target, Trophy, BarChart2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/calendar',    label: 'Calendrier', icon: Calendar },
  { href: '/pronostics',  label: 'Pronos',     icon: Target },
  { href: '/classement',  label: 'Classement', icon: Trophy },
  { href: '/stats',       label: 'Stats',      icon: BarChart2 },
  { href: '/profil',      label: 'Profil',     icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#C9A84C]/20 md:hidden">
      <div className="flex justify-around max-w-2xl mx-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2.5 px-3 text-xs font-medium transition-all min-w-0 relative',
                active ? 'text-[#C9A84C]' : 'text-[#5A4E35] hover:text-[#8B7030]'
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 gold-gradient-bg rounded-full" />
              )}
              <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
