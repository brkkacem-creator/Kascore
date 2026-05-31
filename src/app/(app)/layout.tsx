import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, total_points')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <Navbar profile={profile} userId={user.id} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pb-24 pt-4 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
