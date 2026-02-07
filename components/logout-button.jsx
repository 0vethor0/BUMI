'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        alert('Error al cerrar sesión');
        setLoading(false);
        return;
      }
      // Redirigir al login
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      alert('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="btn btn-outline-secondary"
      disabled={loading}
      aria-label="Salir"
    >
      {loading ? 'Cerrando...' : 'Salir'}
    </button>
  );
}