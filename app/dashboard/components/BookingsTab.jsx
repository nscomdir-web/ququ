'use client';

export default function BookingsTab({ bookings, openTicketFromBooking }) {
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#f8fafc' }}>Менің броньдарым</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {bookings.length === 0 ? (
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
            <p style={{ color: '#94a3b8', margin: 0 }}>Әзірге белсенді броньдар жоқ.</p>
          </div>
        ) : (
          bookings.map((item) => {
            const exam = item.exams || {};
            const student = item.students || {};
            const hasResult = item.result_score !== null && item.result_score !== undefined;

            return (
              <div 
                key={item.id} 
                style={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155', 
                  borderRadius: '12px', 
                  padding: '20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap', 
                  gap: '16px' 
                }}
              >
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
                    <button 
                      onClick={() => alert(`Тест нәтижесі: ${item.result_score}`)} 
                      style={{ backgroundColor: '#0369a1', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                    >
                      📊 Нәтиже: {item.result_score}
                    </button>
                  ) : (
                    <button 
                      disabled 
                      style={{ backgroundColor: '#334155', color: '#64748b', cursor: 'not-allowed', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', fontSize: '13px' }}
                    >
                      📊 Нәтиже әлі жоқ
                    </button>
                  )}

                  <button 
                    onClick={() => openTicketFromBooking(item)} 
                    style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                  >
                    🎟️ Тестке кіру қағазы
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
