'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import styles from '../styles/BuscadorPrincipal.module.css';

const BuscadorPrincipal = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState([]);
    const [showMoreYears, setShowMoreYears] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/consultar_todos_los_proyectos/');
            const mappedProjects = response.data.map(project => ({
                idproyecto: project.idproyecto,
                title: project.Titulo,
                objectiveGeneral: project.objetivo_general,
                summary: project.resumen,
                type: project.tipoInvestigacion
            }));
            setProjects(mappedProjects);
            console.log('Proyectos cargados:', mappedProjects);
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
            alert('Error al cargar los proyectos');
        }
    };

    const handleSearchClick = async () => {
        if (!searchTerm.trim()) {
            alert('Por favor, ingrese un título para buscar.');
            setProjects([]);
            return;
        }
        try {
            const response = await api.get(`/buscar_proyecto_titulo?busqueda=${searchTerm}`);
            if (response.data.message === 'No se encontraron proyectos con ese título') {
                alert('No se encontró un proyecto con ese título.');
                setProjects([]);
            } else {
                const mappedProjects = response.data.map(project => ({
                    idproyecto: project.idproyecto,
                    title: project.Titulo,
                    objectiveGeneral: project.objetivo_general,
                    summary: project.resumen,
                    type: project.tipoInvestigacion
                }));
                setProjects(mappedProjects);
                console.log('Resultados de búsqueda:', mappedProjects);
            }
        } catch (error) {
            console.error('Error al buscar proyectos:', error);
            alert('Error al buscar proyectos');
        }
    };

    const handleResetSearch = () => {
        setSearchTerm('');
        fetchProjects();
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const toggleShowMoreYears = () => {
        setShowMoreYears(!showMoreYears);
    };

    return (
        <div>
            <header className={styles.header}>
                <div className={styles.headerContainer}>
                    <div className={styles.headerLeft}>
                        <img src="/image/logo.png" alt="Logo" className={styles.logo} />
                        <h1 className={styles.title}>BUMI</h1>
                    </div>
                    <div className={styles.headerRight}>
                        <a href="#" className={styles.headerLink}>Manual de Usuario</a>
                        <span>|</span>
                        <a href="#" className={styles.headerLink}>Contacto</a>
                        <Link href="/auth/login" className={styles.headerButton}>Register</Link>
                        <Link href="/auth/login" className={styles.headerButton}>Log In</Link>
                    </div>
                </div>
            </header>

            <div className={styles.container}>
                <div className={styles.searchSection}>
                    <div className={styles.searchBar}>
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className={styles.searchInput}
                        />
                        <button
                            className={`${styles.button} ${styles.buttonSecondary}`}
                            onClick={handleSearchClick}
                        >
                            Buscar
                        </button>
                        <button
                            className={`${styles.button} ${styles.buttonSecondary}`}
                            onClick={handleResetSearch}
                        >
                            Restablecer
                        </button>
                        <button
                            className={`${styles.button} ${styles.buttonSecondary}`}
                            data-bs-toggle="modal"
                            data-bs-target="#filtersModal"
                        >
                            Filtros
                        </button>
                        <button
                            className={`${styles.button} ${styles.buttonSecondary}`}
                            data-bs-toggle="modal"
                            data-bs-target="#advancedSearchModal"
                        >
                            Búsqueda Avanzada
                        </button>
                    </div>
                </div>

                <div className={styles.resultsSection}>
                    <h2>{projects.length} Resultados Relacionados</h2>
                    <div className={styles.projectList}>
                        {projects.map(project => (
                            <div key={project.idproyecto} className={styles.projectItem}>
                                <div className={styles.projectContent}>
                                    <strong>{project.title}</strong>
                                    <p><strong>Objetivo General:</strong> {project.objectiveGeneral}</p>
                                    <p><strong>Resumen:</strong> {project.summary}</p>
                                    <span className={styles.filter}>Tipo de Investigación: {project.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.pagination}>
                        <button>&lt; Anterior</button>
                        <span>1 2 3 4 5 6 7 8 9 ...</span>
                        <button>Siguiente &gt;</button>
                    </div>
                </div>

                {/* Filters Modal */}
                <div className="modal fade" id="filtersModal" tabIndex="-1" aria-labelledby="filtersModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="filtersModalLabel">Filtros</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className={styles.filters}>
                                    <div className={styles.filterGroup}>
                                        <h3>Filtrar por:</h3>
                                        <div className={styles.filterItem}>
                                            <label>Año:</label>
                                            <select>
                                                <option>todos las fechas</option>
                                                <option>2026</option>
                                                <option>2025</option>
                                                <option>2024</option>
                                                {showMoreYears && (
                                                    <>
                                                        <option>2023</option>
                                                        <option>2022</option>
                                                        <option>2021</option>
                                                    </>
                                                )}
                                            </select>
                                            <a href="#" onClick={toggleShowMoreYears}>
                                                {showMoreYears ? 'Mostrar menos' : 'Mostrar mas'}
                                            </a>
                                        </div>

                                        <div className={styles.filterItem}>
                                            <label>Tipo de área de investigación:</label>
                                            <select>
                                                <option>todos los tipos</option>
                                                <option>Trabajo especial de grado</option>
                                                <option>Trabajo especial de posgrado</option>
                                                <option>Trabajo de servicio comunitario</option>
                                                <option>Trabajos de pasantias</option>
                                            </select>
                                        </div>

                                        <div className={styles.filterItem}>
                                            <label>Tipo de carrera:</label>
                                            <select>
                                                <option>todos los tipos</option>
                                                <option>Ing en Sistemas</option>
                                                <option>Ing Civil</option>
                                                <option>Ing Industrial</option>
                                                <option>Licenciatura en Educación</option>
                                            </select>
                                            <a href="#">Mostrar mas</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className={`${styles.cancelButton}`} data-bs-dismiss="modal">Cerrar</button>
                                <button type="button" className={`${styles.searchButton}`}>Aplicar Filtros</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Search Modal */}
                <div className="modal fade" id="advancedSearchModal" tabIndex="-1" aria-labelledby="advancedSearchModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="advancedSearchModalLabel">Búsqueda Avanzada</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className={styles.advancedSearchForm}>
                                    <div className={styles.formGroup}>
                                        <label>Buscar artículos con las siguiente palabras:</label>
                                        <input type="text" placeholder="..." />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Buscar artículos a partir del tipo de área de investigacion:</label>
                                        <select>
                                            <option>todos los tipos</option>
                                            <option>Trabajo especial de grado</option>
                                            <option>Trabajo especial de posgrado</option>
                                            <option>Trabajo de servicio comunitario</option>
                                            <option>Trabajos de pasantias</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Buscar artículo con el siguiente autor:</label>
                                        <input type="text" placeholder="..." />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Buscar artículo con el siguiente Tutor:</label>
                                        <input type="text" placeholder="..." />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Buscar por Período académico. Ej: 2-2024:</label>
                                        <input type="text" placeholder="..." />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Buscar por Carrera:</label>
                                        <select>
                                            <option>Seleccione</option>
                                            <option>Ing en Sistemas</option>
                                            <option>Ing Civil</option>
                                            <option>Ing Industrial</option>
                                            <option>Licenciatura en Educación</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className={`${styles.cancelButton}`} data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" className={`${styles.searchButton}`}>Buscar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuscadorPrincipal;

