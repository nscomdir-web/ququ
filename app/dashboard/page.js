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

// PDF жүктеу функциясы (Атауы өзгертілді)
const downloadPDF = (ticket) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Браузер жаңа терезені ашуға рұқсат бермеді. Қалқымалы терезелерді (pop-up) қосыңыз.');
    return;
  }
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Тестке кіру қағазы - ${ticket.uniqueCode}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #000; background: #fff; text-align: center; }
          .ticket-box { border: 2px dashed #333; padding: 20px; border-radius: 12px; max-width: 400px; margin: 0 auto; text-align: left; }
          .header { font-size: 18px; font-weight: bold; color: #0284c7; margin-bottom: 10px; text-align: center; }
          .info { font-size: 14px; margin: 6px 0; }
          .student-header { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
          .student-img { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; background: #eee; border: 1px solid #ccc; }
          .qr-container { text-align: center; margin-top: 20px; }
          .qr-code { width: 120px; height: 120px; }
          .code-text { font-size: 16px; font-weight: bold; margin-top: 5px; letter-spacing: 1px; }
        </style>
      </head>
      <body>
        <div class="ticket-box">
          <div class="header">QUQU - Тестке кіру қағазы</div>
          <div class="student-header">
            ${ticket.photoUrl ? `<img class="student-img" src="${ticket.photoUrl}" alt="Foto" />` : ''}
            <div>
              <div class="info"><strong>Оқушы:</strong> ${ticket.studentName}</div>
              <div class="info"><strong>ИИН:</strong> ${ticket.iin}</div>
            </div>
          </div>
          <div class="info"><strong>Оқушы ID номері:</strong> ${ticket.studentCode || '—'}</div>
          <div class="info"><strong>Ата-ана телефоны:</strong> ${ticket.parentPhone || '—'}</div>
          <div class="info"><strong>Мектеп/Бағыт:</strong> ${ticket.schoolType}</div>
          <hr style="border: 0; border-top: 1px solid #ccc; margin: 12px 0;" />
          <div class="info"><strong>Тест:</strong> ${ticket.examTitle}</div>
          <div class="info"><strong>Форматы:</strong> ${ticket.examFormat}</div>
          <div class="info"><strong>Тілі:</strong> ${ticket.language || 'Қазақша'}</div>
          <div class="info"><strong>Күні мен уақыты:</strong> ${ticket.examDate} (${ticket.examTime})</div>
          
          <div class="qr-container">
            <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.uniqueCode)}" alt="QR" />
            <div class="code-text">${ticket.uniqueCode}</div>
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
      const userPhone = profileData?.phone || session.user.user_metadata?.phone || '';

      setUser({
        name: profileData?.name || session.user.user_metadata?.name || session.user.email || 'Пайдаланушы',
        email: session.user.email,
        phone: userPhone
      });

      const { data: examsData } = await supabase.from('exams').select('*').order('exam_date', { ascending: true });
      if (examsData) setExams(examsData);

      const { data: studentsData } = await supabase.from('students').select('*').eq('parent_id', session.user.id);
      if (studentsData) setStudents(studentsData);

      await loadBookings(session.user.id, userPhone);
      setLoading(false);
    }
    checkAuthAndLoadData();
  }, [supabase]);

  async function loadBookings(parentId, currentPhone) {
    const { data: ticketsData, error } = await supabase
      .from('tickets')
      .select('*, exams (*), students (*)')
      .eq('payment_status', 'paid');

    if (!error && ticketsData) {
      const filtered = ticketsData.filter(t => t.students && t.students.parent_id === parentId);
      const mappedBookings = filtered.map(b => ({ ...b, parentPhone: currentPhone }));
      setBookings(mappedBookings);
    }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/'; };

  const handlePayment = async () => {
    if (!selectedStudentForReg) return alert('Оқушыны таңдаңыз!');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const studentObj = students.find(s => s.id.toString() === selectedStudentForReg.toString());
    const schoolLetter = selectedSchoolType === 'НИШ' ? 'N' : selectedSchoolType === 'БИЛ' ? 'B' : 'R';
    const formatLetter = selectedFormat === 'Онлайн' ? 'ON' : 'OF';
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const uniqueTicketCode = `QU-${schoolLetter}-${formatLetter}-${randomDigits}`;

    const { data, error } = await supabase.from('tickets').insert([{
      student_id: studentObj.id,
      exam_id: registerModal.id,
      five_digit_code: uniqueTicketCode,
      school_type: selectedSchoolType,
      exam_format: selectedFormat,
      payment_status: 'paid',
      qr_code_data: uniqueTicketCode
    }]).select();

    if (error) return alert('Қате: ' + error.message);
    await loadBookings(session.user.id, user.phone);
    setRegisterModal(null);
    setTicketModal({
      id: data[0]?.id,
      studentName: `${studentObj?.first_name || ''} ${studentObj?.second_name || ''}`,
      iin: studentObj?.iin,
      photoUrl: studentObj?.photo_url || '',
      studentCode: studentObj?.student_code || '—',
      schoolType: selectedSchoolType,
      examTitle: registerModal.title,
      examDate: registerModal.exam_date,
      examTime: registerModal.exam_time,
      examFormat: selectedFormat,
      language: studentObj?.language || 'Қазақша',
      parentPhone: user.phone,
      uniqueCode: uniqueTicketCode
    });
  };

  const openTicketFromBooking = (item) => {
    const s = item.students; const e = item.exams;
    setTicketModal({
      id: item.id,
      studentName: `${s?.first_name || ''} ${s?.second_name || ''}`,
      iin: s?.iin,
      photoUrl: s?.photo_url || '',
      studentCode: s?.student_code || '—',
      schoolType: item.school_type,
      examTitle: e?.title || 'Тест',
      examDate: e?.exam_date || '—',
      examTime: e?.exam_time || '—',
      examFormat: item.exam_format,
      language: s?.language || 'Қазақша',
      parentPhone: user.phone,
      uniqueCode: item.five_digit_code
    });
  };

  return (
    <div className="dashboard-layout" style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'grid', gridTemplateColumns: '260px 1fr', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Меню */}
      <aside style={{ backgroundColor: '#1e293b', borderRight: '1px solid #334155', padding: '24px' }}>
        <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8', marginBottom: '32px' }}>QUQU кабинет</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setActiveTab('profile')} style={menuBtn(activeTab === 'profile')}>👤 Профиль</button>
          <button onClick={() => setActiveTab('students')} style={menuBtn(activeTab === 'students')}>🎓 Оқушылар</button>
          <button onClick={() => setActiveTab('tests')} style={menuBtn(activeTab === 'tests')}>📝 Тесттер</button>
          <button onClick={() => setActiveTab('bookings')} style={menuBtn(activeTab === 'bookings')}>🎟️ Броньдар</button>
        </nav>
      </aside>

      {/* Контент */}
      <main style={{ padding: '32px', overflowY: 'auto' }}>
        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Менің броньдарым</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bookings.map((item) => (
                <div key={item.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0' }}>{item.exams?.title}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#38bdf8' }}>Оқушы: {item.students?.first_name}</p>
                  </div>
                  <button onClick={() => openTicketFromBooking(item)} style={btnPrimary}>🎟️ Кіру қағазы</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* МОДАЛКА: ТЕСТКЕ КІРУ ҚАҒАЗЫ */}
      {ticketModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalContent, textAlign: 'center', maxWidth: '460px' }}>
            <h3 style={{ color: '#38bdf8', fontSize: '20px', marginBottom: '4px' }}>🎟️ Тестке кіру қағазы</h3>
            <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'left', marginBottom: '16px' }}>
              <p style={{ margin: '4px 0' }}><strong>Оқушы:</strong> {ticketModal.studentName}</p>
              <p style={{ margin: '4px 0' }}><strong>Оқушы ID номері:</strong> {ticketModal.studentCode}</p>
              <p style={{ margin: '4px 0' }}><strong>Тест:</strong> {ticketModal.examTitle}</p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(ticketModal.uniqueCode)}`} alt="QR" style={{ width: '100px' }} />
                <span style={{ color: '#38bdf8', fontWeight: 'bold', marginTop: '8px' }}>{ticketModal.uniqueCode}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => downloadPDF(ticketModal)} style={{ ...btnPrimary, flex: 1 }}>📥 PDF жүктеу</button>
              <button onClick={() => setTicketModal(null)} style={{ ...btnSmallDanger, flex: 1 }}>Жабу</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Стильдер қалды (өзгеріссіз)
const cardStyle = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' };
const btnPrimary = { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' };
const btnSmallDanger = { backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '400px' };
const menuBtn = (active) => ({ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', backgroundColor: active ? '#0369a1' : 'transparent', color: active ? '#fff' : '#94a3b8', border: 'none', fontWeight: '700', cursor: 'pointer' });
