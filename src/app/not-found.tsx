import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-center p-6">
      <Image src="/logo.png" alt="Kascore" width={80} height={80} className="mb-6 opacity-60" />
      <h1 className="font-display font-black text-6xl text-[#C9A84C] mb-2">404</h1>
      <p className="text-[#5A4E35] text-lg mb-8">Cette page est hors-jeu.</p>
      <Link href="/calendar"
            className="ka-btn-primary px-8 py-4 text-base rounded-2xl">
        Retour au calendrier
      </Link>
    </main>
  );
}
