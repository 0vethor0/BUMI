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
      className="px-3 py-1 ml-3 bg-red-600 text-white rounded"
      disabled={loading}
      aria-label="Cerrar sesión"
    >
      {loading ? 'Cerrando...' : 'Cerrar sesión'}
    </button>
  );
}