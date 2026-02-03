'use client';

import styles from '../app/styles/BannerPatriotico.module.css';

const BannerPatriotico = () => {
    return (
        
            <div className={styles.container}>
                <img 
                    src="/image/bannerUnefaMejorado.png" 
                    alt="Banner UNEFA" 
                    className={styles.bannerImage} 
                /> 
            </div>
        
    );
}

export default BannerPatriotico;