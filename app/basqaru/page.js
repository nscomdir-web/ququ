// Универсальный парсер дат (понимает DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD, с нулями и без)
function parseDate(dateStr) {
  if (!dateStr) return null;
  let cleaned = dateStr.trim().replace(/^"|"$/g, '');
  if (!cleaned || cleaned === '0' || cleaned === '—') return null;

  // Формат DD.MM.YYYY или DD/MM/YYYY
  let match = cleaned.match(/^(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{2,4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    let year = match[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }

  // Формат YYYY-MM-DD или YYYY/MM/DD
  match = cleaned.match(/^(\d{4})[\.\/\-](\d{1,2})[\.\/\-](\d{1,2})$/);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}

// Универсальный парсер времени
function parseTime(timeStr) {
  if (!timeStr) return null;
  let cleaned = timeStr.trim().replace(/^"|"$/g, '');
  if (!cleaned || cleaned === '0' || cleaned === '—') return null;

  const match = cleaned.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    const hours = match[1].padStart(2, '0');
    const minutes = match[2];
    const seconds = match[3] || '00';
    return `${hours}:${minutes}:${seconds}`;
  }
  return null;
}

// Обработчик загрузки файла
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const text = e.target.result;
    const lines = text.split('\n').map(row => row.trim()).filter(Boolean);
    if (lines.length < 2) return alert('Файл пуст или некорректен');

    // Авто-определение разделителя (точка с запятой Excel или обычная запятая)
    const delimiter = lines[0].includes(';') ? ';' : ',';

    const newExams = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(delimiter).map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 2) {
        const rawPrice = cols[7] ? parseFloat(cols[7].replace(/[^\d.]/g, '')) : 0;
        const isActive = cols[8] ? cols[8].toLowerCase() === 'true' : true;

        newExams.push({
          title: cols[0],
          exam_date: parseDate(cols[1]),
          exam_time: parseTime(cols[2]),
          reg_start_date: parseDate(cols[3]),
          reg_start_time: parseTime(cols[4]),
          reg_end_date: parseDate(cols[5]),
          reg_end_time: parseTime(cols[6]),
          price: isNaN(rawPrice) ? 0 : rawPrice,
          is_active: isActive
        });
      }
    }

    if (newExams.length > 0) {
      const { error } = await supabase.from('exams').insert(newExams);
      if (!error) {
        alert('Тесты успешно загружены!');
        loadAllData();
      } else {
        alert('Ошибка базы данных: ' + error.message);
      }
    } else {
      alert('Не удалось распарсить строки файла');
    }
  };
  reader.readAsText(file, 'UTF-8');
};
