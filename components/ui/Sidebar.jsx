'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/logout-button';
import styles from '../../app/styles/ModuloGrupos.module.css'; // Asegúrate de que la ruta sea correcta

const Sidebar = ({ isCollapsed, onToggle }) => {
    const pathname = usePathname();

    // Configuración de los enlaces para facilitar el mantenimiento
    const navLinks = [
        { href: '/protected/dashboard/moduloProyectos', icon: 'bx-layer', label: 'Dashboard' },
        { href: '/protected/dashboard/moduloTutores', icon: 'bx-user', label: 'Tutores' },
        { href: '/protected/dashboard/moduloEstudiantes', icon: 'bx-group', label: 'Estudiantes' },
        { href: '/protected/dashboard/moduloGrupos', icon: 'bx-grid', label: 'Grupos' },
        { href: '/protected/dashboard/moduloProyectos', icon: 'bx-folder', label: 'Proyectos' },
    ];

    return (
        <nav className={`${styles.sidebar} ${isCollapsed ? styles.collapsedSidebar : ''}`}>
            <div className={styles.sidebarHeader}>
                <div className={styles.logo} onClick={onToggle}>
                    <i className="bx bx-grid-alt"></i>
                </div>
                <span className={styles.appName}>Bumi Unefa</span>
            </div>
            
            <div className={styles.sidebarNav}>
                <ul>
                    {navLinks.map((link) => (
                        <li 
                            key={link.href + link.label} 
                            className={pathname === link.href ? styles.active : ''}
                        >
                            <Link href={link.href}>
                                <i className={`bx ${link.icon}`}></i>
                                <span>{link.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={styles.logout}>
                <LogoutButton />
            </div>
        </nav>
    );
};

export default Sidebar;