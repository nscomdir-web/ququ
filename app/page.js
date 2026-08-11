'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  let rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  // Автоматически добавляем https:// если протокол не указан
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }

  return createClient(rawUrl, rawKey);
}

export default function Home() {
  const [supabase] = useState(() => getSupabaseClient());
  const [activeTab, setActiveTab] = useState('register');
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);

  // Форма регистрации родителя
  const [regData, setRegData] = useState({ firstName: '', secondName: '', email: '', phone: '', password: '' });
  // Форма ученика
  const [studentData, setStudentData] = useState({ firstName: '', secondName: '', iin: '', language: 'kaz', school: '', grade: '', city: '' });
  // Сканер / Код
  const [scanResult, setScanResult] = useState('');

  useEffect(() => {
    async function fetchExams() {
      const { data } = await supabase.from('exams').select('*');
      if (data) setExams(data);
    }
    fetchExams();
  }, [supabase]);

  async function handleRegister(e) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email: regData.email,
      password: regData.password,
    });
    if (error) return alert('Қате: ' + error.message);

    if (data.user) {
      await supabase.from('users').insert([{
        auth_id: data.user.id,
        first_name: regData.firstName,
        second_name: regData.secondName,
        email: regData.email,
        whatsapp_number: regData.phone
      }]);
      alert('Тіркелу сәтті өтті!');
      setUser(data.user);
      setActiveTab('dashboard');
    }
  }

  async function handleAddStudent(e) {
    e.preventDefault();
    if (!user) return alert('Алдымен жүйеге кіріңіз');

    const { data: userData } = await supabase.from('users').select('id').eq('auth_id', user.id).single();
    
    const { error } = await supabase.from('students').insert([{
      parent_id: userData?.id,
      first_name: studentData.firstName,
      second_name: studentData.secondName,
      iin: studentData.iin,
      language: studentData.language,
      school: studentData.school,
      grade: studentData.grade,
      city: studentData.city
    }]).select();

    if (error) alert('Қате: ' + error.message);
    else {
      alert('Оқушы сәтті қосылды!');
      setStudentData({ firstName: '', secondName: '', iin: '', language: 'kaz', school: '', grade: '', city: '' });
      if (userData?.id) loadUserData(userData.id);
    }
  }

  async function loadUserData(userId) {
    const { data: st } = await supabase.from('students').select('*').eq('parent_id', userId);
    setStudents(st || []);
  }

  async function buyTicket(studentId, examId) {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const qrData = `QUQU-${code}-${studentId}-${examId}`;

    const { error } = await supabase.from('tickets').insert([{
      student_id: studentId,
      exam_id: examId,
      five_digit_code: code,
      qr_code_data: qrData,
      payment_status: true,
      classroom: 'Кабинет №' + Math.floor(10 + Math.random() * 20)
    }]);

    if (error) alert('Қате: ' + error.message);
    else alert(`Билет сәтті сатып алынды! Сіздің 5 таңбалы кодыңыз: ${code}`);
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0070f3', paddingBottom: '10px' }}>
        <h1 style={{ color: '#0070f3', margin: 0 }}>ququ portal</h1>
        <nav style={{ display: 'flex', gap: '10px' }}>
          {!user ? (
            <>
              <button onClick={() => setActiveTab('register')} style={btnStyle}>Тіркелу</button>
              <button onClick={() => setActiveTab('login')} style={btnStyle}>Кіру</button>
            </>
          ) : (
            <>
              <button onClick={() => setActiveTab('dashboard')} style={btnStyle}>Жеке кабинет</button>
              <button onClick={() => setActiveTab('scan')} style={btnStyle}>QR Сканер</button>
              <button onClick={() => setUser(null)} style={{ ...btnStyle, background: '#e53e3e' }}>Шығу</button>
            </>
          )}
        </nav>
      </header>

      <main style={{ marginTop: '20px' }}>
        {activeTab === 'register' && (
          <div>
            <h2>Ата-ананы тіркеу</h2>
            <form onSubmit={handleRegister} style={formStyle}>
              <input placeholder="Аты" required onChange={e => setRegData({...regData, firstName: e.target.value})} style={inputStyle} />
              <input placeholder="Тегі" required onChange={e => setRegData({...regData, secondName: e.target.value})} style={inputStyle} />
              <input placeholder="Email" type="email" required onChange={e => setRegData({...regData, email: e.target.value})} style={inputStyle} />
              <input placeholder="WhatsApp номер (+7...)" required onChange={e => setRegData({...regData, phone: e.target.value})} style={inputStyle} />
              <input placeholder="Құпия сөз" type="password" required onChange={e => setRegData({...regData, password: e.target.value})} style={inputStyle} />
              <button type="submit" style={submitBtnStyle}>Тіркелу</button>
            </form>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div>
            <h2>Оқушыны тіркеу және Билеттер</h2>
            <form onSubmit={handleAddStudent} style={formStyle}>
              <h3>Оқушы қосу</h3>
              <input placeholder="Оқушының аты" required value={studentData.firstName} onChange={e => setStudentData({...studentData, firstName: e.target.value})} style={inputStyle} />
              <input placeholder="Оқушының тегі" required value={studentData.secondName} onChange={e => setStudentData({...studentData, secondName: e.target.value})} style={inputStyle} />
              <input placeholder="ЖСН (ИИН)" required maxLength={12} value={studentData.iin} onChange={e => setStudentData({...studentData, iin: e.target.value})} style={inputStyle} />
              <select value={studentData.language} onChange={e => setStudentData({...studentData, language: e.target.value})} style={inputStyle}>
                <option value="kaz">Қазақ тілі</option>
                <option value="rus">Русский язык</option>
              </select>
              <input placeholder="Мектебі" value={studentData.school} onChange={e => setStudentData({...studentData, school: e.target.value})} style={inputStyle} />
              <input placeholder="Сыныбы (мысалы: 6)" value={studentData.grade} onChange={e => setStudentData({...studentData, grade: e.target.value})} style={inputStyle} />
              <input placeholder="Қаласы" value={studentData.city} onChange={e => setStudentData({...studentData, city: e.target.value})} style={inputStyle} />
              <button type="submit" style={submitBtnStyle}>Оқушыны сақтау</button>
            </form>

            <h3 style={{ marginTop: '30px' }}>Қолжетімді сыныптар / Тесттер</h3>
            {exams.length === 0 ? <p>Әзірге белсенді тесттер жоқ</p> : (
              exams.map(ex => (
                <div key={ex.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                  <h4>{ex.title}</h4>
                  <p>Күні: {new Date(ex.exam_date).toLocaleDateString()}</p>
                  <p>Бағасы: {ex.price} ₸</p>
                  {students.map(st => (
                    <button key={st.id} onClick={() => buyTicket(st.id, ex.id)} style={{ ...btnStyle, marginRight: '5px' }}>
                      {st.first_name} үшін билет сатып алу
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'scan' && (
          <div>
            <h2>QR-код / 5-таңбалы кодты тексеру (Мұғалімдер үшін)</h2>
            <input 
              placeholder="5 таңбалы кодты енгізіңіз (мысалы: 48291)" 
              value={scanResult} 
              onChange={e => setScanResult(e.target.value)} 
              style={{ ...inputStyle, fontSize: '18px', textAlign: 'center' }} 
            />
            <button onClick={async () => {
              const { data } = await supabase.from('tickets').select('*, students(*)').eq('five_digit_code', scanResult).single();
              if (data) alert(`Оқушы табылды: ${data.students.first_name} ${data.students.second_name}, Аудитория: ${data.classroom}`);
              else alert('Билет табылмайды!');
            }} style={submitBtnStyle}>Тексеру</button>
          </div>
        )}
      </main>
    </div>
  );
}

const btnStyle = { padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const submitBtnStyle = { padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8f9fa', padding: '20px', borderRadius: '8px' };
const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' };
