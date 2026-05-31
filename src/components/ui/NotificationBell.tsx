'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Notif {
  id: string;
  title: string;
  body: string;
  sent_at: string;
  read_at: string | null;
  data?: { url?: string };
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifs, setNotifs]   = useState<Notif[]>([]);
  const [open, setOpen]       = useState(false);
  const supabase              = createClient();
  const unread                = notifs.filter(n => !n.read_at).length;

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetch('/api/push')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setNotifs(data));

    // Realtime subscription
    const channel = supabase
      .channel('notifs-' + userId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifs(prev => [payload.new as Notif, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const markRead = async () => {
    const unreadIds = notifs.filter(n => !n.read_at).map(n => n.id);
    if (!unreadIds.length) return;
    await fetch('/api/push', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: unreadIds }),
    });
    setNotifs(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  };

  const toggle = () => {
    if (!open && unread > 0) markRead();
    setOpen(o => !o);
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative w-8 h-8 flex items-center justify-center rounded-full text-[#5A4E35] hover:bg-[#1A1A1A] transition-colors"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 gold-gradient-bg rounded-full text-[#0A0A0A] text-[10px] font-black flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 bg-[#111111] border border-[#2A2410] rounded-2xl shadow-gold overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2410]">
              <span className="font-display font-bold text-sm text-[#E8D5A0]">Notifications</span>
              <span className="text-xs text-[#5A4E35]">{notifs.length} au total</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="text-center py-8 text-[#3A3020] text-sm">
                  <Bell size={24} className="mx-auto mb-2 opacity-30" />
                  Aucune notification
                </div>
              ) : (
                notifs.slice(0, 15).map(n => (
                  <a
                    key={n.id}
                    href={n.data?.url ?? '/pronostics'}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'block px-4 py-3 border-b border-[#1A1A1A] last:border-0 hover:bg-[#1A1A1A] transition-colors',
                      !n.read_at && 'bg-[#1A1500]'
                    )}
                  >
                    <div className="text-sm font-medium text-[#E8D5A0] mb-0.5">{n.title}</div>
                    <div className="text-xs text-[#5A4E35]">{n.body}</div>
                    <div className="text-xs text-[#3A3020] mt-1">
                      {new Date(n.sent_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
