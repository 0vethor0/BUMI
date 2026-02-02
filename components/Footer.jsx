import { Facebook, Github, Instagram, Linkedin, Youtube } from 'lucide-react';
import Link from 'next/link';
import styles from '../app/styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandSection}>
            <h1 className={styles.logo}>BUMI</h1>
            <p className={styles.brandText}>
              Para más información o soporte técnico
              referirse al Repositorio del System Manager del proyecto:
              <Link href="https://github.com/0vethor0/BUMI" className={styles.githubLink}>Vincent Fernandez</Link> 
            </p>
            <div className={styles.socialLinks}>
              <a href="https://portafolio-vincent-dev.vercel.app" className={styles.socialIcon} aria-label="Website">
                <Linkedin size={16} />
              </a>
              <a href="#" className={styles.socialIcon} aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="#" className={styles.socialIcon} aria-label="Youtube">
                <Youtube size={16} />
              </a>
            </div>
          </div>
          <div className={styles.linkSection}>
            <h4 className={styles.linkTitle}>Desarrolladores</h4>
            <ul className={styles.linkList}>
              <li><a href="#">Yender Graterol</a></li>
              <li><a href="#">Kristan Colmenarez</a></li>
              <li><a href="#">Rhenzo Lopez</a></li>
              <li><a href="#">Francisco Dominguez</a></li>
              <li><a href="#">Anliu Alizo</a></li>
            </ul>
          </div>
          <div className={styles.linkSection}>
            <h4 className={styles.linkTitle}>Comunidad Unefista</h4>
            <ul className={styles.linkList}>
              <li><a href="#">Eventos</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Podcast</a></li>
              <li><a href="#">UneFit.com</a></li>
            </ul>
          </div>
          <div className={styles.linkSection}>
            <h4 className={styles.linkTitle}>Redes Sociales</h4>
            <ul className={styles.linkList}>
              <li><a href="#">Discord</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Facebook</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>© copyright 2026. Elaborado por y para los estudiantes de la UNEFA (2-2025)</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
