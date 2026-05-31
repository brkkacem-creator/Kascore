'use client';
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const sync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sync', {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ''}` },
      });
      const data = await res.json();
      if (data.success) toast.success(`✓ ${data.updatedMatches} matchs mis à jour`);
      else toast.error('Erreur sync');
    } catch { toast.error('Erreur réseau'); }
    finally { setLoading(false); }
  };
  return (
    <button onClick={sync} disabled={loading} className="ka-btn-primary flex items-center gap-2">
      <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
      {loading ? 'Sync…' : 'Sync API'}
    </button>
  );
}
