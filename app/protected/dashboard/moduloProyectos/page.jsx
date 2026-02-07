'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from '../../../styles/ModuloProyectos.module.css';
import PDFUploader from '../../../../components/logica_PDFdownload/PDFUploader';
import Sidebar from '@/components/ui/Sidebar';
import {
    getUserAreaAction,
    fetchAllAreasAction,
    listProjectsAction,
    searchProjectsAction,
    saveProjectAction,
    deleteProjectAction
} from '@/app/protected/actions';

export const dynamic = 'force-dynamic'

const ModuloProyectos = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- NUEVOS ESTADOS PARA EL ÁREA DEL USUARIO ---
    const [userAreaId, setUserAreaId] = useState(null);
    const [userAreaName, setUserAreaName] = useState('Cargando...');
    const [areasInvestigacion, setAreasInvestigacion] = useState([]);

    const [newRowData, setNewRowData] = useState({
        id: '',
        titulo: '',
        obj_general: '',
        objetivos_especificos: '',
        tipo_investigacion: '',
        resumen: '',
        pdf_url: '',
        id_area_investigacion: ''
    });

    // --- FUNCIÓN PARA OBTENER EL ÁREA DEL USUARIO LOGUEADO ---
    const fetchUserArea = useCallback(async () => {
        try {
            const { id, name } = await getUserAreaAction();
            setUserAreaId(id);
            setUserAreaName(name);
        } catch (err) {
            console.error('Error al obtener área del usuario:', err);
            setUserAreaName('Error al cargar área');
        }
    }, []);

    // Cargamos todas las áreas solo para visualización en la tabla/lista
    const fetchAllAreas = useCallback(async () => {
        const areas = await fetchAllAreasAction();
        if (areas) setAreasInvestigacion(areas);
    }, []);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listProjectsAction();
            setProjects(data);
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
        fetchAllAreas(); 
        fetchUserArea(); // Obtener el área del usuario al iniciar
    }, [fetchProjects, fetchAllAreas, fetchUserArea]);

    // Cerrar sidebar automáticamente en viewport <= 765px
    useEffect(() => {
        const checkWidth = () => {
            if (typeof window !== 'undefined' && window.innerWidth <= 765) {
                setSidebarCollapsed(true);
            }
        };
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    const handlePdfUploadSuccess = (publicUrl) => {
        setNewRowData(prev => ({ ...prev, pdf_url: publicUrl }));
        alert('¡PDF subido exitosamente!');
    };

    const handleSearchClick = async () => { // funcion para buscar proyectos por titulo, resumen o tipo de investigacion
        if (!searchTerm.trim()) {
            fetchProjects();
            return;
        }
        setLoading(true);
        try {
            const data = await searchProjectsAction(searchTerm);
            setProjects(data);
        } catch (error) {
            alert('Error al buscar proyectos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetSearch = () => {// funcion para limpiar el input de busqueda
        setSearchTerm('');
        fetchProjects();
    };

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    const handleProjectClick = (e, id) => {// funcion para seleccionar un proyecto
        e.stopPropagation();
        if (isEditing) return;
        setSelectedRowId(id);
    };

    const handleNewClick = () => {// funcion para crear un nuevo proyecto
        if (isEditing) {
            alert('Termina o cancela la edición actual primero.');
            return;
        }

        // Validación de seguridad: debe tener área asignada
        if (!userAreaId) {
            alert('No puedes crear proyectos porque no tienes un área de investigación asignada.');
            return;
        }

        setSelectedRowId('new-row');
        setIsEditing(true);
        setNewRowData({
            id: '',
            titulo: '',
            obj_general: '',
            objetivos_especificos: '',
            tipo_investigacion: '',
            resumen: '',
            pdf_url: '',
            id_area_investigacion: userAreaId // Asignación automática
        });
        
    };

    const handleModifyClick = async () => {
        if (!isEditing) {
            if (!selectedRowId) {
                alert('Selecciona un proyecto para modificar.');
                return;
            }
            const project = projects.find(p => p.id === selectedRowId);

            // SEGURIDAD: Solo permitir editar si el proyecto es del área del usuario
            if (project.id_area_investigacion !== userAreaId) {
                alert(`No tienes permiso para modificar este proyecto. Pertenece a el área: ${areasInvestigacion.find(a => a.id === project.id_area_investigacion)?.nomb_area || 'Otra'}`);
                return;
            }

            setIsEditing(true);
            setNewRowData({
                ...project,
                id_area_investigacion: project.id_area_investigacion
            });
            return;
        }
        

        // Validación de campos
        const requiredFields = ['titulo'];
        const missing = requiredFields.find(field => !newRowData[field]?.toString().trim());
        if (missing) {
            alert(`El campo "${missing}" es obligatorio.`);
            return;
        }

        setLoading(true);

        try {
            const payload = {
                titulo: newRowData.titulo,
                obj_general: newRowData.obj_general,
                objetivos_especificos: newRowData.objetivos_especificos,
                resumen: newRowData.resumen,
                tipo_investigacion: newRowData.tipo_investigacion,
                pdf_url: newRowData.pdf_url,
                id_area_investigacion: userAreaId // Forzar el área del usuario logueado
            };

            await saveProjectAction(selectedRowId, payload);

            alert('Operación exitosa');
            await fetchProjects();
            setIsEditing(false);
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error: ' + (error.message || 'No tienes permisos para realizar esta acción.'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = async () => {
        if (isEditing) {
            setIsEditing(false);
            setSelectedRowId(null);
            return;
        }

        if (!selectedRowId) {
            alert('Selecciona un proyecto para eliminar.');
            return;
        }

        const project = projects.find(p => p.id === selectedRowId);
        if (project.id_area_investigacion !== userAreaId) {
            alert('No tienes permiso para eliminar proyectos de otras áreas.');
            return;
        }

        if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
            setLoading(true);
            try {
                await deleteProjectAction(selectedRowId);
                await fetchProjects();
                setSelectedRowId(null);
                alert('Proyecto eliminado');
            } catch (error) {
                alert('Error al eliminar: ' + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRowData(prev => ({ ...prev, [name]: value }));
    };

    const getButtonText = (type) => {
        if (isEditing) return type === 'modify' ? 'Guardar' : 'Cancelar';
        return type === 'modify' ? 'Modificar' : 'Eliminar';
    };

    return (
        <div className={`${styles.container} ${sidebarCollapsed ? styles.collapsed : ''}`}>
            {/* Sidebar (Sin cambios significativos) */}
            <Sidebar 
                isCollapsed={sidebarCollapsed} 
                onToggle={toggleSidebar} 
            />

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1>Modulo de Proyectos</h1>
                    <div className={styles.headerIcons}>
                        <div className={styles.headerProfile} title={`Área: ${userAreaName}`}>
                            <span className="mr-2 text-sm font-bold text-blue-700">{userAreaName}</span>
                            <Image src="/image/logo.png" alt="User" width={32} height={32} />
                        </div>
                    </div>
                </header>

                {!isEditing && (
                    <div className={styles.card}>

                        <div className="input-group mb-3">
                            <input type="text" 
                            className="form-control" 
                            placeholder="Buscar por título o resumen..." 
                            aria-label="Buscar por título o resumen..." 
                            aria-describedby="button-addon2" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleSearchClick} disabled={loading}>Buscar</button>
                            <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleResetSearch} disabled={loading}>Limpiar</button>
                        </div>

                    

                        {loading ? (
                            <p className="text-center py-8">Cargando...</p>
                        ) : (
                            <div className={styles.projectList}>
                                {projects.map(project => (
                                    <div
                                        key={project.id}
                                        className={`${styles.projectItem} ${selectedRowId === project.id ? styles.selected : ''}`}
                                        onClick={(e) => handleProjectClick(e, project.id)}
                                    >
                                        <div className={styles.projectContent}>
                                            <strong>{project.titulo}</strong>
                                            <p className="text-sm text-gray-600">
                                                Área: {areasInvestigacion.find(a => a.id === project.id_area_investigacion)?.nomb_area || 'Cargando...'}
                                            </p>
                                            <span className={styles.filter}>{project.tipo_investigacion}</span>
                                            {project.pdf_url && (
                                                <a 
                                                    href={project.pdf_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-blue-600 underline text-sm ml-4"
                                                >
                                                    Ver PDF
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleNewClick} disabled={loading}>Nuevo</button>
                            <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleModifyClick} disabled={loading}>{getButtonText('modify')}</button>
                            <button className="btn btn-outline-danger" type="button" onClick={handleDeleteClick} disabled={loading}>{getButtonText('delete')}</button>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <div className={styles.fullScreenForm}>
                        <header className={styles.header}>
                            <h1>{selectedRowId === 'new-row' ? 'Nuevo Proyecto' : 'Editar Proyecto'}</h1>
                        </header>

                        <div className={styles.formCard}>
                            <div className={styles.formContainer}>
                                <div className={styles.formColumn}>
                                    <div className={styles.formGroup}>
                                        <label>Título *</label>
                                        <input type="text" name="titulo" value={newRowData.titulo} onChange={handleInputChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Resumen *</label>
                                        <textarea name="resumen" value={newRowData.resumen} onChange={handleInputChange} rows="4" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Objetivo General *</label>
                                        <textarea name="obj_general" value={newRowData.obj_general} onChange={handleInputChange} rows="3" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Objetivos Específicos *</label>
                                        <textarea name="objetivos_especificos" value={newRowData.objetivos_especificos} onChange={handleInputChange} rows="4" />
                                    </div>
                                </div>

                                <div className={styles.formColumn}>
                                    <div className={styles.formGroup}>
                                        <label>Tipo de Investigación *</label>
                                        <input type="text" name="tipo_investigacion" value={newRowData.tipo_investigacion} onChange={handleInputChange} />
                                    </div>

                                    {/* --- INPUT READONLY PARA EL ÁREA --- */}
                                    <div className={styles.formGroup}>
                                        <label>Área de Investigación (Asignada automáticamente)</label>
                                        <input 
                                            type="text" 
                                            value={userAreaName} 
                                            readOnly 
                                            style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                        />
                                        <input type="hidden" name="id_area_investigacion" value={userAreaId || ''} />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Documento PDF *</label>
                                        <PDFUploader onUploadSuccess={handlePdfUploadSuccess} />
                                        {newRowData.pdf_url && (
                                            <>
                                                <p className="text-xs text-green-600">PDF listo para guardar</p>
                                                <iframe src={newRowData.pdf_url} style={{ width: '100%', height: '500px' }}></iframe>
                                            </>
                                        )}
                                        
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button className={styles.saveButton} onClick={handleModifyClick} disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar Proyecto'}
                                </button>
                                <button className={styles.button} onClick={() => { setIsEditing(false); setSelectedRowId(null); }}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModuloProyectos;
