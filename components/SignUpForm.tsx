// components/SignUpForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/app/styles/Login.module.css'   // ← mismo archivo CSS que usa login
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import LogicaMostrarPass from './LogicaMostrarPass'

export function SignUpForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== repeatPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        const supabase = createClient()
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/protected/dashboard/moduloProyectos`,
                },
            })
            if (error) throw error
            // Puedes redirigir a una página de "verifica tu email" o dashboard
            router.push('/auth/sign-up-success') // o donde prefieras
        } catch (err: any) {
            setError(err.message || 'Error al crear la cuenta')
        } finally {
            setLoading(false)
        }
    }

    const handleExit = () => {
        router.push('/app/buscador/page.jsx')
    }

    const ExitIcon = () => (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8c-1.1 0-2 .9-2 2v4h2V5h8v14h-8v-4h-2v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
        </svg>
    )

    return (
        <div className={styles.container} style={{ position: 'relative' }}>
            {/* Botón salir (igual que en login) */}
            <button
                onClick={handleExit}
                style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 10,
                    padding: 4,
                }}
                aria-label="Salir"
            >
                <ExitIcon />
            </button>

            {/* Wrapper principal – mismo que login */}
            <div className={styles.wrapper}>
                <span className={styles.bgAnimate}></span>
                <span className={styles.bgAnimate2}></span>

                {/* === FORMULARIO SIGN UP (lado izquierdo) === */}
                <div className={`${styles.formBox} ${styles.login}`}>
                    <h2
                        className={styles.animation}
                        style={{ '--i': 0, '--j': 21 } as React.CSSProperties}
                    >
                        REGISTRAR NUEVO ADMIN
                    </h2>

                    <form onSubmit={handleSignUp}>
                        <div
                            className={`${styles.inputBox} ${styles.animation}`}
                            style={{ '--i': 1, '--j': 22 } as React.CSSProperties}
                        >
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <label htmlFor="email">Correo Electrónico</label>
                            <i className="bx bx-user"></i>
                        </div>

                        <LogicaMostrarPass
                            id="password"
                            placeholder="Contraseña"
                            required
                            value={password}
                            onChange={(e: any) => setPassword(e.target.value)}
                            className={`${styles.inputBox} ${styles.animation}`}
                            style={{ '--i': 2, '--j': 23 } as React.CSSProperties}
                        />

                        <LogicaMostrarPass
                            id="repeat-password"
                            placeholder="Repita su Contraseña"
                            required
                            value={repeatPassword}
                            onChange={(e: any) => setRepeatPassword(e.target.value)}
                            className={`${styles.inputBox} ${styles.animation}`}
                            style={{ '--i': 3, '--j': 24 } as React.CSSProperties}
                        />

                        {error && (
                            <p style={{ color: 'red', fontSize: '14px', margin: '10px 0' }}>
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className={`${styles.btn} ${styles.animation}`}
                            style={{ '--i': 4, '--j': 25 } as React.CSSProperties}
                            disabled={loading}
                        >
                            {loading ? 'Creando cuenta...' : 'Registrarse'}
                        </button>
                    </form>

                    <div
                        className={`${styles.logregLink} ${styles.animation}`}
                        style={{ '--i': 5, '--j': 26 } as React.CSSProperties}
                    >
                        <p>
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/app/auth/login/page.jsx" style={{ color: '#0958ce', fontWeight: 600 }}>
                                Iniciar sesión
                            </Link>
                        </p>
                    </div>
                </div>

                {/* === PANEL DERECHO DECORATIVO (igual que login) === */}
                <div className={`${styles.infoText} ${styles.login}`}>
                    <img
                        src="/image/graduadoICON.png"
                        className={styles.animation}
                        style={{ '--i': 1, '--j': 21 } as React.CSSProperties}
                        alt="Graduado"
                    />
                </div>
            </div>
        </div>
    )
}