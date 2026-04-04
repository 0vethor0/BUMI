/**
 * Importaciones necesarias para configurar el cliente de Supabase en el servidor.
 * @supabase/ssr proporciona herramientas para manejar autenticación en Next.js con Server Components.
 * next/headers permite acceder a las cookies de la solicitud actual.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Función asíncrona para crear una instancia del cliente de Supabase configurada para el servidor.
 * Esta función debe llamarse dentro de Server Components, Server Actions o Route Handlers.
 * 
 * NOTA: No almacenar este cliente en una variable global para evitar fugas de contexto entre solicitudes.
 */
export async function createClient() {
  // Obtiene el almacén de cookies de la cabecera de la solicitud actual.
  const cookieStore = await cookies()

  // Crea y retorna el cliente de servidor de Supabase.
  return createServerClient(
    // URL del proyecto Supabase (definida en variables de entorno).
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    // Llave pública (anon key) del proyecto Supabase.
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    { 
      // Configuración de persistencia mediante cookies.
      cookies: {
        /**
         * Método para obtener todas las cookies del almacén.
         * Supabase lo usa para leer el token de sesión.
         */
        getAll() {
          return cookieStore.getAll();
        },
        /**
         * Método para establecer múltiples cookies.
         * Se usa para actualizar la sesión (refresh token).
         */
        setAll(cookiesToSet) {
          try {
            // Itera sobre cada cookie y la guarda en el almacén de Next.js.
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {
            /**
             * El método `setAll` puede fallar si se llama desde un Server Component (que es de solo lectura).
             * Esto es normal y se ignora si existe un middleware que refresque las sesiones.
             */
          }
        },
      },
    }
  );
}
