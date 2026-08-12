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
  const [activeModal, setActiveModal] = useState(null); // 'register' or 'login'

  // Поля формы регистрации / входа
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authMsg, setAuthMsg] = useState('');

  useEffect(() => {
    async function fetchExams() {
      const { data } = await supabase.from('exams').select('*').order('exam_date', { ascending: true });
      if (data) {
        setExams(data);
      }
    }
    fetchExams();
  }, [supabase]);

  // Функция регистрации: клиент сам регистрирует и записывает данные в profiles
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthMsg('');

    // 1. Регистрация в Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: {
          name: regName,
          phone: regPhone
        },
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      setAuthMsg('Қате: ' + error.message);
      return;
    }

    // 2. Сразу записываем данные в таблицу public.profiles из браузера
    if (data?.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          name: regName,
          phone: regPhone,
          is_active: false,
          is_teacher: false
        }
      ]);

      if (profileError) {
        setAuthMsg('Қате (Профиль): ' + profileError.message);
        return;
      }
    }

    setAuthMsg('Сәтті! Электронды почтаңызға растау сілтемесі жіберілді. Почтаңызды тексеріңіз.');
  };

  // Функция входа в личный кабинет через логин и пароль
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email: regEmail,
      password: regPassword,
    });

    if (error) {
      setAuthMsg('Логин немесе құпия сөз қате / Почта расталмаған');
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Шапка */}
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

      {/* Баннер */}
      <section style={{ maxWidth: '1200px', margin: '40px auto 20px auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Тестілеу орталығына қош келдіңіздер</h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>Жүйеге тіркеліңіз немесе жеке кабинетке кіріңіз</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => { setActiveModal('register'); setAuthMsg(''); }} style={{ ...btnBase, backgroundColor: '#38bdf8', color: '#0f172a' }}>👤 ЖАҢА ПАЙДАЛАНУШЫ</button>
          <button onClick={() => { setActiveModal('login'); setAuthMsg(''); }} style={{ ...btnBase, backgroundColor: '#6366f1', color: '#fff' }}>🔒 ЖЕКЕ КАБИНЕТКЕ КІРУ</button>
        </div>
      </section>

      {/* Таблица тестов */}
      <main style={{ maxWidth: '1200px', margin: '30px auto 60px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '20px', textTransform: 'uppercase', marginBottom: '20px', color: '#f8fafc', fontWeight: '700' }}>Қолжетімді тесттер тізімі</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#38bdf8', borderBottom: '2px solid #334155' }}>
                <th style={thStyle}>№</th>
                <th style={thStyle}>ТЕСТ АТАУЫ</th>
                <th style={thStyle}>ӨТКІЗІЛЕТІН КҮНІ</th>
                <th style={thStyle}>БАСТАЛУ УАҚЫТЫ</th>
                <th style={thStyle}>ТІРКЕЛУДІҢ БАСТАЛУЫ</th>
                <th style={thStyle}>ТІРКЕЛУДІҢ АЯҚТАЛУЫ</th>
                <th style={thStyle}>СТАТУС</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Әзірге тесттер жоқ</td></tr>
              ) : (
                exams.map((item, index) => {
                  const isActive = item.is_active === true;
                  return (
                    <tr 
                      key={item.id} 
                      style={{ 
                        borderBottom: '1px solid #334155', 
                        backgroundColor: index % 2 === 0 ? '#1e293b' : '#0f172a',
                        opacity: isActive ? 1 : 0.45,
                        filter: isActive ? 'none' : 'grayscale(0.8)',
                        transition: '0.2s'
                      }}
                    >
                      <td style={tdStyle}>{index + 1}.</td>
                      <td style={{ ...tdStyle, fontWeight: '700', color: isActive ? '#f8fafc' : '#94a3b8' }}>{item.title}</td>
                      <td style={tdStyle}>{item.exam_date || '—'}</td>
                      <td style={tdStyle}>{item.exam_time ? item.exam_time.slice(0, 5) : '—'}</td>
                      <td style={tdStyle}>{item.reg_start_date || '—'}</td>
                      <td style={tdStyle}>{item.reg_end_date || '—'}</td>
                      <td style={tdStyle}>
                        {isActive ? (
                          <span style={{ backgroundColor: '#0369a1', color: '#e0f2fe', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                            Ашық
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#475569', color: '#cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                            Жабық
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Модальное окно авторизации/регистрации */}
      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid #334155', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>{activeModal === 'login' ? 'Жүйеге кіру' : 'Жаңа пайдаланушы тіркелуі'}</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {authMsg && (
              <div style={{ marginBottom: '16px', padding: '10px', borderRadius: '8px', backgroundColor: authMsg.includes('Сәтті') ? '#065f46' : '#7f1d1d', color: '#fff', fontSize: '13px' }}>
                {authMsg}
              </div>
            )}

            <form onSubmit={activeModal === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeModal === 'register' && (
                <>
                  <div>
                    <label style={labelStyle}>Аты-жөніңіз</label>
                    <input placeholder="Мысалы: Айдын Серикұлы" value={regName} onChange={(e) => setRegName(e.target.value)} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Телефон нөмірі</label>
                    <input placeholder="+7 (700) 000-00-00" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} style={inputStyle} required />
                  </div>
                </>
              )}
              <div>
                <label style={labelStyle}>Электронды пошта (Email)</label>
                <input type="email" placeholder="name@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Құпия сөз</label>
                <input type="password" placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} style={inputStyle} required />
              </div>

              <button type="submit" style={{ ...btnBase, backgroundColor: '#38bdf8', color: '#0f172a', marginTop: '10px', width: '100%', justifyContent: 'center' }}>
                {activeModal === 'login' ? 'Кіру' : 'Тіркелу және поштаны растау'}
              </button>
            </form>

            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
              {activeModal === 'register' ? (
                <span>Аккаунтыңыз бар ма? <button onClick={() => { setActiveModal('login'); setAuthMsg(''); }} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>Кіру</button></span>
              ) : (
                <span>Аккаунт жоқ па? <button onClick={() => { setActiveModal('register'); setAuthMsg(''); }} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>Тіркелу</button></span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnBase = { padding: '14px 24px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' };
const thStyle = { padding: '16px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' };
const tdStyle = { padding: '16px', color: '#cbd5e1' };
const inputStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', padding: '12px 16px', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
const labelStyle = { display: 'block', divider: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' };
