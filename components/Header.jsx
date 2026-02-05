"use client";
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../app/styles/Header.module.css';


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

return (
    <header className={styles.header}>
        <div className={styles.container}>
            <div className={styles.logoSection}>
                
                <Link href="/" className={styles.logoLink}> 
                    
                        <Image
                        src="/image/logoBUMI.png"
                        alt="Logo BUMI"
                        width={40}
                        height={40}
                        className={styles.logoImage}
                        />
                    
                </Link>
                
                <div className={styles.logoText}>
                    <h1>BUMI</h1>
                    <div className={styles.pilarVertical}></div>
                    <span className={styles.logoDivider}></span>
                    <span className={styles.logoSubtext}>
                        Buscador de material de<br />
                        investigación de la UNEFA Yaracuy
                    </span>
                </div>
            </div>

            <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
                <Link href="#manual" className={styles.navLink}>Manual del Usuario</Link>
                <Link href="#contacto" className={styles.navLink}>Contacto</Link>
                <div className={styles.authButtons}>
                    <Link href="/auth/sign-up" className="btn-register">Register</Link>
                    <Link href="/auth/login" className="btn-login">Login</Link>
                </div>
            </nav>

            <button
                className={styles.menuToggle}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
    </header>
);
};

export default Header;
