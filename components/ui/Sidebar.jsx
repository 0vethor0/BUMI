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

    const handleToggle = () => {
        if (typeof onToggle === 'function') onToggle();
    };

    return (
        <div
            className={`${styles.sidebarWrapper} ${isCollapsed ? styles.sidebarWrapperCollapsed : ''}`}
            role="complementary"
            aria-label="Menú de navegación"
        >
            <nav className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <button
                        type="button"
                        className={styles.logo}
                        onClick={handleToggle}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleToggle();
                            }
                        }}
                        aria-label={isCollapsed ? 'Abrir menú lateral' : 'Cerrar menú lateral'}
                        title={isCollapsed ? 'Abrir menú' : 'Cerrar menú'}
                    >
                        <i className="bx bx-grid-alt" aria-hidden="true"></i>
                    </button>
                    <span className={styles.appName}>
                        Bumi-UNEFA
                    </span>
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
                
                
                <div className={styles.logout} style={{ padding: '10px' }}>
                    <LogoutButton />
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;