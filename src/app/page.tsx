import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AuthButton } from '@/components/ui/AuthButton';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { login?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/calendar');

  return (
    <main className="min-h-screen hero-gradient flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 relative z-10">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Kascore" width={42} height={42} className="rounded-xl" />
          <span className="font-display font-black text-2xl text-gold-gradient tracking-tight">
            Kascore
          </span>
        </div>
        <AuthButton showLogin={!!searchParams.login} />
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 relative z-10">
        {/* Logo central avec anneau */}
        <div className="relative mb-10">
          {/* Dotted ring */}
          <div className="absolute inset-0 rounded-full animate-spin-slow opacity-40"
               style={{
                 background: 'none',
                 border: '2px dashed rgba(201,168,76,0.4)',
                 borderRadius: '50%',
                 width: '200px',
                 height: '200px',
                 top: '-20px',
                 left: '-20px',
               }} />
          <div className="relative w-40 h-40 mx-auto">
            <Image
              src="/logo.png"
              alt="Kascore Logo"
              fill
              className="object-contain drop-shadow-[0_0_40px_rgba(201,168,76,0.5)]"
            />
          </div>
        </div>

        {/* Live pill */}
        <div className="inline-flex items-center gap-2 glass-dark text-[#C9A84C] text-sm font-medium rounded-full px-4 py-2 mb-6 shadow-gold">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-dot" />
          Coupe du Monde FIFA 2026 · 104 matchs
        </div>

        <h1 className="font-display font-black text-5xl md:text-7xl leading-none tracking-tight mb-4">
          <span className="text-[#E8D5A0]">Pronostique.</span><br />
          <span className="text-gold-gradient">Affronte.</span><br />
          <span className="text-[#E8D5A0]">Gagne.</span>
        </h1>

        <p className="text-[#8B7030] text-lg max-w-md mb-10">
          Suivez chaque match en temps réel, pronostique les scores
          et montez dans le classement.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <AuthButton variant="primary" />
          <a
            href="/calendar"
            className="glass-dark text-[#C9A84C] font-medium rounded-2xl px-8 py-4 text-base hover:bg-[#C9A84C]/10 transition-all border border-[#C9A84C]/30"
          >
            Voir le calendrier →
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-sm">
          {[
            { n: '48',   l: 'Équipes' },
            { n: '104',  l: 'Matchs' },
            { n: '3 pts',l: 'Score exact' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <div className="font-display font-black text-3xl text-gold-gradient">{s.n}</div>
              <div className="text-[#5A4E35] text-sm mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[#3A3020] text-xs pb-6 relative z-10">
        🇺🇸 🇨🇦 🇲🇽 · 11 juin – 19 juillet 2026
      </footer>

      {/* Background glow accents */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-[#C9A84C]/3 rounded-full blur-3xl pointer-events-none" />
    </main>
  );
}
