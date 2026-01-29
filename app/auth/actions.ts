// app/auth/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'  // versión server
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

  const supabase = await createClient()  // usa cookies automáticamente

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

  // Éxito → redirigir (o revalidar)
    revalidatePath('/protected')
    redirect('/protected/dashboard/moduloProyectos')
}