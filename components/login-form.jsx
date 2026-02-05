// components/LoginForm.jsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import styles from '@/app/styles/Login.module.css'
import Link from 'next/link';
import Image from 'next/image';
import { loginAction } from '@/app/auth/actions';
import LogicaMostrarPass from './LogicaMostrarPass'

const initialState = { error: null }

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState)
  const { pending: isPending } = useFormStatus()

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      {/* Botón salir */}
      <button
        onClick={() => (window.location.href = '/')}
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
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8c-1.1 0-2 .9-2 2v4h2V5h8v14h-8v-4h-2v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
        </svg>
      </button>

      <div className={styles.wrapper}>
        <span className={styles.bgAnimate}></span>
        <span className={styles.bgAnimate2}></span>

        <div className={`${styles.formBox} ${styles.login}`}>
          <h2 className={styles.animation} style={{ '--i': 0, '--j': 21 }}>
            BUMI
          </h2>

          <form action={formAction}>
            <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--i': 1, '--j': 22 }}>
              <input id="email" name="email" type="email" required autoComplete="email" />
              <label htmlFor="email">Email</label>
              <i className="bx bx-user"></i>
            </div>

            <LogicaMostrarPass
              id="password"
              name="password"
              placeholder="Contraseña"
              required
              className={`${styles.inputBox} ${styles.animation}`}
              style={{ '--i': 2, '--j': 23 }}
            >
              <Link
                href="/auth/forgot-password"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                style={{ fontSize: '13px', marginTop: '8px', display: 'block', textAlign: 'right' }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </LogicaMostrarPass>

            {state?.error && (
              <p style={{ color: 'red', fontSize: '14px', margin: '10px 0', textAlign: 'center' }}>
                {state.error}
              </p>
            )}
            

            <button
              type="submit"
              className={`${styles.btn} ${styles.animation}`}
              style={{ '--i': 3, '--j': 24 }}
              disabled={isPending}
            >
              {isPending ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className={`${styles.logregLink} ${styles.animation}`} style={{ '--i': 4, '--j': 25 }}>
            <p>
              ¿No tienes una cuenta?{' '}
              <Link href="/auth/sign-up" style={{ color: '#0958ce', fontWeight: 600 }}>
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        <div className={`${styles.infoText} ${styles.login}`}>
          <h2 className={styles.animation} style={{ '--i': 0, '--j': 20 }}>
            ¡Bienvenido!
          </h2>
          <Image
            src="/image/graduadoICON.png"
            width={120}
            height={120}
            className={styles.animation}
            style={{ '--i': 1, '--j': 21 }}
            alt="Graduado"
          />
        </div>
      </div>
    </div>
  )
}