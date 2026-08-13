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

export default function TeacherPage() {
  const [supabase] = useState(() => getSupabaseClient());
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Деректер
  const [activeExams, setActiveExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [tickets, setTickets] = useState([]);
  
  // Сканерлеу және іздеу
  const [searchCode, setSearchCode] = useState('');
  const [scannedResult, setScannedResult] = useState(null);

  // Авторизацияны тексеру
  useEffect(() => {
    async function checkExistingSession() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_teacher')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.is_teacher === true) {
          setIsTeacher(true);
          await loadActiveExams();
        } else {
          await supabase.auth.signOut();
        }
      }
      setLoading(false);
    }

    checkExistingSession();
  }, [supabase]);

  // Кіру функциясы
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      setErrorMsg('Email немесе құпия сөз қате!');
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_teacher')
      .eq('id', authData.session.user.id)
      .single();

    if (profileError || !profile || profile.is_teacher !== true) {
      await supabase.auth.signOut();
      setErrorMsg('Сізге мұғалім ретінде кіруге рұқсат жоқ!');
      setLoading(false);
      return;
    }

    setIsTeacher(true);
    await loadActiveExams();
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsTeacher(false);
    setEmail('');
    setPassword('');
    setTickets([]);
    setSelectedExamId('');
  };

  // Тек белсенді тесттерді жүктеу (is_active === true)
  async function loadActiveExams() {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('is_active', true)
      .order('exam_date', { ascending: true });

    if (!error && data) {
      setActiveExams(data);
      if (data.length > 0) {
        setSelectedExamId(data[0].id);
        await loadTicketsForExam(data[0].id);
      }
    }
  }

  // Таңдалған тестке қатысты билеттерді/оқушыларды жүктеу
  async function loadTicketsForExam(examId) {
    if (!examId) return;
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        students (*),
        exams (*)
      `)
      .eq('exam_id', examId)
      .eq('payment_status', 'paid');

    if (!error && data) {
      setTickets(data);
    }
  }

  // Тест ауысқанда
  const handleExamChange = async (e) => {
    const examId = e.target.value;
    setSelectedExamId(examId);
    setScannedResult(null);
    await loadTicketsForExam(examId);
  };

  // 1. Excel-ге экспорттау (CSV форматында жүктеу)
  const exportToExcel = () => {
    if (tickets.length === 0) return alert('Экспорттау үшін деректер жоқ!');

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "№,Аты-жөні,ИИН,Мектеп,Сынып,Тілі,Бағыты,Форматы,Аудитория,Код,Келді ме?\n";

    tickets.forEach((t, index) => {
      const s = t.students || {};
      const row = [
        index + 1,
        `"${s.first_name || ''} ${s.second_name || ''}"`,
        s.iin || '',
        `"${s.school || ''}"`,
        s.grade || '',
        s.language || '',
        t.school_type || '',
        t.exam_format || '',
        `"${t.classroom || 'Бөлінбеген'}"`,
        t.five_digit_code || '',
        t.attendance_status ? 'Келді' : 'Келмеді'
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Test_Oqushylary_${selectedExamId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Аудиторияларды Excel/CSV арқылы импорттау (Жаппай жаңарту)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      
      let updatedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',');
        if (cols.length >= 2) {
          const code = cols[cols.length - 2]?.replace(/"/g, '').trim();
          const classroom = cols[cols.length - 1]?.replace(/"/g, '').trim();

          if (code && classroom) {
            await supabase
              .from('tickets')
              .update({ classroom: classroom })
              .eq('five_digit_code', code)
              .eq('exam_id', selectedExamId);
            updatedCount++;
          }
        }
      }
      alert(`Сәтті аяқталды! Жаңартылды: ${updatedCount} оқушы.`);
      await loadTicketsForExam(selectedExamId);
    };
    reader.readAsText(file);
  };

  // 3. Код/QR сканерлеу арқылы "Келді" деп белгілеу (Тікелей функция)
  const handleScanOrSearch = () => {
    const query = searchCode.trim().toLowerCase();
    console.log("Ізделіп жатқан код немесе ИИН:", query);

    if (!query) {
      alert('Іздеу жолағы бос тұр!');
      return;
    }

    const found = tickets.find(t => {
      const ticketCode = (t.five_digit_code || '').trim().toLowerCase();
      const studentIin = (t.students?.iin || '').trim().toLowerCase();
      return ticketCode === query || studentIin === query;
    });

    if (!found) {
      alert(`Бұл кодпен немесе ИИН-мен (${searchCode}) тіркелген оқушы табылмады!`);
      setScannedResult(null);
      return;
    }

    console.log("Табылған оқушы:", found);
    updateAttendance(found.id, true);
  };

  const updateAttendance = async (ticketId, status) => {
    const { error } = await supabase
      .from('tickets')
      .update({ attendance_status: status })
      .eq('id', ticketId);

    if (!error) {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, attendance_status: status } : t));
      const updatedTicket = tickets.find(t => t.id === ticketId);
      if (updatedTicket) {
        setScannedResult({ ...updatedTicket, attendance_status: status });
      }
    } else {
      alert('Қате орын алды: ' + error.message);
    }
  };

  // Статистика есептеулері
  const totalRegistered = tickets.length;
  const totalPresent = tickets.filter(t => t.attendance_status === true).length;
  const totalAbsent = totalRegistered - totalPresent;

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '18px', fontWeight: 'bold' }}>
        Жүктелуде...
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '16px', border: '1px solid #334155', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
            👨‍🏫 Мұғалім кабинетіне кіру
          </h2>
          {errorMsg && (
            <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #f87171', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center', fontWeight: '600' }}>
              {errorMsg}
            </div>
          )}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Құпия сөз</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            </div>
            <button type="submit" style={btnPrimary}>Кіру</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Шапка */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>👨‍🏫 Мұғалімнің басқару панелі (Белсенді тесттер)</h1>
        <button onClick={handleLogout} style={btnDanger}>Шығу</button>
      </div>

      {/* Тестті таңдау панелі */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <label style={labelStyle}>Белсенді тестті таңдаңыз:</label>
        <select value={selectedExamId} onChange={handleExamChange} style={{ ...inputStyle, maxWidth: '400px' }}>
          {activeExams.length === 0 ? (
            <option value="">Қазір белсенді тесттер жоқ</option>
          ) : (
            activeExams.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.title} ({ex.exam_date})</option>
            ))
          )}
        </select>
      </div>

      {/* Статистика блоктары */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Барлығы тіркелгендер</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#38bdf8', marginTop: '6px' }}>{totalRegistered}</div>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Келгендер (Сканерленген)</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#22c55e', marginTop: '6px' }}>{totalPresent}</div>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Әлі келмегендер</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#f43f5e', marginTop: '6px' }}>{totalAbsent}</div>
        </div>
      </div>

      {/* Әрекеттер: Экспорт / Импорт / Сканерлеу */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Сканерлеу / Іздеу блогы (div арқылы түйме жұмыс істейтін етіп өзгертілді) */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>📷 Пропуск сканерлеу немесе код енгізу</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Код (мысалы: QU-N-OF-12345) немесе ИИН" 
              value={searchCode} 
              onChange={(e) => setSearchCode(e.target.value)} 
              style={inputStyle} 
            />
            <button 
              type="button" 
              onClick={handleScanOrSearch} 
              style={btnPrimary}
            >
              Тексеру
            </button>
          </div>

          {/* Сканерленген немесе ізделген оқушы карточкасы */}
          {scannedResult && (
            <div style={{ marginTop: '16px', backgroundColor: '#0f172a', padding: '14px', borderRadius: '10px', border: '2px solid #22c55e', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '55px', height: '70px', borderRadius: '8px', backgroundColor: '#334155', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {scannedResult.students?.photo_url ? <img src={scannedResult.students.photo_url} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : '👤'}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#22c55e' }}>✅ Сәтті тіркелді (Келді)</h4>
                <p style={{ margin: '2px 0', fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{scannedResult.students?.first_name} {scannedResult.students?.second_name}</p>
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#94a3b8' }}>Аудитория: <b style={{color: '#38bdf8'}}>{scannedResult.classroom || 'Бөлінбеген'}</b></p>
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#94a3b8' }}>Тілі: {scannedResult.students?.language} | Бағыты: {scannedResult.school_type}</p>
              </div>
            </div>
          )}
        </div>

        {/* Excel экспорт / импорт блогы */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>📊 Excel құралдары</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={exportToExcel} style={{ ...btnSecondary, width: '100%', justifyContent: 'center' }}>
              📥 Тіркелгендерді Excel-ге жүктеу (Export)
            </button>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Аудиторияларды жүктеу (Import Excel/CSV):</label>
              <input type="file" accept=".csv" onChange={handleFileUpload} style={{ fontSize: '13px', color: '#94a3b8' }} />
            </div>
          </div>
        </div>

      </div>

      {/* Оқушылар тізімі кестесі */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>📋 Осы тестке тіркелгендер тізімі</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>№</th>
                <th style={{ padding: '10px' }}>Аты-жөні</th>
                <th style={{ padding: '10px' }}>ИИН</th>
                <th style={{ padding: '10px' }}>Код</th>
                <th style={{ padding: '10px' }}>Формат / Бағыт</th>
                <th style={{ padding: '10px' }}>Аудитория</th>
                <th style={{ padding: '10px' }}>Статусы</th>
                <th style={{ padding: '10px' }}>Әрекет</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Бұл тестке әзірге оқушылар тіркелмеген.</td>
                </tr>
              ) : (
                tickets.map((t, idx) => {
                  const s = t.students || {};
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{idx + 1}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{s.first_name} {s.second_name}</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{s.iin}</td>
                      <td style={{ padding: '10px', color: '#38bdf8', fontWeight: 'bold' }}>{t.five_digit_code}</td>
                      <td style={{ padding: '10px' }}>{t.exam_format} ({t.school_type})</td>
                      <td style={{ padding: '10px', color: '#facc15', fontWeight: 'bold' }}>{t.classroom || '—'}</td>
                      <td style={{ padding: '10px' }}>
                        {t.attendance_status ? (
                          <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✅ Келді</span>
                        ) : (
                          <span style={{ color: '#f43f5e' }}>❌ Келмеді</span>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button 
                          onClick={() => updateAttendance(t.id, !t.attendance_status)} 
                          style={{ 
                            backgroundColor: t.attendance_status ? '#7f1d1d' : '#16a34a', 
                            color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' 
                          }}
                        >
                          {t.attendance_status ? 'Алып тастау' : 'Келді деп белгілеу'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// Стильдер жиынтығы
const cardStyle = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' };
const inputStyle = { width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' };
const btnPrimary = { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' };
const btnSecondary = { backgroundColor: '#0369a1', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' };
const btnDanger = { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
