import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({ children }) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getClaims()

    if (error || !data?.claims) {
        // no autenticado -> forzar login
        redirect('/auth/login')
    }

    // autenticado -> renderizar las páginas hijas dentro de /protected
    return <>{children}</>
}