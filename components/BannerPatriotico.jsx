'use client';

import Image from 'next/image';
import styles from '../app/styles/BannerPatriotico.module.css';

const BannerPatriotico = () => {
    return (
        <div className={styles.container}>
            <Image 
                src="/image/bannerUnefaMejorado.png" 
                alt="Banner UNEFA" 
                width={1200}
                height={300}
                className={styles.bannerImage} 
            /> 
        </div>
    );
}

export default BannerPatriotico;