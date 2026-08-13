'use client';

export default function TicketModal({ ticketModal, setTicketModal, downloadPDF }) {
  if (!ticketModal) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ color: '#38bdf8', fontSize: '18px', margin: 0 }}>🎟️ Тестке кіру қағазы</h3>
          <button onClick={() => setTicketModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>
        
        <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'left', marginBottom: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ width: '55px', height: '70px', borderRadius: '8px', backgroundColor: '#334155', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {ticketModal.photoUrl ? <img src={ticketModal.photoUrl} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : '👤'}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 3px 0', fontSize: '15px', color: '#fff' }}>{ticketModal.studentName}</h4>
            <p style={{ margin: '2px 0', fontSize: '12px', color: '#94a3b8' }}>ЖСН (ИИН): <b>{ticketModal.iin}</b></p>
            <p style={{ margin: '2px 0', fontSize: '12px', color: '#94a3b8' }}>Оқушы коды: <span style={{color: '#38bdf8', fontWeight: 'bold'}}>{ticketModal.studentCode}</span></p>
            <p style={{ margin: '2px 0', fontSize: '12px', color: '#94a3b8' }}>Тілі: <span style={{color: '#fff', fontWeight: 'bold'}}>{ticketModal.language}</span></p>
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
          ⚠️ Назар аударыңыз! Тестке келгенде осы қағазды және туу туралы куәлікті өзіңізбен бірге міндетті түрде әкеліңіз!
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => downloadPDF(ticketModal)} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>📥 PDF жүктеу / Баспа</button>
          <button onClick={() => setTicketModal(null)} style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px', flex: 1 }}>Жабу</button>
        </div>
      </div>
    </div>
  );
}
