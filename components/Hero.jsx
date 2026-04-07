"use client"
import Image from 'next/image';
import styles from '../app/styles/Hero.module.css';



const Hero = ({ handleBuscarClick }) => {
    return (
        <header className={styles.header}>
            <div className={styles.headerMain}>
                {/* Contenido principal */}
                <div className={styles.contentOverlay}>
                
                    {/* Lado Izquierdo: Imagen Card */}
                    <div className={styles.headerImageCard}>
                        <Image
                        src="/image/logo.png"
                        alt="BUMI Logo"
                        width={200}
                        height={200}
                        className={styles.cardImage}
                        style={{ width: 'auto' }}
                        />
                    </div>

                    {/* Lado Derecho: Textos y Botón */}
                    <div className={styles.textSection}>
                        {/* Logo de Fondo con transparencia: Ahora dentro de textSection */}
                        <Image 
                        src='/image/logounefa2026.jpg' 
                        className={styles.logoFondo} 
                        alt="Fondo UNEFA"
                        width={800}
                        height={600}
                        />
                        <h1 className={styles.title}>BUSCADOR DE MATERIAL DE INVESTIGACIÓN</h1>
                        <p className={styles.description}>
                            Bumi es básicamente un Google Academy, para consultar los
                            trabajos de investigación hechos por la comunidad Unefista.
                        </p>
                    </div>

                    {/* Sección Inferior: Buscador */}
                    <div className={styles.headerSearchSection}>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="¿Qué necesitas buscar?"
                                aria-label="¿Qué necesitas buscar?"
                                aria-describedby="button-addon2"
                            />
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                id="button-addon2"
                                onClick={handleBuscarClick}
                            >
                                Buscar
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </header>
    );
};

export default Hero;