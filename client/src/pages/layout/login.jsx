import React, { useState } from 'react';
import styles from '../styles/Login.module.css';
import graduadoICON from '../../image/graduadoICON.png';

const Login = () => {
    const [isRegisterActive, setIsRegisterActive] = useState(false);

    const handleRegisterClick = (e) => {
        e.preventDefault();
        setIsRegisterActive(true);
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        setIsRegisterActive(false);
    };

    return (
        <div className={styles.container}>
        <div className={`${styles.wrapper} ${isRegisterActive ? styles.active : ''}`}>
            {/* Background animation spans */}
            <span className={styles.bgAnimate}></span>
            <span className={styles.bgAnimate2}></span>

            {/* Login Form */}
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
                <button type="button" className={`${styles.btn} ${styles.animation}`} style={{ '--i': 3, '--j': 24 }}>
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

            {/* Login Info Text */}
            <div className={`${styles.infoText} ${styles.login} ${isRegisterActive ? styles.hidden : ''}`}>
            <h2 className={styles.animation} style={{ '--i': 0, '--j': 20 }}>
                ¡Bienvenido!
            </h2>
            <img
                src={graduadoICON}
                className={styles.animation}
                style={{ '--i': 1, '--j': 21 }}
            />
            </div>

            {/* Register Form */}
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

            {/* Register Info Text */}
            <div className={`${styles.infoText} ${styles.register} ${isRegisterActive ? '' : styles.hidden}`}>
            <h2 className={styles.animation} style={{ '--i': 17, '--j': 0 }}>
                BUMI
            </h2>
            <img
                src={graduadoICON}
                className={styles.animation}
                style={{ '--i': 18, '--j': 1 }}
            />
            </div>
        </div>
        </div>
    );
};

export default Login;