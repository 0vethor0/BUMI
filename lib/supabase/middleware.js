/**
 * Importación del cliente de servidor de Supabase y las herramientas de respuesta de Next.js.
 * El middleware se encarga de gestionar la sesión y proteger las rutas.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server';

/**
 * Función que actualiza la sesión del usuario en cada solicitud.
 * También gestiona las redirecciones basadas en el estado de autenticación.
 * 
 * @param {NextRequest} request - Objeto que representa la solicitud HTTP actual.
 * @returns {NextResponse} Respuesta HTTP modificada con las cookies de sesión actualizadas.
 */
export async function updateSession(request) {
  // Inicializa la respuesta predeterminada (continuar con la solicitud).
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Crea una instancia del cliente de servidor de Supabase para manejar cookies en el middleware.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    {
      cookies: {
        /**
         * Método para obtener todas las cookies de la solicitud.
         */
        getAll() {
          return request.cookies.getAll();
        },
        /**
         * Método para actualizar todas las cookies.
         * Sincroniza las cookies entre la solicitud original y la respuesta que se enviará.
         */
        setAll(cookiesToSet) {
          // Actualiza las cookies en el objeto de solicitud.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Crea una nueva respuesta con la solicitud actualizada.
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Establece las nuevas cookies en el objeto de respuesta.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  /**
   * Obtiene la información del usuario (claims) a través de la sesión de Supabase.
   * Es crucial realizar esta verificación para mantener la sesión activa.
   */
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  /**
   * Lógica de protección de rutas:
   * Si no hay un usuario autenticado y la ruta NO es pública (como login, auth o buscador),
   * redirige al usuario a la página de inicio de sesión.
   */
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/buscador') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url);
  }

  /**
   * Redirección inversa:
   * Si el usuario YA está autenticado e intenta acceder a rutas de autenticación (como login),
   * lo redirige automáticamente al área protegida (dashboard).
   */
  if(user && request.nextUrl.pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/protected'
    return NextResponse.redirect(url);
  }

  // Retorna la respuesta con las cookies de sesión actualizadas.
  return supabaseResponse
}
