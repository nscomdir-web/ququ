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

// --- DOWNLOAD PDF / PRINT FUNCTION ---
const downloadPDF = (ticket) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QUQU - Тестке кіру қағазы</title>
          <style>
            @page { size: A4; margin: 0; }
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              color: #0f172a; 
              background: #ffffff; 
              margin: 0; 
              padding: 0; 
              -webkit-print-color-adjust: exact;
            }
            .a4-page {
              width: 210mm;
              height: 297mm;
              padding: 20mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              background: #ffffff;
            }
            .ticket-box { 
              border: 2px dashed #0284c7; 
              padding: 24px; 
              border-radius: 16px; 
              background: #f8fafc; 
              box-sizing: border-box; 
              width: 100%;
              max-width: 500px;
            }
            .top-section { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; }
            .title-area { font-size: 20px; font-weight: 900; color: #0284c7; text-transform: uppercase; }
            
            .student-info-box {
              display: flex;
              gap: 14px;
              align-items: center;
              background: #ffffff;
              padding: 12px;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
              margin-bottom: 12px;
            }
            .student-photo { width: 65px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1; background: #e2e8f0; }

            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 12px;
              background: #ffffff;
              padding: 12px;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
              margin-bottom: 12px;
              font-size: 13px;
            }
            .detail-item { display: flex; flex-direction: column; }
            .detail-label { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; }
            .detail-value { font-weight: 700; color: #0f172a; }

            .qr-section { text-align: center; background: #ffffff; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .qr-code { width: 95px; height: 95px; }
            .code-text { font-size: 15px; font-weight: 800; color: #0284c7; margin-top: 6px; letter-spacing: 1px; }
            
            .warning-box {
              margin-top: 12px;
              background: #fef2f2;
              border: 1px solid #fecaca;
              color: #991b1b;
              padding: 10px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 700;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="a4-page">
            <div class="ticket-box">
              <div class="top-section">
                <div>
                  <div class="title-area">QUQU</div>
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Тестке кіру ресми қағазы</div>
                </div>
                <div style="font-size: 12px; font-weight: bold; color: #475569;">
                  Код: ${ticket.uniqueCode}
                </div>
              </div>

              <div class="student-info-box">
                <div>
                  ${ticket.photoUrl 
                    ? `<img class="student-photo" src="${ticket.photoUrl}" alt="Фото" />` 
                    : `<div class="student-photo" style="display:flex; align-items:center; justify-content:center; font-size:10px; color:#666;">Фото жоқ</div>`
                  }
                </div>
                <div>
                  <div style="font-size: 15px; font-weight: 800; color: #0f172a;">
                    ${ticket.studentName}
                  </div>
                  <div style="font-size: 12px; color: #475569; margin-top: 3px;">
                    ЖСН (ИИН): <b>${ticket.iin}</b>
                  </div>
                  <div style="font-size: 12px; color: #475569; margin-top: 2px;">
                    Оқушы коды: <b>${ticket.studentCode || '—'}</b>
                  </div>
                  <div style="font-size: 12px; color: #475569; margin-top: 2px;">
                    Тілі (Бланк): <b>${ticket.language || 'Қазақша'}</b>
                  </div>
                </div>
              </div>

              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">Тест атауы</span>
                  <span class="detail-value">${ticket.examTitle}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Форматы</span>
                  <span class="detail-value" style="color: #0284c7;">${ticket.examFormat}</span>
                </div>
                <div class="detail-item" style="grid-column: span 2;">
                  <span class="detail-label">Өтетін күні мен уақыты</span>
                  <span class="detail-value">${ticket.examDate} (${ticket.examTime})</span>
                </div>
                <div class="detail-item" style="grid-column: span 2;">
                  <span class="detail-label">Тест Мекен-жайы (Address)</span>
                  <span class="detail-value">${ticket.classroom || 'Көрсетілмеген'}</span>
                </div>
              </div>

              <div class="qr-section">
                <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(ticket.uniqueCode)}" alt="QR" />
                <div class="code-text">${ticket.uniqueCode}</div>
              </div>
              
              <div class="warning-box">
                ⚠️ Назар аударыңыз! Тестке келгенде осы қағазды (немесе электронды нұсқасын) және жеке куәлікті/ту туралы куәлікті өзіңізбен бірге міндетті түрде әкелуіңіз қажет!
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); };
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
      
      if (!session) {
        window.location.href = '/';
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

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
    const { data: ticketsData, error } = await supabase
      .from('tickets')
      .select(`
        *,
        exams (*),
        students (*)
      `)
      .eq('payment_status', 'paid');

    if (!error && ticketsData) {
      const filtered = ticketsData.filter(t => t.students && t.students.parent_id === parentId);
      setBookings(filtered);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleUpdateProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('profiles')
      .update({ name: user.name, phone: user.phone })
      .eq('id', session.user.id);

    if (error) {
      alert('Қате: ' + error.message);
    } else {
      alert('Профиль сәтті сақталды!');
    }
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
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, studentFile);

      if (uploadError) {
        setUploading(false);
        return alert('Суретті жүктеу қатесі: ' + uploadError.message);
      }

      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      photoUrl = publicData.publicUrl;
    }

    const studentToInsert = {
      first_name: newStudent.firstName,
      second_name: newStudent.lastName,
      iin: newStudent.iin,
      school: newStudent.school,
      city: newStudent.city,
      grade: newStudent.grade,
      language: newStudent.language,
      photo_url: photoUrl,
      parent_id: session.user.id
    };

    const { data, error } = await supabase.from('students').insert([studentToInsert]).select();
    setUploading(false);

    if (error) {
      alert('Қате орын алды: ' + error.message);
    } else if (data) {
      setStudents([...students, data[0]]);
      setNewStudent({ firstName: '', lastName: '', iin: '', school: '', city: '', grade: '6', language: 'Қазақша' });
      setStudentFile(null);
      setShowAddStudentModal(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (confirm('Оқушыны өшіруге сенімдісіз бе?')) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (!error) {
        setStudents(students.filter(s => s.id !== id));
      } else {
        alert('Өшіру мүмкін болмады: ' + error.message);
      }
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

    // Мекен-жайды тек exam кестесінен аламыз
    const examAddress = registerModal.address || 'Көрсетілмеген';

    const ticketPayload = {
      student_id: studentObj.id,
      exam_id: registerModal.id,
      five_digit_code: uniqueTicketCode,
      school_type: selectedSchoolType,
      exam_format: selectedFormat,
      payment_status: 'paid',
      classroom: examAddress,
      attendance_status: false,
      qr_code_data: uniqueTicketCode
    };

    const { data, error } = await supabase.from('tickets').insert([ticketPayload]).select();

    if (error) {
      return alert('Төлемді сақтау қатесі: ' + error.message);
    }

    await loadBookings(session.user.id);
    const createdTicket = data[0];
    setRegisterModal(null);
    
    setTicketModal({
      id: createdTicket?.id,
      studentName: `${studentObj?.first_name || ''} ${studentObj?.second_name || ''}`,
      iin: studentObj?.iin,
      studentCode: studentObj?.student_code || '—',
      language: studentObj?.language || 'Қазақша',
      photoUrl: studentObj?.photo_url || '',
      school: studentObj?.school || '—',
      examTitle: registerModal.title,
      examDate: registerModal.exam_date,
      examTime: registerModal.exam_time,
      schoolType: selectedSchoolType,
      examFormat: selectedFormat,
      classroom: examAddress,
      uniqueCode: uniqueTicketCode,
      date: new Date().toLocaleDateString()
    });
  };

  const openTicketFromBooking = (item) => {
    const student = item.students || {};
    const exam = item.exams || {};

    setTicketModal({
      id: item.id,
      studentName: `${student?.first_name || ''} ${student?.second_name || ''}`,
      iin: student?.iin,
      studentCode: student?.student_code || '—',
      language: student?.language || 'Қазақша',
      photoUrl: student?.photo_url || '',
      school: student?.school || '—',
      examTitle: exam?.title || 'Тест',
      examDate: exam?.exam_date || '—',
      examTime: exam?.exam_time || '—',
      schoolType: item.school_type,
      examFormat: item.exam_format,
      classroom: exam?.address || item.classroom || 'Көрсетілмеген',
      uniqueCode: item.five_digit_code,
      date: new Date(item.created_at).toLocaleDateString()
    });
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '18px', fontWeight: 'bold', fontFamily: 'system-ui, sans-serif' }}>
        Жүктелуде...
      </div>
    );
  }

  return (
    <div className="dashboard-layout" style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'grid', gridTemplateColumns: '260px 1fr', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .dashboard-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Меню */}
      <aside style={{ backgroundColor: '#1e293b', borderRight: '1px solid #334155', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8', marginBottom: '32px' }}>
            QUQU<span style={{ color: '#f43f5e' }}>.</span> кабинет
          </div>
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

      {/* Контент */}
      <main style={{ padding: '32px', overflowY: 'auto' }}>
        
        {activeTab === 'profile' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#f8fafc' }}>Жеке профиль</h2>
            <div style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                <div>
                  <label style={labelStyle}>Аты-жөні</label>
                  <input type="text" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={user.email} disabled style={{ ...inputStyle, opacity: 0.6 }} />
                </div>
                <div>
                  <label style={labelStyle}>Телефон</label>
                  <input type="text" value={user.phone} onChange={(e) => setUser({...user, phone: e.target.value})} style={inputStyle} />
                </div>
                <button onClick={handleUpdateProfile} style={btnPrimary}>Өзгерістерді сақтау</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc' }}>Оқушылар тізімі</h2>
              <button onClick={() => setShowAddStudentModal(true)} style={btnPrimary}>+ Оқушы қосу</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {students.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>Әзірге оқушылар қосылмаған.</p>
              ) : (
                students.map((s) => (
                  <div key={s.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', overflow: 'hidden', flexShrink: 0 }}>
                          {s.photo_url ? <img src={s.photo_url} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : '👤'}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>{s.first_name} {s.second_name}</h3>
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>ИИН: {s.iin}</p>
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#0f172a', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Оқушы коды:</span>
                        <span style={{ fontSize: '16px', color: '#38bdf8', fontWeight: '800', letterSpacing: '1px' }}>
                          {s.student_code || '—'}
                        </span>
                      </div>

                      <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '4px 0' }}>Мектеп: {s.school || '—'}</p>
                      <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '4px 0' }}>Қала: {s.city || '—'}</p>
                      <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '4px 0' }}>Сынып: {s.grade || '—'} | Тіл: {s.language || '—'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button onClick={() => alert('Өзгерту функциясы')} style={btnSmallBlue}>Өзгерту</button>
                      <button onClick={() => handleDeleteStudent(s.id)} style={btnSmallDanger}>Жою</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#f8fafc' }}>Қолжетімді тесттер</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {exams.map((exam) => {
                const isActive = exam.is_active === true;
                return (
                  <div key={exam.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', opacity: isActive ? 1 : 0.6 }}>
                    <div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#fff' }}>{exam.title}</h3>
                      <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Күні: {exam.exam_date || '—'} | Уақыты: {exam.exam_time || '—'} | Мекен-жайы: {exam.address || '—'} | Бағасы: {exam.price} ₸</p>
                    </div>
                    <div>
                      {isActive ? (
                        <button onClick={() => setRegisterModal(exam)} style={btnPrimary}>Тіркелу</button>
                      ) : (
                        <span style={{ backgroundColor: '#475569', color: '#cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>Жабық</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#f8fafc' }}>Менің броньдарым</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bookings.length === 0 ? (
                <div style={cardStyle}>
                  <p style={{ color: '#94a3b8', margin: 0 }}>Әзірге белсенді броньдар жоқ.</p>
                </div>
              ) : (
                bookings.map((item) => {
                  const exam = item.exams || {};
                  const student = item.students || {};
                  const hasResult = item.result_score !== null && item.result_score !== undefined;

                  return (
                    <div key={item.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#334155', overflow: 'hidden', flexShrink: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {student.photo_url ? <img src={student.photo_url} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : '👤'}
                        </div>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', color: '#fff' }}>{exam.title || 'Тест'}</h3>
                          <p style={{ margin: 0, fontSize: '13px', color: '#38bdf8', fontWeight: '600' }}>
                            Оқушы: {student.first_name} {student.second_name} ({item.school_type} - {item.exam_format})
                          </p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                            Күні: {exam.exam_date || '—'} ({exam.exam_time || '—'}) | Код: {item.five_digit_code}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {hasResult ? (
                          <button onClick={() => alert(`Тест нәтижесі: ${item.result_score}`)} style={btnSmallBlue}>
                            📊 Нәтиже: {item.result_score}
                          </button>
                        ) : (
                          <button disabled style={{ ...btnSmallBlue, backgroundColor: '#334155', color: '#64748b', cursor: 'not-allowed', border: 'none' }}>
                            📊 Нәтиже әлі жоқ
                          </button>
                        )}

                        <button onClick={() => openTicketFromBooking(item)} style={btnPrimary}>
                          🎟️ Тестке кіру қағазы
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* МОДАЛКА: ДОБАВИТЬ УЧЕНИКА */}
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
             
              <select value={newStudent.language} onChange={(e) => setNewStudent({ ...newStudent, language: e.target.value })} style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px', marginBottom: '12px', outline: 'none' }}>
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

      {/* МОДАЛКА: РЕГИСТРАЦИЯ НА ТЕСТ */}
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

      {/* МОДАЛКА: ПРОПУСК С QR-КОДОМ (ЭКРАННЫЙ ВАРИАНТ) */}
      {ticketModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalContent, textAlign: 'center', maxWidth: '440px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#38bdf8', fontSize: '18px', margin: 0 }}>🎟️ Тестке кіру қағазы</h3>
              <button onClick={() => setTicketModal(null)} style={closeBtn}>✕</button>
            </div>
            
            <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'left', marginBottom: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '55px', height: '70px', borderRadius: '8px', backgroundColor: '#334155', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {ticketModal.photoUrl ? <img src={ticketModal.photoUrl} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : '👤'}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 3px 0', fontSize: '15px', color: '#fff' }}>{ticketModal.studentName}</h4>
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#94a3b8' }}>ЖСН (ИИН): <b>{ticketModal.iin}</b></p>
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#94a3b8' }}>Оқушы коды: <span style={{color: '#38bdf8', fontWeight: 'bold'}}>{ticketModal.studentCode}</span></p>
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#94a3b8' }}>Тілі (Бланк): <span style={{color: '#fff', fontWeight: 'bold'}}>{ticketModal.language}</span></p>
              </div>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'left', marginBottom: '14px', fontSize: '13px' }}>
              <p style={{ margin: '4px 0', color: '#cbd5e1' }}><strong>Тест атауы:</strong> <span style={{color:'#fff'}}>{ticketModal.examTitle}</span></p>
              <p style={{ margin: '4px 0', color: '#cbd5e1' }}><strong>Форматы:</strong> <span style={{color: '#38bdf8', fontWeight: 'bold'}}>{ticketModal.examFormat}</span></p>
              <p style={{ margin: '4px 0', color: '#cbd5e1' }}><strong>Өтетін күні мен уақыты:</strong> <span style={{color:'#fff'}}>{ticketModal.examDate} ({ticketModal.examTime})</span></p>
              <p style={{ margin: '4px 0', color: '#cbd5e1' }}><strong>Тест Мекен-жайы (Address):</strong> <span style={{color:'#fff'}}>{ticketModal.classroom}</span></p>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px', backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(ticketModal.uniqueCode)}`} 
                  alt="QR Code" 
                  style={{ width: '95px', height: '95px', borderRadius: '6px', background: '#fff', padding: '4px' }}
                />
                <span style={{ color: '#38bdf8', fontWeight: '800', fontSize: '14px', letterSpacing: '1px', marginTop: '6px' }}>
                  {ticketModal.uniqueCode}
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', textAlign: 'center', marginBottom: '14px' }}>
              ⚠️ Назар аударыңыз! Тестке келгенде осы қағазды және жеке куәлікті өзіңізбен бірге міндетті түрде әкеліңіз!
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => downloadPDF(ticketModal)} style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}>📥 PDF жүктеу / Баспа</button>
              <button onClick={() => setTicketModal(null)} style={{ ...btnSmallDanger, flex: 1, padding: '10px' }}>Жабу</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Стильдер
const cardStyle = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' };
const btnPrimary = { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' };
const btnSmallBlue = { backgroundColor: '#0369a1', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' };
const btnSmallDanger = { backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' };
const btnLightDanger = { backgroundColor: 'transparent', color: '#f43f5e', border: '1px solid #f43f5e', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', width: '100%' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' };
const inputStyle = { width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' };
const closeBtn = { background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' };
const menuBtn = (active) => ({ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', backgroundColor: active ? '#0369a1' : 'transparent', color: active ? '#fff' : '#94a3b8', border: 'none', fontWeight: '700', cursor: 'pointer' });
