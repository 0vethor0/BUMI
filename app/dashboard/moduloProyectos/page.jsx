'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import styles from '../../styles/ModuloProyectos.module.css';
import PDFUploader from '../../components/PDFUploader';

const ModuloProyectos = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [newRowData, setNewRowData] = useState({
        idproyecto: '',
        title: '',
        objectiveGeneral: '',
        objectivesSpecific: '',
        type: '',
        summary: '',
        pdfUrl: '' // <-- URL del PDF en Cloudflare R2
    });

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
                objectivesSpecific: project.objetivos_especificos,
                summary: project.resumen,
                type: project.tipoInvestigacion,
                authors: project.authors || 'TBD',
                pdfUrl: project.URL || ''
            }));
            setProjects(mappedProjects);
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
            alert('Error al cargar los proyectos');
        }
    };

    const handlePdfUploadSuccess = (publicUrl) => {
        setNewRowData(prev => ({ ...prev, pdfUrl: publicUrl }));
        alert('¡PDF subido exitosamente a Cloudflare R2!');
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
                    objectivesSpecific: project.objetivos_especificos,
                    summary: project.resumen,
                    type: project.tipoInvestigacion,
                    authors: project.authors || 'TBD',
                    pdfUrl: project.URL || ''
                }));
                setProjects(mappedProjects);
            }
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al buscar proyectos:', error);
            alert('Error al buscar proyectos');
        }
    };

    const handleResetSearch = () => {
        setSearchTerm('');
        fetchProjects();
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleProjectClick = (e, idproyecto) => {
        e.stopPropagation();
        if (isEditing) return;
        setSelectedRowId(idproyecto);
    };

    const handleNewClick = () => {
        if (isEditing) {
            alert('Termina o cancela la edición actual primero.');
            return;
        }
        setSelectedRowId('new-row');
        setIsEditing(true);
        setNewRowData({
            idproyecto: '',
            title: '',
            objectiveGeneral: '',
            objectivesSpecific: '',
            type: '',
            summary: '',
            pdfUrl: ''
        });
    };

    const handleModifyClick = async () => {
        if (!isEditing) {
            // Activar modo edición
            if (!selectedRowId) {
                alert('Selecciona un proyecto para modificar.');
                return;
            }
            const project = projects.find(p => p.idproyecto === selectedRowId);
            setIsEditing(true);
            setNewRowData({
                idproyecto: project.idproyecto,
                title: project.title,
                objectiveGeneral: project.objectiveGeneral || '',
                objectivesSpecific: project.objectivesSpecific || '',
                type: project.type,
                summary: project.summary,
                pdfUrl: project.pdfUrl || ''
            });
            return;
        }

        // GUARDAR (nuevo o actualización)
        const requiredFields = ['title', 'objectiveGeneral', 'objectivesSpecific', 'type', 'summary', 'pdfUrl'];
        const missing = requiredFields.find(field => !newRowData[field]?.trim());
        if (missing) {
            alert('Todos los campos son obligatorios, incluyendo el PDF.');
            return;
        }

        try {
            const payload = {
                Titulo: newRowData.title,
                objetivo_general: newRowData.objectiveGeneral,
                objetivos_especificos: newRowData.objectivesSpecific,
                resumen: newRowData.summary,
                tipoInvestigacion: newRowData.type,
                URL: newRowData.pdfUrl
            };

            if (selectedRowId === 'new-row') {
                await api.post('/crear_proyecto', payload);
                alert('Proyecto creado con éxito');
            } else {
                await api.put(`/actualizar_proyecto/${selectedRowId}`, payload);
                alert('Proyecto actualizado con éxito');
            }

            await fetchProjects();
            setIsEditing(false);
            setSelectedRowId(null);
            setNewRowData({ idproyecto: '', title: '', objectiveGeneral: '', objectivesSpecific: '', type: '', summary: '', pdfUrl: '' });
        } catch (error) {
            console.error('Error al guardar proyecto:', error);
            alert('Error al guardar el proyecto');
        }
    };

    const handleDeleteClick = () => {
        if (isEditing) {
            setIsEditing(false);
            setSelectedRowId(null);
            setNewRowData({ idproyecto: '', title: '', objectiveGeneral: '', objectivesSpecific: '', type: '', summary: '', pdfUrl: '' });
            return;
        }

        if (!selectedRowId) {
            alert('Selecciona un proyecto para eliminar.');
            return;
        }

        if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
            api.delete(`/eliminar_proyecto/${selectedRowId}`)
                .then(() => {
                    fetchProjects();
                    setSelectedRowId(null);
                    alert('Proyecto eliminado');
                })
                .catch(() => alert('Error al eliminar'));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRowData(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const getButtonText = (type) => {
        if (isEditing) return type === 'modify' ? 'Guardar' : 'Cancelar';
        return type === 'modify' ? 'Modificar' : 'Eliminar';
    };

    return (
        <div className={`${styles.container} ${sidebarCollapsed ? styles.collapsed : ''}`}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo} onClick={toggleSidebar}><i className="fas fa-bars"></i></div>
                    <span className={styles.appName}>Bumi Unefa</span>
                </div>
                <nav className={styles.sidebarNav}>
                    <ul>
                        <li><a href="#"><i className="fas fa-chart-line"></i> <span>Dashboard</span></a></li>
                        <li><Link href="/dashboard/moduloTutores"><i className="fas fa-chalkboard-teacher"></i> <span>Tutores</span></Link></li>
                        <li><Link href="/dashboard/moduloEstudiantes"><i className="fas fa-user-graduate"></i> <span>Estudiantes</span></Link></li>
                        <li><a href="#"><i className="fas fa-users"></i> <span>Grupos</span></a></li>
                        <li className={styles.active}><a href="#"><i className="fas fa-project-diagram"></i> <span>Proyectos</span></a></li>
                        <li><a href="#"><i className="fas fa-clipboard-list"></i> <span>Estado de Proyecto</span></a></li>
                    </ul>
                    <ul className={styles.logout}>
                        <li><a href="#"><i className="fas fa-cog"></i> <span>Configuración</span></a></li>
                        <li><Link href="/"><i className="fas fa-sign-out-alt"></i> <span>Salir</span></Link></li>
                    </ul>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1>Modulo de Proyectos</h1>
                    <div className={styles.headerIcons}>
                        <button className={styles.iconButton}><i className="fas fa-ellipsis-v"></i></button>
                        <button className={styles.iconButton}><i className="fas fa-bell"></i></button>
                        <div className={styles.headerProfile}><img src="/image/logo.png" alt="User Avatar" /></div>
                    </div>
                </header>

                {/* LISTADO DE PROYECTOS */}
                {!isEditing && (
                    <div className={styles.card}>
                        <div className={styles.searchBar}>
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Buscar por título..." value={searchTerm} onChange={handleSearchChange} />
                            <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleSearchClick}>Buscar</button>
                            <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleResetSearch}>Restablecer</button>
                        </div>

                        <div className={styles.projectList}>
                            {projects.map(project => (
                                <div
                                    key={project.idproyecto}
                                    className={`${styles.projectItem} ${selectedRowId === project.idproyecto ? styles.selected : ''}`}
                                    onClick={(e) => handleProjectClick(e, project.idproyecto)}
                                >
                                    <div className={styles.projectContent}>
                                        <strong>{project.title}</strong>{' '}
                                        {project.pdfUrl && (
                                            <a href={project.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                                                VER PDF
                                            </a>
                                        )}
                                        <p>{project.summary}</p>
                                        <span className={styles.filter}>Filtro por: {project.type}</span>
                                        <p>{project.authors}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.actions}>
                            <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleNewClick} disabled={isEditing}>Nuevo</button>
                            <button className={`${styles.button} ${styles.buttonOutline}`} onClick={handleModifyClick}>
                                {getButtonText('modify')}
                            </button>
                            <button className={`${styles.button} ${styles.buttonDanger}`} onClick={handleDeleteClick}>
                                {getButtonText('delete')}
                            </button>
                        </div>
                    </div>
                )}

                {/* FORMULARIO DE EDICIÓN / CREACIÓN */}
                {isEditing && (
                    <div className={styles.fullScreenForm}>
                        <header className={styles.header}>
                            <h1>{selectedRowId === 'new-row' ? 'Registro de Nuevo Proyecto' : 'Modificar Proyecto'}</h1>
                            <button className={styles.iconButton} onClick={handleDeleteClick}>
                                <i className="fas fa-times"></i>
                            </button>
                        </header>

                        <div className={styles.formCard}>
                            <div className={styles.formContainer}>
                                <div className={styles.formColumn}>
                                    <div className={styles.formGroup}>
                                        <label>Título</label>
                                        <input type="text" name="title" value={newRowData.title} onChange={handleInputChange} placeholder="Ingrese el Título del Proyecto" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Objetivo General</label>
                                        <input type="text" name="objectiveGeneral" value={newRowData.objectiveGeneral} onChange={handleInputChange} placeholder="Ingrese el Objetivo General" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Objetivos Específicos</label>
                                        <textarea name="objectivesSpecific" value={newRowData.objectivesSpecific} onChange={handleInputChange} rows="6" placeholder="Enumere los objetivos específicos..." />
                                    </div>
                                </div>

                                <div className={styles.formColumn}>
                                    <div className={styles.formGroup}>
                                        <label>Tipo de Investigación</label>
                                        <input type="text" name="type" value={newRowData.type} onChange={handleInputChange} placeholder="Ej: Cuantitativo, Cualitativo..." />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Resumen</label>
                                        <textarea name="summary" value={newRowData.summary} onChange={handleInputChange} rows="6" placeholder="Resumen del proyecto..." />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Documento PDF (Obligatorio)</label>
                                        <PDFUploader onUploadSuccess={handlePdfUploadSuccess} />

                                        {newRowData.pdfUrl && (
                                            <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded">
                                                <p className="text-green-800 font-medium">PDF subido correctamente</p>
                                                <a href={newRowData.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                                                    Abrir PDF en nueva pestaña
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button className={styles.saveButton} onClick={handleModifyClick}>
                                {getButtonText('modify')}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModuloProyectos;