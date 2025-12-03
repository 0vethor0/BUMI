// app/auth/login/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/Login.module.css';
import { supabase } from '@/lib/supabaseClient'; // ← Asegúrate de tener este archivo

const ExitIcon = () => (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8c-1.1 0-2 .9-2 2v4h2V5h8v14h-8v-4h-2v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
    </svg>
);

const Login = () => {
    const [isRegisterActive, setIsRegisterActive] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        });

        if (error) {
        setError(error.message === 'Invalid login credentials' 
            ? 'Usuario o contraseña incorrectos' 
            : error.message);
        setLoading(false);
        return;
        }

        // Login exitoso
        router.push('/dashboard/moduloProyectos');
    };

    const handleExit = () => {
        router.push('/');
    };

    return (
        <div className={styles.container} style={{ position: 'relative' }}>
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

        <div className={`${styles.wrapper} ${isRegisterActive ? styles.active : ''}`}>
            <span className={styles.bgAnimate}></span>
            <span className={styles.bgAnimate2}></span>

            {/* === FORMULARIO LOGIN === */}
            <div className={`${styles.formBox} ${styles.login} ${isRegisterActive ? styles.hidden : ''}`}>
            <h2 className={styles.animation} style={{ '--i': 0, '--j': 21 }}>BUMI</h2>
            
            <form onSubmit={handleLogin}>
                <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--i': 1, '--j': 22 }}>
                <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <label>Email</label>
                <i className="bx bx-user"></i>
                </div>

                <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--i': 2, '--j': 23 }}>
                <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <label>Contraseña</label>
                <i className="bx bx-lock"></i>
                </div>

                {error && <p style={{ color: 'red', fontSize: '14px', margin: '10px 0' }}>{error}</p>}

                <button
                type="submit"
                className={`${styles.btn} ${styles.animation}`}
                style={{ '--i': 3, '--j': 24 }}
                disabled={loading}
                >
                {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>

            <div className={`${styles.logregLink} ${styles.animation}`} style={{ '--i': 4, '--j': 25 }}>
                <p>Sistema de Coordinadores</p>
            </div>
            </div>

            {/* === TEXTO DECORATIVO === */}
            <div className={`${styles.infoText} ${styles.login} ${isRegisterActive ? styles.hidden : ''}`}>
            <h2 className={styles.animation} style={{ '--i': 0, '--j': 20 }}>
                ¡Bienvenido!
            </h2>
            <img
                src="/image/graduadoICON.png"
                className={styles.animation}
                style={{ '--i': 1, '--j': 21 }}
                alt="Graduado"
            />
            </div>
        </div>
        </div>
    );
    
};

export default Login;