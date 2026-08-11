'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

// 1. УЛУЧШЕННЫЙ ПАРСЕР ДАТ
function parseDate(dateStr) {
  if (!dateStr) return null;
  let cleaned = dateStr.toString().trim().replace(/^"|"$/g, '');
  if (!cleaned || cleaned === '0' || cleaned === '—' || cleaned === '-') return null;

  // DD.MM.YYYY или DD/MM/YYYY
  let match = cleaned.match(/^(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{2,4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    let year = match[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
  return null;
}

// 2. УЛУЧШЕННЫЙ ПАРСЕР ВРЕМЕНИ
function parseTime(timeStr) {
  if (!timeStr) return null;
  let cleaned = timeStr.toString().trim().replace(/^"|"$/g, '');
  if (!cleaned || cleaned === '0' || cleaned === '—' || cleaned === '-') return null;
  
  const match = cleaned.match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}:00` : null;
}

export default function AdminPage() {
  const [supabase] = useState(() => getSupabaseClient());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('tests');
  const [tests, setTests] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsAuthenticated(true);
        loadTests();
      }
    });
  }, [supabase]);

  const loadTests = async () => {
    const { data } = await supabase.from('exams').select('*').order('exam_date', { ascending: true });
    if (data) setTests(data);
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
          reg_start_date: parseDate(cols[3]),
          reg_start_time: parseTime(cols[4]),
          reg_end_date: parseDate(cols[5]),
          reg_end_time: parseTime(cols[6]),
          price: parseFloat(cols[7]) || 0,
          is_active: cols[8] ? cols[8].toLowerCase() === 'true' : true
        };
      });

      const { error } = await supabase.from('exams').insert(newExams);
      if (error) alert('Ошибка загрузки: ' + error.message);
      else { alert('Загружено!'); loadTests(); }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) return <div style={{padding: 50}}>Пожалуйста, авторизуйтесь в Supabase</div>;

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Басқару Панелі</h1>
      <label style={{ cursor: 'pointer', background: '#0284c7', color: 'white', padding: 10, borderRadius: 8 }}>
        📤 Excel/CSV Жүктеу
        <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
      </label>

      <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ padding: 10 }}>Атауы</th>
            <th style={{ padding: 10 }}>Күні</th>
            <th style={{ padding: 10 }}>Уақыты</th>
            <th style={{ padding: 10 }}>Бағасы</th>
          </tr>
        </thead>
        <tbody>
          {tests.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: 10 }}>{t.title}</td>
              <td style={{ padding: 10 }}>{t.exam_date || '—'}</td>
              <td style={{ padding: 10 }}>{t.exam_time ? t.exam_time.slice(0, 5) : '—'}</td>
              <td style={{ padding: 10 }}>{t.price} ₸</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
