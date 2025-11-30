'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/Login.module.css';

const ExitIcon = () => (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8c-1.1 0-2 .9-2 2v4h2V5h8v14h-8v-4h-2v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
    </svg>
);

const Login = () => {
    const [isRegisterActive, setIsRegisterActive] = useState(false);
    const router = useRouter();

    const handleRegisterClick = (e) => {
        e.preventDefault();
        setIsRegisterActive(true);
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        setIsRegisterActive(false);
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

                <div className={`${styles.formBox} ${styles.login} ${isRegisterActive ? styles.hidden : ''}`}>
                    <h2 className={styles.animation} style={{ '--i': 0, '--j': 21 }}>BUMI</h2>
                    <div>
                        <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--i': 1, '--j': 22 }}>
                            <input type="text" required />
                            <label>Usuario</label>
                            <i className="bx bx-user"></i>
                        </div>
                        <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--i': 2, '--j': 23 }}>
                            <input type="password" required />
                            <label>Contraseña</label>
                            <i className="bx bx-lock"></i>
                        </div>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.animation}`}
                            style={{ '--i': 3, '--j': 24 }}
                            onClick={() => router.push('/moduloEstudiantes')}
                        >
                            Ingresar
                        </button>
                        <div className={`${styles.logregLink} ${styles.animation}`} style={{ '--i': 4, '--j': 25 }}>
                            <p>
                                ¿No tienes cuenta?{' '}
                                <a href="#" onClick={handleRegisterClick}>
                                    Registrarse
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

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

                <div className={`${styles.formBox} ${styles.register} ${isRegisterActive ? '' : styles.hidden}`}>
                    <h2 className={styles.animation} style={{ '--i': 17, '--j': 0 }}>
                        Registro
                    </h2>
                    <div>
                        <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--i': 18, '--j': 1 }}>
                            <input type="text" required />
                            <label>Usuario</label>
                            <i className="bx bx-user"></i>
                        </div>
                        <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--i': 19, '--j': 2 }}>
                            <input type="text" required />
                            <label>Email</label>
                            <i className="bx bx-envelope"></i>
                        </div>
                        <div className={`${styles.inputBox} ${styles.animation}`} style={{ '--i': 20, '--j': 3 }}>
                            <input type="password" required />
                            <label>Contraseña</label>
                            <i className="bx bx-lock"></i>
                        </div>
                        <button type="button" className={`${styles.btn} ${styles.animation}`} style={{ '--i': 21, '--j': 4 }}>
                            Registrarse
                        </button>
                        <div className={`${styles.logregLink} ${styles.animation}`} style={{ '--i': 22, '--j': 5 }}>
                            <p>
                                ¿Ya tienes cuenta?{' '}
                                <a href="#" onClick={handleLoginClick}>
                                    Ingresar
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                <div className={`${styles.infoText} ${styles.register} ${isRegisterActive ? '' : styles.hidden}`}>
                    <h2 className={styles.animation} style={{ '--i': 17, '--j': 0 }}>
                        BUMI
                    </h2>
                    <img
                        src="/image/graduadoICON.png"
                        className={styles.animation}
                        style={{ '--i': 18, '--j': 1 }}
                        alt="Graduado"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;

