'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  let rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }

  return createClient(rawUrl, rawKey);
}

export default function TeacherPage() {
  const [supabase] = useState(() => getSupabaseClient());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkTeacherAccess() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = '/';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_teacher')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.is_teacher !== true) {
        alert('Сізде бұл парақшаға кіруге рұқсат жоқ!');
        window.location.href = '/dashboard';
        return;
      }

      setLoading(false);
    }

    checkTeacherAccess();
  }, [supabase]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '18px', fontWeight: 'bold', fontFamily: 'system-ui, sans-serif' }}>
        Жүктелуде...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>Мұғалімнің арнайы панелі</h1>
      <p style={{ color: '#94a3b8' }}>Сәлеметсіз бе! Бұл бет тек мұғалімдерге қолжетімді.</p>
    </div>
  );
}
