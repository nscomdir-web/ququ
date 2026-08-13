'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Импортируем созданные компоненты
import ProfileTab from './components/ProfileTab';
import StudentsTab from './components/StudentsTab';
import TestsTab from './components/TestsTab';
import BookingsTab from './components/BookingsTab';
import TicketModal from './components/TicketModal';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  let rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }

  return createClient(rawUrl, rawKey);
}

// --- DOWNLOAD PDF / PRINT FUNCTION (Крупное фото и QR по центру) ---
const downloadPDF = (ticket) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QUQU - Тестке кіру қағазы (A4)</title>
          <style>
            @page { 
              size: A4 portrait; 
              margin: 0; 
            }
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              color: #0f172a; 
              background: #e2e8f0; 
              margin: 0; 
              padding: 0; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
            .a4-page { 
              width: 210mm; 
              height: 297mm; 
              padding: 15mm; 
              box-sizing: border-box; 
              background: #ffffff; 
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
              page-break-after: always;
            }
            .ticket-card { 
              border: 2px solid #0284c7; 
              border-radius: 20px; 
              background: #ffffff; 
              padding: 30px; 
              box-sizing: border-box; 
              width: 100%; 
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            }
            .header-row { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              border-bottom: 2px solid #f1f5f9; 
              padding-bottom: 20px; 
              margin-bottom: 24px; 
            }
            .brand-title { 
              font-size: 28px; 
              font-weight: 900; 
5              color: #0284c7; 
              letter-spacing: -0.5px; 
            }
            .brand-subtitle { 
              font-size: 12px; 
              font-weight: 700; 
              color: #64748b; 
              text-transform: uppercase; 
              letter-spacing: 1px; 
            }
            .badge-code { 
              background: #f0f9ff; 
              border: 1px solid #bae6fd; 
              padding: 8px 16px; 
              border-radius: 10px; 
              font-size: 14px; 
              font-weight: 800; 
              color: #0369a1; 
            }
            /* Секция ученика с крупным фото посередине */
            .student-section { 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              text-align: center;
              background: #f8fafc; 
              padding: 24px; 
              border-radius: 14px; 
              border: 1px solid #e2e8f0; 
              margin-bottom: 20px; 
            }
            .student-photo { 
              width: 120px; 
              height: 150px; 
              object-fit: cover; 
              border-radius: 10px; 
              border: 2px solid #cbd5e1; 
              background: #e2e8f0; 
              margin-bottom: 14px; 
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 12px 20px; 
              background: #f8fafc; 
              padding: 20px; 
              border-radius: 14px; 
              border: 1px solid #e2e8f0; 
              margin-bottom: 20px; 
            }
            .detail-item { 
              display: flex; 
              flex-direction: column; 
            }
            .detail-label { 
              font-size: 11px; 
              color: #64748b; 
              font-weight: 700; 
              text-transform: uppercase; 
              margin-bottom: 4px; 
            }
            .detail-value { 
              font-size: 15px; 
              font-weight: 700; 
              color: #0f172a; 
            }
            /* Крупный QR-код посередине */
            .footer-row { 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              text-align: center;
              background: #ffffff; 
              padding: 20px; 
              border-radius: 14px; 
              border: 1px solid #e2e8f0; 
            }
            .qr-code { 
              width: 140px; 
              height: 140px; 
              margin-bottom: 8px;
            }
            .warning-box { 
              background: #fff1f2; 
              border: 1px solid #fecdd3; 
              color: #be123c; 
              padding: 14px; 
              border-radius: 12px; 
              font-size: 12px; 
              font-weight: 700; 
              text-align: center; 
              margin-top: 20px; 
            }
            .instructions {
              margin-top: 30px;
              border-top: 1px dashed #cbd5e1;
              padding-top: 20px;
              font-size: 11px;
              color: #64748b;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="a4-page">
            <div class="ticket-card">
              <!-- Шапка -->
              <div class="header-row">
                <div>
                  <div class="brand-title">QUQU</div>
                  <div class="brand-subtitle">Тестке қатысудың ресми өткізу қағазы</div>
                </div>
                <div class="badge-code">Бронь коды: ${ticket.uniqueCode}</div>
              </div>

              <!-- Крупное фото и данные ученика посередине -->
              <div class="student-section">
                <div>
                  ${ticket.photoUrl ? `<img class="student-photo" src="${ticket.photoUrl}" alt="Фото" />` : `<div class="student-photo" style="display:flex; align-items:center; justify-content:center; font-size:11px; color:#666;">Фото жоқ</div>`}
                </div>
                <div>
                  <div style="font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 6px;">${ticket.studentName}</div>
                  <div style="font-size: 13px; color: #475569; margin-bottom: 3px;">ЖСН (ИИН): <b>${ticket.iin}</b></div>
                  <div style="font-size: 13px; color: #475569; margin-bottom: 3px;">Оқушы коды: <b style="color: #0284c7;">${ticket.studentCode || '—'}</b></div>
                  <div style="font-size: 13px; color: #475569;">Тест тапсыру тілі: <b>${ticket.language || 'Қазақша'}</b></div>
                </div>
              </div>

              <!-- Тест туралы ақпарат -->
              <div class="info-grid">
                <div class="detail-item">
                  <span class="detail-label">Тест атауы</span>
                  <span class="detail-value">${ticket.examTitle}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Бағыты / Форматы</span>
                  <span class="detail-value" style="color: #0284c7;">${ticket.schoolType} — ${ticket.examFormat}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Өтетін күні мен уақыты</span>
                  <span class="detail-value">${ticket.examDate} (${ticket.examTime})</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Мекен-жайы (Classroom)</span>
                  <span class="detail-value">${ticket.classroom || 'Көрсетілмеген'}</span>
                </div>
              </div>

              <!-- Увеличенный QR-код по центру -->
              <div class="footer-row">
                <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.uniqueCode)}" alt="QR" />
                <div style="font-size: 16px; font-weight: 800; color: #0284c7; letter-spacing: 1px;">${ticket.uniqueCode}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Бақылаушы үшін тексеру коды</div>
              </div>

              <!-- Ескерту -->
              <div class="warning-box">
                ⚠️ НАЗАР АУДАРЫҢЫЗ! Тестке келерде осы қағазды басып шығарып (немесе телефоннан көрсетіп) және қатысушының жеке басын куәландыратын құжатын (туу туралы куәлік / паспорт) өзіңізбен бірге міндетті түрде әкеліңіз!
              </div>
            </div>

            <div class="instructions">
              <b>Қосымша ақпарат:</b> Бұл құжат QUQU білім беру платформасы арқылы автоматты түрде генерацияланды. Тіркеу күні: ${ticket.date || '—'}.
            </div>
          </div>

          <script>
            window.onload = function() { 
              window.print(); 
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
};
};
export default function DashboardPage() {
  const [supabase] = useState(() => getSupabaseClient());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  const [students, setStudents] = useState([]);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', iin: '', school: '', city: '', grade: '6', language: 'Қазақша' });
  const [studentFile, setStudentFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [exams, setExams] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [registerModal, setRegisterModal] = useState(null);
  const [selectedStudentForReg, setSelectedStudentForReg] = useState('');
  const [selectedSchoolType, setSelectedSchoolType] = useState('НИШ');
  const [selectedFormat, setSelectedFormat] = useState('Офлайн');
  const [ticketModal, setTicketModal] = useState(null);

  useEffect(() => {
    async function checkAuthAndLoadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/'; return; }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setUser({
        name: profileData?.name || session.user.user_metadata?.name || session.user.email || 'Пайдаланушы',
        email: session.user.email,
        phone: profileData?.phone || session.user.user_metadata?.phone || ''
      });

      const { data: examsData } = await supabase.from('exams').select('*').order('exam_date', { ascending: true });
      if (examsData) setExams(examsData);

      const { data: studentsData } = await supabase.from('students').select('*').eq('parent_id', session.user.id);
      if (studentsData) setStudents(studentsData);

      await loadBookings(session.user.id);
      setLoading(false);
    }
    checkAuthAndLoadData();
  }, [supabase]);

  async function loadBookings(parentId) {
    const { data: ticketsData, error } = await supabase.from('tickets').select('*, exams (*), students (*)').eq('payment_status', 'paid');
    if (!error && ticketsData) {
      const filtered = ticketsData.filter(t => t.students && t.students.parent_id === parentId);
      setBookings(filtered);
    }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/'; };

  const handleUpdateProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from('profiles').update({ name: user.name, phone: user.phone }).eq('id', session.user.id);
    if (error) alert('Қате: ' + error.message);
    else alert('Профиль сәтті сақталды!');
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.firstName || !newStudent.iin) return alert('Барлық міндетті өрістерді толтырыңыз!');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setUploading(true);
    let photoUrl = '';
    if (studentFile) {
      const fileExt = studentFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, studentFile);
      if (uploadError) { setUploading(false); return alert('Суретті жүктеу қатесі: ' + uploadError.message); }
      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      photoUrl = publicData.publicUrl;
    }

    const studentToInsert = {
      first_name: newStudent.firstName, second_name: newStudent.lastName, iin: newStudent.iin,
      school: newStudent.school, city: newStudent.city, grade: newStudent.grade,
      language: newStudent.language, photo_url: photoUrl, parent_id: session.user.id
    };

    const { data, error } = await supabase.from('students').insert([studentToInsert]).select();
    setUploading(false);
    if (error) alert('Қате орын алды: ' + error.message);
    else if (data) {
      setStudents([...students, data[0]]);
      setNewStudent({ firstName: '', lastName: '', iin: '', school: '', city: '', grade: '6', language: 'Қазақша' });
      setStudentFile(null);
      setShowAddStudentModal(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (confirm('Оқушыны өшіруге сенімдісіз бе?')) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (!error) setStudents(students.filter(s => s.id !== id));
      else alert('Өшіру мүмкін болмады: ' + error.message);
    }
  };

  const handlePayment = async () => {
    if (!selectedStudentForReg) return alert('Оқушыны таңдаңыз!');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const studentObj = students.find(s => s.id.toString() === selectedStudentForReg.toString());
    const schoolLetter = selectedSchoolType === 'НИШ' ? 'N' : selectedSchoolType === 'БИЛ' ? 'B' : 'R';
    const formatLetter = selectedFormat === 'Онлайн' ? 'ON' : 'OF';
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const uniqueTicketCode = `QU-${schoolLetter}-${formatLetter}-${randomDigits}`;
    const examAddress = registerModal.address || 'Көрсетілмеген';

    const ticketPayload = {
      student_id: studentObj.id, exam_id: registerModal.id, five_digit_code: uniqueTicketCode,
      school_type: selectedSchoolType, exam_format: selectedFormat, payment_status: 'paid',
      classroom: examAddress, attendance_status: false, qr_code_data: uniqueTicketCode
    };

    const { data, error } = await supabase.from('tickets').insert([ticketPayload]).select();
    if (error) return alert('Төлемді сақтау қатесі: ' + error.message);

    await loadBookings(session.user.id);
    const createdTicket = data[0];
    setRegisterModal(null);
    
    setTicketModal({
      id: createdTicket?.id, studentName: `${studentObj?.first_name || ''} ${studentObj?.second_name || ''}`,
      iin: studentObj?.iin, studentCode: studentObj?.student_code || '—', language: studentObj?.language || 'Қазақша',
      photoUrl: studentObj?.photo_url || '', school: studentObj?.school || '—', examTitle: registerModal.title,
      examDate: registerModal.exam_date, examTime: registerModal.exam_time, schoolType: selectedSchoolType,
      examFormat: selectedFormat, classroom: examAddress, uniqueCode: uniqueTicketCode, date: new Date().toLocaleDateString()
    });
  };

  const openTicketFromBooking = (item) => {
    const student = item.students || {};
    const exam = item.exams || {};
    setTicketModal({
      id: item.id, studentName: `${student?.first_name || ''} ${student?.second_name || ''}`,
      iin: student?.iin, studentCode: student?.student_code || '—', language: student?.language || 'Қазақша',
      photoUrl: student?.photo_url || '', school: student?.school || '—', examTitle: exam?.title || 'Тест',
      examDate: exam?.exam_date || '—', examTime: exam?.exam_time || '—', schoolType: item.school_type,
      examFormat: item.exam_format, classroom: exam?.address || item.classroom || 'Көрсетілмеген',
      uniqueCode: item.five_digit_code, date: new Date(item.created_at).toLocaleDateString()
    });
  };

  if (loading) return <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '18px', fontWeight: 'bold' }}>Жүктелуде...</div>;

  return (
    <div className="dashboard-layout" style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'grid', gridTemplateColumns: '260px 1fr', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ backgroundColor: '#1e293b', borderRight: '1px solid #334155', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8', marginBottom: '32px' }}>QUQU<span style={{ color: '#f43f5e' }}>.</span> кабинет</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setActiveTab('profile')} style={menuBtn(activeTab === 'profile')}>👤 Профиль</button>
            <button onClick={() => setActiveTab('students')} style={menuBtn(activeTab === 'students')}>🎓 Оқушылар</button>
            <button onClick={() => setActiveTab('tests')} style={menuBtn(activeTab === 'tests')}>📝 Тесттер</button>
            <button onClick={() => setActiveTab('bookings')} style={menuBtn(activeTab === 'bookings')}>🎟️ Броньдар</button>
          </nav>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>← Басты бетке қайту</a>
          <button onClick={handleLogout} style={btnLightDanger}>Шығу</button>
        </div>
      </aside>

      <main style={{ padding: '32px', overflowY: 'auto' }}>
        {activeTab === 'profile' && <ProfileTab user={user} setUser={setUser} onUpdate={handleUpdateProfile} />}
        {activeTab === 'students' && <StudentsTab students={students} setShowAddStudentModal={setShowAddStudentModal} handleDeleteStudent={handleDeleteStudent} />}
        {activeTab === 'tests' && <TestsTab exams={exams} setRegisterModal={setRegisterModal} />}
        {activeTab === 'bookings' && <BookingsTab bookings={bookings} openTicketFromBooking={openTicketFromBooking} />}
      </main>

      {/* Модалка: Оқушы қосу */}
      {showAddStudentModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>Жаңа оқушы қосу</h3>
              <button onClick={() => setShowAddStudentModal(false)} style={closeBtn}>✕</button>
            </div>
            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input placeholder="Аты" value={newStudent.firstName} onChange={(e)=>setNewStudent({...newStudent, firstName: e.target.value})} style={inputStyle} required />
              <input placeholder="Фамилиясы" value={newStudent.lastName} onChange={(e)=>setNewStudent({...newStudent, lastName: e.target.value})} style={inputStyle} required />
              <input placeholder="ИИН (ЖСН)" value={newStudent.iin} onChange={(e)=>setNewStudent({...newStudent, iin: e.target.value})} style={inputStyle} required />
              <div>
                <label style={labelStyle}>Оқушы фотосы</label>
                <input type="file" accept="image/*" onChange={(e) => setStudentFile(e.target.files[0])} style={{ ...inputStyle, padding: '8px', cursor: 'pointer' }} />
              </div>
              <input placeholder="Мектеп" value={newStudent.school} onChange={(e)=>setNewStudent({...newStudent, school: e.target.value})} style={inputStyle} />
              <input placeholder="Қала" value={newStudent.city} onChange={(e)=>setNewStudent({...newStudent, city: e.target.value})} style={inputStyle} />
              <select value={newStudent.language} onChange={(e) => setNewStudent({ ...newStudent, language: e.target.value })} style={inputStyle}>
                <option value="Қазақша">Қазақша</option>
                <option value="Русский">Русский</option>
              </select>
              <input placeholder="Сынып (мысалы: 6)" value={newStudent.grade} onChange={(e)=>setNewStudent({...newStudent, grade: e.target.value})} style={inputStyle} />
              <button type="submit" disabled={uploading} style={{ ...btnPrimary, marginTop: '10px', width: '100%', justifyContent: 'center', opacity: uploading ? 0.7 : 1 }}>
                {uploading ? 'Жүктелуде...' : 'Қосу'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модалка: Тіркелу */}
      {registerModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>Тестке тіркелу</h3>
              <button onClick={() => setRegisterModal(null)} style={closeBtn}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Оқушыны таңдаңыз</label>
                <select value={selectedStudentForReg} onChange={(e)=>setSelectedStudentForReg(e.target.value)} style={inputStyle}>
                  <option value="">-- Таңдаңыз --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.second_name} ({s.iin})</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Бағытты таңдаңыз</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  {['НИШ', 'БИЛ', 'РФМШ'].map(type => (
                    <button key={type} type="button" onClick={() => setSelectedSchoolType(type)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: selectedSchoolType === type ? '2px solid #38bdf8' : '1px solid #334155', backgroundColor: selectedSchoolType === type ? '#0369a1' : '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Форматты таңдаңыз</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  {['Офлайн', 'Онлайн'].map(format => (
                    <button key={format} type="button" onClick={() => setSelectedFormat(format)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: selectedFormat === format ? '2px solid #38bdf8' : '1px solid #334155', backgroundColor: selectedFormat === format ? '#0369a1' : '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                      {format}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Тест: <strong style={{color:'#fff'}}>{registerModal.title}</strong></p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>Мекен-жайы: <strong style={{color:'#fff'}}>{registerModal.address || 'Көрсетілмеген'}</strong></p>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>Төлем сомасы: <strong style={{color:'#16a34a'}}>{registerModal.price} ₸</strong></p>
              </div>
              <button onClick={handlePayment} style={{ ...btnPrimary, backgroundColor: '#16a34a', color: '#fff', marginTop: '10px', width: '100%', justifyContent: 'center' }}>
                ⚡ (Тест) Төлемді растау және кіру қағазын алу
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка: Билет */}
      <TicketModal ticketModal={ticketModal} setTicketModal={setTicketModal} downloadPDF={downloadPDF} />
    </div>
  );
}

// Стильдер
const btnPrimary = { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' };
const btnLightDanger = { backgroundColor: 'transparent', color: '#f43f5e', border: '1px solid #f43f5e', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', width: '100%' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' };
const inputStyle = { width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' };
const closeBtn = { background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' };
const menuBtn = (active) => ({ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', backgroundColor: active ? '#0369a1' : 'transparent', color: active ? '#fff' : '#94a3b8', border: 'none', fontWeight: '700', cursor: 'pointer' });
