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

function parseDate(dateStr) {
  if (!dateStr) return null;
  const cleaned = dateStr.trim();
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(cleaned)) {
    const [day, month, year] = cleaned.split('.');
    return `${year}-${month}-${day}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  return null;
}

function parseTime(timeStr) {
  if (!timeStr) return null;
  const cleaned = timeStr.trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(cleaned)) {
    return cleaned.length === 4 ? `0${cleaned}` : cleaned;
  }
  return null;
}

export default function AdminPage() {
  const [supabase] = useState(() => getSupabaseClient());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('tests');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        loadAllData();
      }
    }
    checkAuth();
  }, [supabase]);

  const loadAllData = async () => {
    // Загружаем пользователей из таблицы profiles (где id совпадает с auth.users id)
    const { data: usersData } = await supabase.from('profiles').select('*');
    if (usersData) setUsers(usersData);

    // Загружаем всех учеников
    const { data: studentsData } = await supabase.from('students').select('*');
    
    if (studentsData && usersData) {
      const studentsWithParents = studentsData.map(student => {
        const parentId = student.parent_id || student.user_id;
        // Ищем в profiles пользователя, чей id совпадает с parent_id ученика
        const parent = usersData.find(u => u.id === parentId);
        return {
          ...student,
          parent_name: parent ? parent.name : 'Көрсетілмеген'
        };
      });
      setStudents(studentsWithParents);
    } else if (studentsData) {
      setStudents(studentsData);
    }

    // Загружаем тесты
    const { data: testsData } = await supabase.from('exams').select('*').order('exam_date', { ascending: true });
    if (testsData) setTests(testsData);
  };

  const toggleActive = async (id, currentStatus) => {
    await supabase.from('exams').update({ is_active: !currentStatus }).eq('id', id);
    loadAllData();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setErrorMsg('Логин немесе құпия сөз қате');
    } else {
      setIsAuthenticated(true);
      loadAllData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const exportToExcel = (data, filename) => {
    if (!data.length) return alert('Деректер жоқ!');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n').map(row => row.trim()).filter(Boolean);
      
      const newExams = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, ''));
        if (cols.length >= 8) {
          const rawPrice = cols[7] ? parseFloat(cols[7].replace(/[^\d.]/g, '')) : 0;
          const isActive = cols[8] ? cols[8].toLowerCase() === 'true' : true;

          newExams.push({
            title: cols[0],
            exam_date: parseDate(cols[1]),
            exam_time: parseTime(cols[2]),
            reg_start_date: parseDate(cols[3]),
            reg_start_time: parseTime(cols[4]),
            reg_end_date: parseDate(cols[5]),
            reg_end_time: parseTime(cols[6]),
            price: isNaN(rawPrice) ? 0 : rawPrice,
            is_active: isActive
          });
        }
      }

      if (newExams.length > 0) {
        const { error } = await supabase.from('exams').insert(newExams);
        if (!error) {
          alert('Тесттер базаға сәтті жүктелді!');
          loadAllData();
        } else {
          alert('Қате пайда болды: ' + error.message);
        }
      } else {
        alert('Файлдан дұрыс деректер табылмады!');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDeleteExam = async (id) => {
    if (confirm('Бұл тестті өшіруге сенімдісіз бе?')) {
      await supabase.from('exams').delete().eq('id', id);
      loadAllData();
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '16px', boxSizing: 'border-box' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', width: '100%', maxWidth: '380px', boxSizing: 'border-box' }}>
          <h2 style={{ color: '#0f172a', marginTop: 0, textAlign: 'center', fontSize: '22px', fontWeight: '800' }}>QUQU Басқару Панелі</h2>
          {errorMsg && <p style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>{errorMsg}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={lightInput} />
            <input type="password" placeholder="Құпия сөз" value={password} onChange={(e) => setPassword(e.target.value)} required style={lightInput} />
            <button type="submit" style={btnBlue}>Кіру</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-layout" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'grid', gridTemplateColumns: '260px 1fr', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .admin-layout {
            grid-template-columns: 1fr !important;
          }
          aside {
            width: 100% !important;
            position: relative !important;
          }
        }
      `}</style>

      <aside style={{ backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7', marginBottom: '32px' }}>
            QUQU<span style={{ color: '#f43f5e' }}>.</span> admin
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setActiveTab('users')} style={menuBtn(activeTab === 'users')}>👤 Пайдаланушылар</button>
            <button onClick={() => setActiveTab('students')} style={menuBtn(activeTab === 'students')}>🎓 Оқушылар</button>
            <button onClick={() => setActiveTab('tests')} style={menuBtn(activeTab === 'tests')}>📝 Тесттер</button>
            <button onClick={() => setActiveTab('results')} style={menuBtn(activeTab === 'results')}>📊 Нәтижелер</button>
          </nav>
        </div>
        <button onClick={handleLogout} style={btnLightDanger}>Шығу</button>
      </aside>

      <main style={{ padding: '24px', overflowY: 'auto', boxSizing: 'border-box', width: '100%', maxWidth: '100%' }}>
        {activeTab === 'users' && (
          <div>
            <h2 style={pageTitle}>Пайдаланушылар тізімі</h2>
            <div style={tableContainer}>
              <table style={tableStyle}>
                <thead>
                  <tr style={thTr}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Аты-жөні</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Телефон</th>
                    <th style={thStyle}>Актив</th>
                    <th style={thStyle}>Админ</th>
                    <th style={thStyle}>Мұғалім</th>
                    <th style={thStyle}>Тіркелген күні</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="8" style={tdStyle}>Деректер жоқ</td></tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>{u.id.substring(0, 8)}...</td>
                        <td style={{ ...tdStyle, fontWeight: '600' }}>{u.name || 'Көрсетілмеген'}</td>
                        <td style={tdStyle}>{u.email || '—'}</td>
                        <td style={tdStyle}>{u.phone || '—'}</td>
                        <td style={tdStyle}>{u.is_active ? '✅' : '❌'}</td>
                        <td style={tdStyle}>{u.is_admin ? '⭐ Иә' : 'Жоқ'}</td>
                        <td style={tdStyle}>{u.is_teacher ? '📚 Иә' : 'Жоқ'}</td>
                        <td style={tdStyle}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={pageTitle}>Барлық оқушылар (Толық мәлімет)</h2>
              <button onClick={() => exportToExcel(students, 'students_list')} style={btnGreen}>
                📥 Excel арқылы жүктеу
              </button>
            </div>
            <div style={tableContainer}>
              <table style={tableStyle}>
                <thead>
                  <tr style={thTr}>
                    <th style={thStyle}>Фото</th>
                    <th style={thStyle}>Аты-жөні</th>
                    <th style={thStyle}>ЖСН (ИИН)</th>
                    <th style={thStyle}>Мектеп / Қала</th>
                    <th style={thStyle}>Сынып / Тіл</th>
                    <th style={thStyle}>Ата-ана</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan="6" style={tdStyle}>Оқушылар әлі енгізілмеген</td></tr>
                  ) : (
                    students.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {s.photo_url ? <img src={s.photo_url} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : '👤'}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: '600' }}>{s.first_name} {s.second_name}</td>
                        <td style={tdStyle}>{s.iin}</td>
                        <td style={tdStyle}>{s.school || '—'} <br/><span style={{fontSize: '12px', color: '#64748b'}}>{s.city}</span></td>
                        <td style={tdStyle}>{s.grade} сынып <br/><span style={{fontSize: '12px', color: '#64748b'}}>{s.language}</span></td>
                        <td style={{ ...tdStyle, fontWeight: '600', color: '#0284c7' }}>{s.parent_name || 'Көрсетілмеген'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={pageTitle}>Тесттер тізімі</h2>
              <label style={btnBlueUpload}>
                📤 Тесттерді жүктеу (Excel/CSV)
                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            </div>
            <div style={tableContainer}>
              <table style={tableStyle}>
                <thead>
                  <tr style={thTr}>
                    <th style={thStyle}>Атауы</th>
                    <th style={thStyle}>Өткізілетін күні</th>
                    <th style={thStyle}>Тіркелу мерзімі</th>
                    <th style={thStyle}>Бағасы</th>
                    <th style={thStyle}>Статус</th>
                    <th style={thStyle}>Әрекет</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.length === 0 ? (
                    <tr><td colSpan="6" style={tdStyle}>Тесттер әлі жоқ</td></tr>
                  ) : (
                    tests.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ ...tdStyle, fontWeight: '600' }}>{t.title}</td>
                        <td style={tdStyle}>{t.exam_date || '—'} {t.exam_time ? `(${t.exam_time.slice(0, 5)})` : ''}</td>
                        <td style={tdStyle}>{t.reg_start_date || '—'} / {t.reg_end_date || '—'}</td>
                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#16a34a' }}>{t.price} ₸</td>
                        <td style={tdStyle}>
                          <input 
                            type="checkbox" 
                            checked={t.is_active} 
                            onChange={() => toggleActive(t.id, t.is_active)}
                            style={{ cursor: 'pointer', transform: 'scale(1.3)' }}
                          />
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => handleDeleteExam(t.id)} style={btnSmallDanger}>Өшіру</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            <h2 style={pageTitle}>Тест нәтижелерін енгізу</h2>
            <div style={tableContainer}>
              <table style={tableStyle}>
                <thead>
                  <tr style={thTr}>
                    <th style={thStyle}>Тест атауы</th>
                    <th style={thStyle}>Өткізілген күні</th>
                    <th style={thStyle}>Әрекет</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>{t.title}</td>
                      <td style={tdStyle}>{t.exam_date}</td>
                      <td style={tdStyle}>
                        <label style={{ ...btnBlueUpload, padding: '8px 14px', fontSize: '13px' }}>
                          📤 Нәтиже файлын жүктеу (Excel)
                          <input type="file" accept=".csv, .xlsx" style={{ display: 'none' }} onChange={() => alert(`"${t.title}" бойынша файл жүктелді!`)} />
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const lightInput = { backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', color: '#0f172a', outline: 'none', width: '100%', boxSizing: 'border-box' };
const menuBtn = (active) => ({ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', border: 'none', backgroundColor: active ? '#e0f2fe' : 'transparent', color: active ? '#0369a1' : '#64748b', fontWeight: active ? '700' : '500', cursor: 'pointer', fontSize: '15px' });
const pageTitle = { margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' };
const tableContainer = { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '20px', overflowX: 'auto', width: '100%' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', minWidth: '600px' };
const thTr = { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' };
const thStyle = { padding: '14px 18px', color: '#64748b', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' };
const tdStyle = { padding: '16px 18px', color: '#334155' };
const btnBlue = { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' };
const btnGreen = { backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' };
const btnBlueUpload = { backgroundColor: '#0284c7', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block', fontSize: '14px' };
const btnLightDanger = { backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' };
const btnSmallDanger = { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' };
