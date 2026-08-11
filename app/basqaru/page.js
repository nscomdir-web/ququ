'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

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
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
  return null;
}

function parseTime(timeStr) {
  if (!timeStr) return null;
  let cleaned = timeStr.toString().trim().replace(/^"|"$/g, '');
  if (!cleaned || cleaned === '0' || cleaned === '—' || cleaned === '-') return null;
  const match = cleaned.match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}:00` : null;
}

export default function AdminPage() {
  const [supabase] = useState(() => getSupabaseClient());
  const [tests, setTests] = useState([]);

  useEffect(() => { loadTests(); }, [supabase]);

  const loadTests = async () => {
    const { data } = await supabase.from('exams').select('*').order('exam_date', { ascending: true });
    if (data) setTests(data);
  };

  // ФУНКЦИЯ ОБНОВЛЕНИЯ СТАТУСА
  const toggleActive = async (id, currentStatus) => {
    const { error } = await supabase
      .from('exams')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (!error) loadTests();
    else alert('Қате: ' + error.message);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const lines = e.target.result.split('\n').filter(Boolean);
      const delimiter = lines[0].includes(';') ? ';' : ',';
      const newExams = lines.slice(1).map(line => {
        const cols = line.split(delimiter).map(c => c.trim());
        return {
          title: cols[0],
          exam_date: parseDate(cols[1]),
          exam_time: parseTime(cols[2]),
          price: parseFloat(cols[7]) || 0,
          is_active: cols[8] ? cols[8].toLowerCase() === 'true' : true
        };
      });
      const { error } = await supabase.from('exams').insert(newExams);
      if (error) alert('Ошибка: ' + error.message);
      else { alert('Жүктелді!'); loadTests(); }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Басқару Панелі</h1>
      <label style={{ cursor: 'pointer', background: '#0284c7', color: 'white', padding: 10, borderRadius: 8, fontWeight: 'bold' }}>
        📤 Excel/CSV Жүктеу
        <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
      </label>

      <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
            <th style={{ padding: 12 }}>Атауы</th>
            <th style={{ padding: 12 }}>Күні</th>
            <th style={{ padding: 12 }}>Бағасы</th>
            <th style={{ padding: 12 }}>Активті</th>
          </tr>
        </thead>
        <tbody>
          {tests.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: 12 }}>{t.title}</td>
              <td style={{ padding: 12 }}>{t.exam_date || '—'}</td>
              <td style={{ padding: 12 }}>{t.price} ₸</td>
              <td style={{ padding: 12 }}>
                {/* ЧЕКБОКС */}
                <input 
                  type="checkbox" 
                  checked={t.is_active} 
                  onChange={() => toggleActive(t.id, t.is_active)}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
