"use client"
import styles from '../app/styles/Hero.module.css';

const Hero = () => {
    return (
        <header className={styles.header}>
            <div className={styles.headerMain}>
                {/* Capa de fondo: Logo UNEFA */}
                <img 
                src='/image/logounefa2026.jpg' 
                className={styles.logoFondo} 
                alt="Fondo UNEFA"
                />

                {/* Contenido principal */}
                <div className={styles.contentOverlay}>
                
                    {/* Lado Izquierdo: Imagen Card */}
                    <div className={styles.headerImageCard}>
                        <img
                        src="/image/logo.png"
                        alt="BUMI Logo"
                        className={styles.cardImage}
                        />
                    </div>

                    {/* Lado Derecho: Textos y Botón */}
                    <div className={styles.textSection}>
                        <a href="#" className={styles.btnJoinNow}>Únete Ahora</a>
                        <h1 className={styles.title}>BUSCADOR DE MATERIAL DE INVESTIGACIÓN</h1>
                        <p className={styles.description}>
                            Bumi es básicamente un Google Academy, para consultar los
                            trabajos de investigación hechos por la comunidad Unefista.
                        </p>
                    </div>

                    {/* Sección Inferior: Buscador */}
                    <div className={styles.headerSearchSection}>
                        <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="¿Qué necesitas buscar?"
                            className={styles.input}
                        />
                        <button className={styles.searchButton}>Buscar</button>
                        </div>
                    </div>

                </div>

            </div>
        </header>
    );
};

export default Hero;