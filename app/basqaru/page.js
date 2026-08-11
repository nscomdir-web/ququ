'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  let rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
  if (!rawUrl.startsWith('http')) rawUrl = `https://${rawUrl}`;
  return createClient(rawUrl, rawKey);
}

// ... (функции parseDate, parseTime остаются теми же)

export default function AdminPage() {
  const [supabase] = useState(() => getSupabaseClient());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('tests');
  const [tests, setTests] = useState([]);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        loadData();
      }
    }
    checkAuth();
  }, [supabase]);

  const loadData = async () => {
    const { data } = await supabase.from('exams').select('*');
    if (data) setTests(data);
  };

  const toggleActive = async (id, currentStatus) => {
    await supabase.from('exams').update({ is_active: !currentStatus }).eq('id', id);
    loadData();
  };

  if (!isAuthenticated) return (/* ваш код логина */);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'minmax(200px, 260px) 1fr', // Авто-адаптация колонок
      minHeight: '100vh',
      gap: '0'
    }}>
      {/* Стили для адаптации через media query внутри JS */}
      <style>{`
        @media (max-width: 768px) {
          div { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Меню */}
      <aside style={{ backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '20px' }}>
        <h2 style={{ color: '#0284c7', fontSize: '20px' }}>QUQU Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          {['users', 'students', 'tests', 'results'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={menuBtn(activeTab === tab)}>
              {tab.toUpperCase()}
            </button>
          ))}
        </nav>
      </aside>

      {/* Контент */}
      <main style={{ padding: '20px', backgroundColor: '#f8fafc', overflowX: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}> {/* Это не даст таблице сломать экран */}
          <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px' }}>Название</th>
                <th style={{ padding: '10px' }}>Активен</th>
                <th style={{ padding: '10px' }}>Удалить</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px' }}>{t.title}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <input type="checkbox" checked={t.is_active} onChange={() => toggleActive(t.id, t.is_active)} />
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button onClick={() => {/* delete */}}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

const menuBtn = (active) => ({
  padding: '10px', 
  border: 'none', 
  background: active ? '#e0f2fe' : 'none',
  textAlign: 'left',
  cursor: 'pointer'
});
