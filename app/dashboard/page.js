'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Импортируем наши новые компоненты
import ProfileTab from './components/ProfileTab';
import StudentsTab from './components/StudentsTab';
import TestsTab from './components/TestsTab';
import BookingsTab from './components/BookingsTab';
import TicketModal from './components/TicketModal';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  let rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) rawUrl = `https://${rawUrl}`;
  return createClient(rawUrl, rawKey);
}

// ... (Функция downloadPDF остается прежней, она может быть вынесена в utils, но пока оставим здесь для простоты)
const downloadPDF = (ticket) => { /* ... код функции downloadPDF из вашего оригинала ... */ };

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

  // ... (Ваши функции: checkAuthAndLoadData, loadBookings, handleLogout, handleUpdateProfile, handleAddStudent, handleDeleteStudent, handlePayment, openTicketFromBooking — все остаются здесь для управления логикой)

  if (loading) return <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '18px', fontWeight: 'bold' }}>Жүктелуде...</div>;

  return (
    <div className="dashboard-layout" style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'grid', gridTemplateColumns: '260px 1fr', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ backgroundColor: '#1e293b', borderRight: '1px solid #334155', padding: '24px' }}>
        {/* ... (Ваше меню остается без изменений) */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setActiveTab('profile')} style={menuBtn(activeTab === 'profile')}>👤 Профиль</button>
            <button onClick={() => setActiveTab('students')} style={menuBtn(activeTab === 'students')}>🎓 Оқушылар</button>
            <button onClick={() => setActiveTab('tests')} style={menuBtn(activeTab === 'tests')}>📝 Тесттер</button>
            <button onClick={() => setActiveTab('bookings')} style={menuBtn(activeTab === 'bookings')}>🎟️ Броньдар</button>
        </nav>
      </aside>

      <main style={{ padding: '32px', overflowY: 'auto' }}>
        {activeTab === 'profile' && <ProfileTab user={user} setUser={setUser} onUpdate={handleUpdateProfile} />}
        {activeTab === 'students' && <StudentsTab students={students} setShowAddStudentModal={setShowAddStudentModal} handleDeleteStudent={handleDeleteStudent} />}
        {activeTab === 'tests' && <TestsTab exams={exams} setRegisterModal={setRegisterModal} />}
        {activeTab === 'bookings' && <BookingsTab bookings={bookings} openTicketFromBooking={openTicketFromBooking} />}
      </main>

      {/* Модалки (можно позже также вынести в отдельные файлы) */}
      {ticketModal && <TicketModal ticketModal={ticketModal} setTicketModal={setTicketModal} downloadPDF={downloadPDF} />}
      
      {/* ... (остальные модалки: addStudentModal, registerModal) */}
    </div>
  );
}

const menuBtn = (active) => ({ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', backgroundColor: active ? '#0369a1' : 'transparent', color: active ? '#fff' : '#94a3b8', border: 'none', fontWeight: '700', cursor: 'pointer' });
