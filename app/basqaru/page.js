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

export default function AdminPage() {
  const [supabase] = useState(() => getSupabaseClient());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Данные авторизации
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Форма добавления нового теста
  const [title, setTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [regStart, setRegStart] = useState('');
  const [regEnd, setRegEnd] = useState('');

  const [exams, setExams] = useState([]);

  // Проверка сессии при загрузке
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        loadExams();
      }
    }
    checkAuth();
  }, [supabase]);

  const loadExams = async () => {
    const { data } = await supabase.from('exams').select('*').order('id', { ascending: false });
    if (data) setExams(data);
  };

  // Вход в систему
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setErrorMsg('Қате логин немесе құпия сөз');
    } else {
      setIsAuthenticated(true);
      loadExams();
    }
  };

  // Выход
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  // Добавление теста
  const handleAddExam = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('exams').insert([
      { title, exam_date: examDate, start_time: startTime, reg_start: regStart, reg_end: regEnd }
    ]);

    if (!error) {
      setTitle(''); setExamDate(''); setStartTime(''); setRegStart(''); setRegEnd('');
      loadExams();
    } else {
      alert('Қате пайда болды: ' + error.message);
    }
  };

  // Удаление теста
  const handleDeleteExam = async (id) => {
    if (confirm('Бұл тестті өшіруге сенімдісіз бе?')) {
      await supabase.from('exams').delete().eq('id', id);
      loadExams();
    }
  };

  // Экран логина, если пользователь не авторизован
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', border: '1px solid #334155', width: '100%', maxWidth: '380px' }}>
          <h2 style={{ color: '#38bdf8', marginTop: 0, textAlign: 'center', fontSize: '22px' }}>Басқару панеліне кіру</h2>
          
          {errorMsg && <p style={{ color: '#f43f5e', fontSize: '14px', textAlign: 'center' }}>{errorMsg}</p>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={inputStyle} 
            />
            <input 
              type="password" 
              placeholder="Құпия сөз" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={inputStyle} 
            />
            <button type="submit" style={btnPrimary}>Кіру</button>
          </div>
        </form>
      </div>
    );
  }

  // Панель управления
  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', padding: '30px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#38bdf8' }}>QUQU Admin | Басқару Панелі</h1>
        <button onClick={handleLogout} style={btnDanger}>Шығу</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Форма добавления */}
        <form onSubmit={handleAddExam} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Жаңа тест қосу</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input placeholder="Тест атауы" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
            <input placeholder="Өткізілетін күні (мысалы: 10.10.2026)" value={examDate} onChange={(e) => setExamDate(e.target.value)} required style={inputStyle} />
            <input placeholder="Басталу уақыты (мысалы: 10:00)" value={startTime} onChange={(e) => setStartTime(e.target.value)} required style={inputStyle} />
            <input placeholder="Тіркелудің басталуы (мысалы: 01.09.2026)" value={regStart} onChange={(e) => setRegStart(e.target.value)} required style={inputStyle} />
            <input placeholder="Тіркелудің аяқталуы (мысалы: 05.10.2026)" value={regEnd} onChange={(e) => setRegEnd(e.target.value)} required style={inputStyle} />
            <button type="submit" style={{ ...btnPrimary, marginTop: '10px' }}>Қосу</button>
          </div>
        </form>

        {/* Список тестов */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Барлық тесттер тізімі</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#38bdf8', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Атауы</th>
                <th style={{ padding: '10px' }}>Күні</th>
                <th style={{ padding: '10px' }}>Әрекет</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px' }}>{item.title}</td>
                  <td style={{ padding: '10px' }}>{item.exam_date || item.examDate}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleDeleteExam(item.id)} style={{ ...btnDanger, padding: '4px 8px', fontSize: '12px' }}>Өшіру</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  padding: '12px',
  borderRadius: '8px',
  color: '#fff',
  outline: 'none'
};

const btnPrimary = {
  backgroundColor: '#38bdf8',
  color: '#0f172a',
  border: 'none',
  padding: '12px',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const btnDanger = {
  backgroundColor: '#f43f5e',
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
};
