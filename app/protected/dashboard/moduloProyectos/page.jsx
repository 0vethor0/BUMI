'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from '../../../styles/ModuloProyectos.module.css';
import PDFUploader from '../../../../components/logica_PDFdownload/PDFUploader';
import LogoutButton from '@/components/logout-button';

const ModuloProyectos = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [areasInvestigacion, setAreasInvestigacion] = useState([]);

    const [newRowData, setNewRowData] = useState({
        idproyecto: '',
        title: '',
        objectiveGeneral: '',
        objectivesSpecific: '',
        type: '',
        summary: '',
        pdfUrl: '', // <-- URL del PDF en Cloudflare R2
        id_area_investigacion: ''
    });

    const fetchAreas = useCallback(async () => {
        const supabase = createClient();
        try {
            const { data, error } = await supabase.from('tbareainvestigacion').select('*');
            if (error) throw error;
            setAreasInvestigacion(data);
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    }, []);

    const fetchProjects = useCallback(async () => {
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('tbproyecto')
                .select('*');
            
            if (error) throw error;

            const mappedProjects = data.map(project => ({
                idproyecto: project.id,
                title: project.titulo,
                objectiveGeneral: project.obj_general,
                objectivesSpecific: project.objetivos_especificos,
                summary: project.resumen,
                type: project.tipo_investigacion,
                authors: project.authors || 'TBD',
                pdfUrl: project.pdf_Url || '',
                id_area_investigacion: project.id_area_investigacion
            }));
            setProjects(mappedProjects);
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
            alert('Error al cargar los proyectos');
        }
    }, []);

    useEffect(() => {
        fetchProjects();
        fetchAreas();
    }, [fetchProjects, fetchAreas]);

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
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('tbproyecto')
                .select('*')
                .ilike('titulo', `%${searchTerm}%`);

            if (error) throw error;

            if (data.length === 0) {
                alert('No se encontró un proyecto con ese título.');
                setProjects([]);
            } else {
                const mappedProjects = data.map(project => ({
                    idproyecto: project.id,
                    title: project.titulo,
                    objectiveGeneral: project.obj_general,
                    objectivesSpecific: project.objetivos_especificos,
                    summary: project.resumen,
                    type: project.tipo_investigacion,
                    authors: project.authors || 'TBD',
                    pdfUrl: project.pdf_Url || ''
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
            pdfUrl: '',
            id_area_investigacion: ''
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
                pdfUrl: project.pdfUrl || '',
                id_area_investigacion: project.id_area_investigacion || ''
            });
            return;
        }

        // GUARDAR (nuevo o actualización)
        const requiredFields = ['title', 'objectiveGeneral', 'objectivesSpecific', 'type', 'summary', 'pdfUrl', 'id_area_investigacion'];
        const missing = requiredFields.find(field => !newRowData[field]?.toString().trim());
        if (missing) {
            alert('Todos los campos son obligatorios, incluyendo el PDF y el Área de Investigación.');
            return;
        }

        const supabase = createClient();

        try {
            const payload = {
                titulo: newRowData.title,
                obj_general: newRowData.objectiveGeneral,
                objetivos_especificos: newRowData.objectivesSpecific,
                resumen: newRowData.summary,
                tipo_investigacion: newRowData.type,
                pdf_Url: newRowData.pdfUrl,
                id_area_investigacion: parseInt(newRowData.id_area_investigacion)
            };

            if (selectedRowId === 'new-row') {
                const { error } = await supabase
                    .from('tbproyecto')
                    .insert([payload]);
                if (error) throw error;
                alert('Proyecto creado con éxito');
            } else {
                const { error } = await supabase
                    .from('tbproyecto')
                    .update(payload)
                    .eq('id', selectedRowId);
                if (error) throw error;
                alert('Proyecto actualizado con éxito');
            }

            await fetchProjects();
            setIsEditing(false);
            setSelectedRowId(null);
            setNewRowData({ idproyecto: '', title: '', objectiveGeneral: '', objectivesSpecific: '', type: '', summary: '', pdfUrl: '', id_area_investigacion: '' });
        } catch (error) {
            console.error('Error al guardar proyecto:', error);
            alert('Error al guardar el proyecto: ' + error.message);
        }
    };

    const handleDeleteClick = async () => {
        if (isEditing) {
            setIsEditing(false);
            setSelectedRowId(null);
            setNewRowData({ idproyecto: '', title: '', objectiveGeneral: '', objectivesSpecific: '', type: '', summary: '', pdfUrl: '', id_area_investigacion: '' });
            return;
        }

        if (!selectedRowId) {
            alert('Selecciona un proyecto para eliminar.');
            return;
        }

        if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
            const supabase = createClient();
            try {
                const { error } = await supabase
                    .from('tbproyecto')
                    .delete()
                    .eq('id', selectedRowId);
                
                if (error) throw error;

                fetchProjects();
                setSelectedRowId(null);
                alert('Proyecto eliminado');
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar');
            }
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
                        <li><Link href="/protected/dashboard/moduloTutores"><i className="fas fa-chalkboard-teacher"></i> <span>Tutores</span></Link></li>
                        <li><Link href="/protected/dashboard/moduloEstudiantes"><i className="fas fa-user-graduate"></i> <span>Estudiantes</span></Link></li>
                        <li><a href="#"><i className="fas fa-users"></i> <span>Grupos</span></a></li>
                        <li className={styles.active}><a href="#"><i className="fas fa-project-diagram"></i> <span>Proyectos</span></a></li>
                        <li><a href="#"><i className="fas fa-clipboard-list"></i> <span>Estado de Proyecto</span></a></li>
                    </ul>
                    <ul className={styles.logout}>
                        <li><a href="#"><i className="fas fa-cog"></i> <span>Configuración</span></a></li>
                        <li>
                            <i className="fas fa-sign-out-alt"></i> <span>Salir</span>
                            <LogoutButton />
                        </li>
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
                                        <label>Área de Investigación</label>
                                        <select
                                            className="form-select"
                                            name="id_area_investigacion"
                                            value={newRowData.id_area_investigacion}
                                            onChange={handleInputChange}
                                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                                        >
                                            <option value="">Seleccione Área</option>
                                            {areasInvestigacion.map(area => (
                                                <option key={area.id} value={area.id}>{area.nombre}</option>
                                            ))}
                                        </select>
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