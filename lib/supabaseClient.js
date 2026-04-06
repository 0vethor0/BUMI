/**
 * Importación del cliente base de Supabase.
 * Este archivo proporciona una instancia estática del cliente para casos de uso generales.
 */
import { createClient } from '@supabase/supabase-js';

/**
 * Instancia del cliente de Supabase exportada de forma constante.
 * Utiliza las variables de entorno para configurar la conexión.
 * 
 * @constant {SupabaseClient}
 */
export const supabase = createClient(
    // URL del proyecto de Supabase.
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    // Llave anónima para acceso público.
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);