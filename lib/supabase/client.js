/**
 * Importación de createBrowserClient de @supabase/ssr.
 * Esta herramienta se utiliza para inicializar el cliente de Supabase en el lado del cliente (navegador).
 */
import { createBrowserClient } from '@supabase/ssr'

/**
 * Función que crea una instancia del cliente de Supabase para su uso en componentes de cliente (use client).
 * Configura la conexión usando las variables de entorno públicas.
 * 
 * @returns {SupabaseClient} Una instancia del cliente de Supabase configurada para el navegador.
 */
export function createClient() {
  return createBrowserClient(
    // La URL de tu proyecto de Supabase.
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    // La llave pública (anon key) que permite el acceso desde el frontend.
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
  );
}
