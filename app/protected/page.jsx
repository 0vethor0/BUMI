// ...existing code...
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedIndexPage() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getClaims()

    // Si supabase responde con error o no hay claims -> forzar login
    if (error) {
      console.error('Supabase getClaims error:', error)
      redirect('/auth/login')
    }

    if (!data?.claims) {
      // No autenticado
      redirect('/auth/login')
    }

    // Usuario autenticado -> redirigir al módulo por defecto
    redirect('/protected/dashboard/moduloProyectos')
  } catch (err) {
    // Si la excepción es la redirección controlada por Next (NEXT_REDIRECT),
    // relanzarla para que Next la procese correctamente en lugar de tratarla como error.
    if (err?.digest && String(err.digest).includes('NEXT_REDIRECT')) {
      throw err
    }

    // Captura errores inesperados del servidor y muestra UI amigable
    console.error('Error verificando sesión en /protected:', err)
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-md shadow-md p-6">
          <h1 className="text-xl font-semibold mb-2">Error del servidor</h1>
          <p className="mb-4">
            Ocurrió un problema al verificar tu sesión. Intenta recargar la página o volver a iniciar sesión.
          </p>
          <div className="flex gap-3">
            <Link href="/auth/login" className="px-3 py-2 bg-blue-600 text-white rounded">
              Ir a Login
            </Link>
            <Link href="/" className="px-3 py-2 border rounded">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }
}
// ...existing code...