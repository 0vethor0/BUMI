/**
 * Componente Sidebar (Barra Lateral).
 * Proporciona la navegación principal de la aplicación dentro del área protegida.
 * Utiliza 'use client' porque maneja estados e interactividad en el navegador.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/logout-button';
import styles from '../../app/styles/ModuloGrupos.module.css'; // Importa estilos compartidos

/**
 * @param {Object} props
 * @param {boolean} props.isCollapsed - Estado que indica si la barra lateral está contraída.
 * @param {Function} props.onToggle - Función para alternar el estado de expansión/contracción.
 */
const Sidebar = ({ isCollapsed, onToggle }) => {
    // Obtiene la ruta actual para resaltar el enlace activo.
    const pathname = usePathname();

    /**
     * Configuración de los enlaces de navegación.
     * Centraliza la definición de rutas, iconos y etiquetas para facilitar el mantenimiento.
     */
    const navLinks = [
        { href: '/protected/dashboard/moduloProyectos', icon: 'bx-layer', label: 'Dashboard' },
        { href: '/protected/dashboard/moduloTutores', icon: 'bx-user', label: 'Tutores' },
        { href: '/protected/dashboard/moduloEstudiantes', icon: 'bx-group', label: 'Estudiantes' },
        { href: '/protected/dashboard/moduloGrupos', icon: 'bx-grid', label: 'Grupos' },
        { href: '/protected/dashboard/moduloProyectos', icon: 'bx-folder', label: 'Proyectos' },
    ];

    /**
     * Manejador para alternar la visibilidad de la barra lateral.
     */
    const handleToggle = () => {
        if (typeof onToggle === 'function') onToggle();
    };

    return (
        <div
            // Aplica clases dinámicas basadas en el estado 'isCollapsed'.
            className={`${styles.sidebarWrapper} ${isCollapsed ? styles.sidebarWrapperCollapsed : ''}`}
            role="complementary"
            aria-label="Menú de navegación"
        >
            <nav className={styles.sidebar}>
                {/* Cabecera de la Sidebar con el Logo y botón de colapso */}
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
                        {/* Icono de menú hamburguesa / cuadrícula */}
                        <i className="bx bx-grid-alt" aria-hidden="true"></i>
                    </button>
                    {/* Nombre de la aplicación */}
                    <span className={styles.appName}>
                        Bumi-UNEFA
                    </span>
                </div>

                {/* Lista de enlaces de navegación */}
                <div className={styles.sidebarNav}>
                    <ul>
                        {navLinks.map((link) => (
                            <li
                                key={link.href + link.label}
                                // Marca como activa la opción si la ruta actual coincide con href.
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
                
                {/* Botón de cierre de sesión al final de la barra */}
                <div className={styles.logout} style={{ padding: '10px' }}>
                    <LogoutButton />
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;