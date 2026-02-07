'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/BuscadorPrincipal.module.css';
import { listProjectsAction, searchProjectsAction, fetchAllAreasAction } from '@/app/protected/actions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BuscadorPrincipal = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState([]);
    const [showMoreYears, setShowMoreYears] = useState(false);

    const [areasInvestigacion, setAreasInvestigacion] = useState([]);


    const fetchAllAreas = useCallback(async () => {
        try {
            const areas = await fetchAllAreasAction();
            if (areas) setAreasInvestigacion(areas);
        } catch (err) {
            console.error('Error al cargar áreas de investigación:', err);
        }
    }, []);

    const fetchProjects = useCallback(async () => {
        try {
            const data = await listProjectsAction();
            const mappedProjects = (data || []).map(project => ({
                idproyecto: project.id,
                title: project.titulo,
                id_area_investigacion: project.id_area_investigacion,
                type: project.tipo_investigacion,
                pdf_url: project.pdf_url || '',
            }));
            setProjects(mappedProjects);
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
            alert('Error al cargar los proyectos');
        }
    }, []);

    useEffect(() => {
        fetchProjects();
        fetchAllAreas();
    }, [fetchProjects, fetchAllAreas]);

    const handleSearchClick = async () => {
        if (!searchTerm.trim()) {
            alert('Por favor, ingrese un título para buscar.');
            setProjects([]);
            return;
        }
        try {
            const data = await searchProjectsAction(searchTerm);
            if (!data || data.length === 0) {
                alert('No se encontró un proyecto con ese título.');
                setProjects([]);
            } else {
                const mappedProjects = data.map(project => ({
                    idproyecto: project.id,
                    title: project.titulo,
                    id_area_investigacion: project.id_area_investigacion,
                    type: project.tipo_investigacion,
                    pdf_url: project.pdf_url || '',
                }));
                setProjects(mappedProjects);
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
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <div className={styles.container}>
                <div className={styles.searchSection}>
                    <div className={styles.searchBar}>
                        
                        <div className="input-group mb-3">
                            <input type="text" className="form-control" value={searchTerm} onChange={handleSearchChange} aria-describedby="button-addon2"  />
                            <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleSearchClick}>Buscar</button>
                        </div>
                    </div>
                    <div className={styles.searchLinks}>
                        <button
                            type="button"
                            className={styles.searchLink}
                            data-bs-toggle="modal"
                            data-bs-target="#filtersModal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 2H4c-.55 0-1 .45-1 1v2c0 .22.07.43.2.6L9 13.33V21a1 1 0 0 0 1 1c.15 0 .31-.04.45-.11l4-2A1 1 0 0 0 15 19v-5.67l5.8-7.73c.13-.17.2-.38.2-.6V3c0-.55-.45-1-1-1m-1 2.67-5.8 7.73c-.13.17-.2.38-.2.6v5.38l-2 1V13c0-.22-.07-.43-.2-.6L5 4.67V4h14z" />
                            </svg>
                            <span>Filtrar</span>
                        </button>
                        <button
                            type="button"
                            className={styles.searchLink}
                            data-bs-toggle="modal"
                            data-bs-target="#advancedSearchModal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                            </svg>
                            <span>Búsqueda avanzada</span>
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div className={styles.resultsSection}>
                    <h2>{projects.length} Resultados Relacionados</h2>

                    <div className={styles.projectList}>
                        {projects.map(project => (
                            <div key={project.idproyecto} className={styles.projectItem}>

                                <div className={styles.projectContent}>
                                    <strong>{project.title}</strong>
                                    
                                    <p>Área de Investigación: {areasInvestigacion.find(a => a.id === project.id_area_investigacion)?.nomb_area || 'Cargando...'}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className={styles.filter}>
                                            Tipo de Investigación: {project.type}
                                        </span>
                                        <br />
                                        {project.pdf_url && (
                                            <a
                                                href={project.pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                                            >
                                                Ver PDF
                                            </a>
                                        )}
                                    </div>

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

            <Footer />
        </div>
    );
};

export default BuscadorPrincipal;
