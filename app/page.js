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

export default function Home() {
  const [supabase] = useState(() => getSupabaseClient());
  const [exams, setExams] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'register' or 'login'
  const [activeModal, setActiveModal] = useState(null);

  // Поля формы регистрации / входа
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
@@ -37,12 +36,11 @@
    fetchExams();
  }, [supabase]);

  // Чистая асинхронная функция регистрации (профиль создается через триггер в базе)
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthMsg('');

    // Регистрация: Supabase сам отправит письмо со ссылкой подтверждения,
    // а триггер в БД автоматически создаст запись в profiles с is_active: false
    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
@@ -63,33 +61,6 @@
    setAuthMsg('Сәтті! Электронды почтаңызға растау сілтемесі жіберілді. Почтаңызды тексеріп, сілтеме арқылы кіріңіз.');
  };

    if (error) {
      setAuthMsg('Қате: ' + error.message);
      return;
    }

    // 2. Сразу записываем данные в таблицу public.profiles из браузера
    if (data?.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          name: regName,
          phone: regPhone,
          is_active: false,
          is_teacher: false
        }
      ]);

      if (profileError) {
        setAuthMsg('Қате (Профиль): ' + profileError.message);
        return;
      }
    }

    setAuthMsg('Сәтті! Электронды почтаңызға растау сілтемесі жіберілді. Почтаңызды тексеріңіз.');
  };

  // Функция входа в личный кабинет через логин и пароль
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthMsg('');
@@ -109,7 +80,6 @@
  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

      {/* Шапка */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '1px', color: '#38bdf8' }}>
          QUQU<span style={{ color: '#f43f5e' }}>.</span>
@@ -122,7 +92,6 @@
        </nav>
      </header>

      {/* Баннер */}
      <section style={{ maxWidth: '1200px', margin: '40px auto 20px auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Тестілеу орталығына қош келдіңіздер</h1>
@@ -134,7 +103,6 @@
        </div>
      </section>

      {/* Таблица тестов */}
      <main style={{ maxWidth: '1200px', margin: '30px auto 60px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '20px', textTransform: 'uppercase', marginBottom: '20px', color: '#f8fafc', fontWeight: '700' }}>Қолжетімді тесттер тізімі</h2>
@@ -193,7 +161,6 @@
        </div>
      </main>

      {/* Модальное окно авторизации/регистрации */}
      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid #334155', boxSizing: 'border-box' }}>
@@ -253,4 +220,4 @@
const thStyle = { padding: '16px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' };
const tdStyle = { padding: '16px', color: '#cbd5e1' };
const inputStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', padding: '12px 16px', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
const labelStyle = { display: 'block', divider: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' };
const labelStyle = { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' };
