'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Убедитесь, что путь верный

export default function TeacherPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkTeacherAccess() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = '/login'; // Или путь к вашей странице входа
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_teacher')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.is_teacher !== true) {
        alert('Сізде бұл парақшаға кіруге рұқсат жоқ!');
        window.location.href = '/dashboard'; // Выкидываем обратно в обычный дашборд
        return;
      }

      setLoading(false);
    }

    checkTeacherAccess();
  }, []);

  if (loading) return <div>Жүктелуде...</div>;

  return (
    <div style={{ padding: '40px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff' }}>
      <h1>Мұғалімнің арнайы панелі</h1>
      <p>Сәлеметсіз бе, Мұғалім! Мұнда сіз оқушылардың тізімін және тест нәтижелерін басқара аласыз.</p>
      {/* Сюда вставляем таблицу учителей */}
    </div>
  );
}
