'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

// Парсеры
function parseDate(dateStr) {
  if (!dateStr) return null;
  let cleaned = dateStr.toString().trim().replace(/^"|"$/g, '');
  if (!cleaned || cleaned === '0' || cleaned === '—' || cleaned === '-') return null;
  let match = cleaned.match(/^(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{2,4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    let year = match[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }
  return null;
}

export default function AdminPage() {
  const [supabase] = useState(() => getSupabaseClient());
  const [tests, setTests] = useState([]);
  const [activeTab, setActiveTab] = useState('tests');

  useEffect(() => { loadTests(); }, []);

  const loadTests = async () => {
    const { data } = await supabase.from('exams').select('*').order('exam_date', { ascending: true });
    if (data) setTests(data);
  };

  const toggleActive = async (id, currentStatus) => {
    await supabase.from('exams').update({ is_active: !currentStatus }).eq('id', id);
    loadTests();
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7', marginBottom: '32px' }}>QUQU<span style={{ color: '#f43f5e' }}>.</span> admin</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setActiveTab('tests')} style={menuBtn(activeTab === 'tests')}>📝 Тесттер</button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>Тесттер тізімі</h2>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={thStyle}>Атауы</th>
                <th style={thStyle}>Күні</th>
                <th style={thStyle}>Бағасы</th>
                <th style={thStyle}>Активті</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{t.title}</td>
                  <td style={tdStyle}>{t.exam_date || '—'}</td>
                  <td style={tdStyle}>{t.price} ₸</td>
                  <td style={tdStyle}>
                    <input 
                      type="checkbox" 
                      checked={t.is_active} 
                      onChange={() => toggleActive(t.id, t.is_active)}
                      style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                    />
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

// Стили
const thStyle = { padding: '14px 18px', color: '#64748b', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' };
const tdStyle = { padding: '16px 18px', color: '#334155' };
const menuBtn = (active) => ({ 
  width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', border: 'none', 
  backgroundColor: active ? '#e0f2fe' : 'transparent', color: active ? '#0369a1' : '#64748b', 
  fontWeight: '700', cursor: 'pointer' 
});
