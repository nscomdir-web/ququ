'use client';
import { useState, useEffect } from 'react';
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

export default function Home() {
  const [supabase] = useState(() => getSupabaseClient());
  const [exams, setExams] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'login' | 'register' | null

  // Данные для таблицы (если база данных пустая)
  const defaultExams = [
    { id: 1, title: 'Тест 1', examDate: '10.10.2026', startTime: '10:00', regStart: '01.09.2026', regEnd: '05.10.2026' },
    { id: 2, title: 'Тест 2', examDate: '15.10.2026', startTime: '11:00', regStart: '01.09.2026', regEnd: '10.10.2026' },
    { id: 3, title: 'Тест 3', examDate: '20.10.2026', startTime: '12:00', regStart: '05.09.2026', regEnd: '15.10.2026' },
  ];

  useEffect(() => {
    async function fetchExams() {
      const { data } = await supabase.from('exams').select('*');
      if (data && data.length > 0) {
        setExams(data);
      } else {
        setExams(defaultExams);
      }
    }
    fetchExams();
  }, [supabase]);

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Шапка с логотипом QUQU */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '1px', color: '#38bdf8' }}>
          QUQU<span style={{ color: '#f43f5e' }}>.</span>
        </div>
        
        <nav style={{ display: 'flex', gap: '30px', fontSize: '14px', textTransform: 'uppercase', fontWeight: '600' }}>
          <a href="#" style={{ color: '#38bdf8', textDecoration: 'none' }}>Басты бет</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Біз туралы</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Көмек</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Байланыс</a>
        </nav>
      </header>

      {/* Верхний баннер и 2 кнопки действий */}
      <section style={{ maxWidth: '1200px', margin: '40px auto 20px auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Тестілеу орталығына қош келдіңіздер
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>
            Жүйеге тіркеліңіз немесе жеке кабинетке кіріңіз
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => setActiveModal('register')}
            style={{ ...btnBase, backgroundColor: '#38bdf8', color: '#0f172a' }}
          >
            👤 ЖАҢА ПАЙДАЛАНУШЫ
          </button>
          <button 
            onClick={() => setActiveModal('login')}
            style={{ ...btnBase, backgroundColor: '#6366f1', color: '#fff' }}
          >
            🔒 ЖЕКЕ КАБИНЕТКЕ КІРУ
          </button>
        </div>
      </section>

      {/* Таблица на 6 колонок */}
      <main style={{ maxWidth: '1200px', margin: '30px auto 60px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '20px', textTransform: 'uppercase', marginBottom: '20px', color: '#f8fafc', fontWeight: '700' }}>
            Қолжетімді тесттер тізімі
          </h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#38bdf8', borderBottom: '2px solid #334155' }}>
                <th style={thStyle}>№</th>
                <th style={thStyle}>ТЕСТ АТАУЫ</th>
                <th style={thStyle}>ӨТКІЗІЛЕТІН КҮНІ</th>
                <th style={thStyle}>БАСТАЛУ УАҚЫТЫ</th>
                <th style={thStyle}>ТІРКЕЛУДІҢ БАСТАЛУЫ</th>
                <th style={thStyle}>ТІРКЕЛУДІҢ АЯҚТАЛУЫ</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #334155', backgroundColor: index % 2 === 0 ? '#1e293b' : '#0f172a' }}>
                  <td style={tdStyle}>{index + 1}.</td>
                  <td style={{ ...tdStyle, fontWeight: '600', color: '#f8fafc' }}>{item.title}</td>
                  <td style={tdStyle}>{item.examDate || item.exam_date}</td>
                  <td style={tdStyle}>{item.startTime || item.start_time}</td>
                  <td style={tdStyle}>{item.regStart || item.reg_start}</td>
                  <td style={tdStyle}>{item.regEnd || item.reg_end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Модальные окна */}
      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>
                {activeModal === 'login' ? 'Жүйеге кіру' : 'Тіркелу'}
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeModal === 'register' && <input placeholder="Аты-жөніңіз" style={inputStyle} />}
              <input placeholder="Телефон / Email" style={inputStyle} />
              <input type="password" placeholder="Құпия сөз" style={inputStyle} />
              <button type="button" style={{ ...btnBase, backgroundColor: '#38bdf8', color: '#0f172a', marginTop: '10px', width: '100%', justifyContent: 'center' }}>
                {activeModal === 'login' ? 'Кіру' : 'Тіркелуді аяқтау'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const btnBase = {
  padding: '14px 24px',
  borderRadius: '10px',
  border: 'none',
  fontWeight: '700',
  fontSize: '14px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
};

const thStyle = {
  padding: '16px',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.5px'
};

const tdStyle = {
  padding: '16px',
  color: '#cbd5e1'
};

const inputStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  padding: '12px 16px',
  borderRadius: '8px',
  color: '#fff',
  outline: 'none',
  fontSize: '14px'
};
