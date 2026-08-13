'use client';

export default function StudentsTab({ 
  students, 
  setShowAddStudentModal, 
  handleDeleteStudent 
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc' }}>Оқушылар тізімі</h2>
        <button 
          onClick={() => setShowAddStudentModal(true)} 
          style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
        >
          + Оқушы қосу
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {students.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Әзірге оқушылар қосылмаған.</p>
        ) : (
          students.map((s) => (
            <div key={s.id} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                <button 
                  onClick={() => alert('Өзгерту функциясы')} 
                  style={{ backgroundColor: '#0369a1', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                >
                  Өзгерту
                </button>
                <button 
                  onClick={() => handleDeleteStudent(s.id)} 
                  style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                >
                  Жою
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
