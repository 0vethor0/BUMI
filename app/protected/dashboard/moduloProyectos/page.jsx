'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from '../../../styles/ModuloProyectos.module.css';
import PDFUploader from '../../../../components/logica_PDFdownload/PDFUploader';
import Sidebar from '@/components/ui/Sidebar';



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
        const supabase = createClient();
        try {
            // 1. Llamar a la función RPC para obtener el ID del área del admin
            const { data: areaId, error: rpcError } = await supabase.rpc('get_user_area');

            if (rpcError) throw rpcError;
            
            if (areaId === null) {
                console.warn('El usuario no tiene un área asignada.');
                setUserAreaName('Sin área asignada');
                return;
            }

            setUserAreaId(areaId);

            // 2. Obtener el nombre del área para mostrarlo en la UI
            const { data: areaData, error: areaError } = await supabase
                .from('tbareainvestigacion')
                .select('nomb_area')
                .eq('id', areaId)
                .single();

            if (areaError) throw areaError;
            setUserAreaName(areaData?.nomb_area || 'Área no encontrada');

        } catch (err) {
            console.error('Error al obtener área del usuario:', err);
            setUserAreaName('Error al cargar área');
        }
    }, []);

    // Cargamos todas las áreas solo para visualización en la tabla/lista
    const fetchAllAreas = useCallback(async () => {
        const supabase = createClient();
        const { data } = await supabase.from('tbareainvestigacion').select('id, nomb_area');
        if (data) setAreasInvestigacion(data);
    }, []);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('tbproyecto')
                .select(`*`);
            
            if (error) throw error;

            const mappedProjects = data.map(project => ({
                ...project,
                titulo: project.titulo || '',
                resumen: project.resumen || '',
                pdf_url: project.pdf_url || ''
            }));

            setProjects(mappedProjects);
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

    const handlePdfUploadSuccess = (publicUrl) => {
        setNewRowData(prev => ({ ...prev, pdf_url: publicUrl }));
        alert('¡PDF subido exitosamente!');
    };

    const handleSearchClick = async () => {
        if (!searchTerm.trim()) {
            fetchProjects();
            return;
        }
        setLoading(true);
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('tbproyecto')
                .select(`*`)
                .or(`titulo.ilike.%${searchTerm}%,resumen.ilike.%${searchTerm}%,tipo_investigacion.ilike.%${searchTerm}%`);

            if (error) throw error;
            setProjects(data);
        } catch (error) {
            alert('Error al buscar proyectos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetSearch = () => {
        setSearchTerm('');
        fetchProjects();
    };

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    const handleProjectClick = (e, id) => {
        e.stopPropagation();
        if (isEditing) return;
        setSelectedRowId(id);
    };

    const handleNewClick = () => {
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
        const requiredFields = ['titulo', 'obj_general', 'objetivos_especificos', 'tipo_investigacion', 'resumen', 'pdf_url'];
        const missing = requiredFields.find(field => !newRowData[field]?.toString().trim());
        if (missing) {
            alert(`El campo "${missing}" es obligatorio.`);
            return;
        }

        const supabase = createClient();
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

            let error;
            if (selectedRowId === 'new-row') {
                ({ error } = await supabase.from('tbproyecto').insert([payload]));
            } else {
                ({ error } = await supabase.from('tbproyecto').update(payload).eq('id', selectedRowId));
            }

            if (error) throw error;

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
            const supabase = createClient();
            setLoading(true);
            try {
                const { error } = await supabase.from('tbproyecto').delete().eq('id', selectedRowId);
                if (error) throw error;
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
                            <img src="/image/logo.png" alt="User" />
                        </div>
                    </div>
                </header>

                {!isEditing && (
                    <div className={styles.card}>
                        <div className={styles.searchBar}>
                            <input 
                                type="text" 
                                placeholder="Buscar por título o resumen..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                            <button className={styles.button} onClick={handleSearchClick} disabled={loading}>Buscar</button>
                            <button className={styles.button} onClick={handleResetSearch}>Restablecer</button>
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button className={styles.button} onClick={handleNewClick} disabled={loading}>Nuevo</button>
                            <button className={styles.button} onClick={handleModifyClick} disabled={loading}>{getButtonText('modify')}</button>
                            <button className={styles.button} onClick={handleDeleteClick} disabled={loading}>{getButtonText('delete')}</button>
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
                                        <label>Objetivo General *</label>
                                        <textarea name="obj_general" value={newRowData.obj_general} onChange={handleInputChange} rows="3" />
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
                                        {newRowData.pdf_url && <p className="text-xs text-green-600">PDF listo para guardar</p>}
                                        {/* 
                                         * 2025-06-11 – Comentado temporalmente para evitar la carga automática del PDF
                                         * en el formulario de edición.  
                                         * Motivo:  
                                         * - Puede ralentizar la UI si el archivo es pesado.  
                                         * - Algunos navegadores bloquean iframes locales por política de seguridad.  
                                         * - Se prefiere que el usuario decida visualizarlo con un botón “Ver PDF”
                                         *   o mediante un enlace que abra en nueva pestaña.
                                         */}
                                        {/* <iframe src={newRowData.pdf_url} frameborder="0" style={{ width: '100%', height: '500px' }}></iframe> */}
                                        
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