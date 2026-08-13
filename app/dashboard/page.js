// --- DOWNLOAD PDF / PRINT FUNCTION ---
const downloadPDF = (ticket) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QUQU - Тестке кіру қағазы (A4)</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background: #e2e8f0; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .a4-page { width: 210mm; height: 297mm; padding: 15mm; box-sizing: border-box; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; position: relative; page-break-after: always; }
            .ticket-card { border: 2px solid #0284c7; border-radius: 20px; background: #ffffff; padding: 30px; box-sizing: border-box; width: 100%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
            .brand-title { font-size: 28px; font-weight: 900; color: #0284c7; letter-spacing: -0.5px; }
            .brand-subtitle { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .badge-code { background: #f0f9ff; border: 1px solid #bae6fd; padding: 8px 16px; border-radius: 10px; font-size: 14px; font-weight: 800; color: #0369a1; }
            .student-section { display: flex; flex-direction: column; align-items: center; text-align: center; background: #f8fafc; padding: 24px; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
            .student-photo { width: 120px; height: 150px; object-fit: cover; border-radius: 10px; border: 2px solid #cbd5e1; background: #e2e8f0; margin-bottom: 14px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; background: #f8fafc; padding: 20px; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
            .detail-item { display: flex; flex-direction: column; }
            .detail-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
            .detail-value { font-size: 15px; font-weight: 700; color: #0f172a; }
            .footer-row { display: flex; flex-direction: column; align-items: center; text-align: center; background: #ffffff; padding: 20px; border-radius: 14px; border: 1px solid #e2e8f0; }
            .qr-code { width: 140px; height: 140px; margin-bottom: 8px; }
            .warning-box { background: #fff1f2; border: 1px solid #fecdd3; color: #be123c; padding: 14px; border-radius: 12px; font-size: 12px; font-weight: 700; text-align: center; margin-top: 20px; }
            .instructions { margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 20px; font-size: 11px; color: #64748b; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="a4-page">
            <div class="ticket-card">
              <div class="header-row">
                <div>
                  <div class="brand-title">QUQU</div>
                  <div class="brand-subtitle">Тестке қатысудың ресми өткізу қағазы</div>
                </div>
                <div class="badge-code">Бронь коды: ${ticket.uniqueCode}</div>
              </div>
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
              <div class="info-grid">
                <div class="detail-item"><span class="detail-label">Тест атауы</span><span class="detail-value">${ticket.examTitle}</span></div>
                <div class="detail-item"><span class="detail-label">Бағыты / Форматы</span><span class="detail-value" style="color: #0284c7;">${ticket.schoolType} — ${ticket.examFormat}</span></div>
                <div class="detail-item"><span class="detail-label">Өтетін күні мен уақыты</span><span class="detail-value">${ticket.examDate} (${ticket.examTime})</span></div>
                <div class="detail-item"><span class="detail-label">Мекен-жайы (Classroom)</span><span class="detail-value">${ticket.classroom || 'Көрсетілмеген'}</span></div>
              </div>
              <div class="footer-row">
                <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.uniqueCode)}" alt="QR" />
                <div style="font-size: 16px; font-weight: 800; color: #0284c7; letter-spacing: 1px;">${ticket.uniqueCode}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Бақылаушы үшін тексеру коды</div>
              </div>
              <div class="warning-box">
                ⚠️ НАЗАР АУДАРЫҢЫЗ! Тестке келерде осы қағазды басып шығарып (немесе телефоннан көрсетіп) және қатысушының жеке басын куәландыратын құжатын (туу туралы куәлік / паспорт) өзіңізбен бірге міндетті түрде әкеліңіз!
              </div>
            </div>
            <div class="instructions">
              <b>Қосымша ақпарат:</b> Бұл құжат QUQU білім беру платформасы арқылы автоматты түрде генерацияланды. Тіркеу күні: ${ticket.date || '—'}.
            </div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
};
