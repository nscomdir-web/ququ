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

export default function TeacherLoginPage() {
  const [supabase] = useState(() => getSupabaseClient());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    async function checkExistingSession() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_teacher')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.is_teacher === true) {
          setIsTeacher(true);
        } else {
          await supabase.auth.signOut();
        }
      }
      setLoading(false);
    }

    checkExistingSession();
  }, [supabase]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      setErrorMsg('Email немесе құпия сөз қате!');
      setLoading(false);
      return;
    }

    console.log("Auth User ID:", authData.session.user.id);

    // Делаем запрос и выводим результат в консоль браузера
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_teacher')
      .eq('id', authData.session.user.id)
      .single();

    console.log("Profile Data from DB:", profile);
    console.log("Profile Error:", profileError);

    if (profileError || !profile || profile.is_teacher !== true) {
      await supabase.auth.signOut();
      setErrorMsg(`Сізге кіруге рұқсат жоқ! (Қате: ${profileError?.message || 'Мәлімет табылмады'})`);
      setLoading(false);
      return;
    }

    setIsTeacher(true);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsTeacher(false);
    setEmail('');
    setPassword('');
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '18px', fontWeight: 'bold' }}>
        Жүктелуде...
      </div>
    );
  }

  if (isTeacher) {
    return (
      <div style={{ padding: '40px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>👨‍🏫 Мұғалімнің басқару панелі</h1>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Шығу
          </button>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <p style={{ color: '#94a3b8', margin: 0 }}>Қош келдіңіз! Бұл бет тек мұғалімдерге арналған.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '16px', border: '1px solid #334155', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
          Мұғалім ретінде кіру
        </h2>

        {errorMsg && (
          <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #f87171', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center', fontWeight: '600' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ backgroundColor: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box', fontSize: '14px' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Құпия сөз (Пароль)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ backgroundColor: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box', fontSize: '14px' }} 
            />
          </div>

          <button type="submit" style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', width: '100%', marginTop: '8px' }}>
            Кіру
          </button>
        </form>
      </div>
    </div>
  );
}
