'use client';

export default function TestsTab({ exams, setRegisterModal }) {
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#f8fafc' }}>Қолжетімді тесттер</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {exams.map((exam) => {
          const isActive = exam.is_active === true;
          return (
            <div 
              key={exam.id} 
              style={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155', 
                borderRadius: '12px', 
                padding: '20px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap', 
                gap: '16px', 
                opacity: isActive ? 1 : 0.6 
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#fff' }}>{exam.title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                  Күні: {exam.exam_date || '—'} | Уақыты: {exam.exam_time || '—'} | Мекен-жайы: {exam.address || '—'} | Бағасы: {exam.price} ₸
                </p>
              </div>
              <div>
                {isActive ? (
                  <button 
                    onClick={() => setRegisterModal(exam)} 
                    style={{ 
                      backgroundColor: '#0284c7', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '10px 18px', 
                      borderRadius: '8px', 
                      fontWeight: '700', 
                      cursor: 'pointer', 
                      display: 'inline-flex', 
                      alignItems: 'center' 
                    }}
                  >
                    Тіркелу
                  </button>
                ) : (
                  <span style={{ backgroundColor: '#475569', color: '#cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                    Жабық
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
