'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from '../../../styles/ModuloGrupos.module.css';
import Sidebar from '@/components/ui/Sidebar';
import {
  getUserAreaAction,
  groupsListAction,
  groupsWizardDataAction,
  saveGroupsAction,
  deleteGroupByNameAction,
} from '@/app/protected/actions';

export const dynamic = 'force-dynamic'

const ModuloGrupos = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [groups, setGroups] = useState([]);
    const [selectedRowKey, setSelectedRowKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Datos del usuario (área)
    const [userAreaId, setUserAreaId] = useState(null);
    const [userAreaName, setUserAreaName] = useState('Cargando...');

    // Wizard
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [editingGroupKey, setEditingGroupKey] = useState(null);
    const [originalGroupKey, setOriginalGroupKey] = useState(null);
    const [wizardData, setWizardData] = useState({
        periodo: '',
        id_proyecto: null,
        selectedStudents: [], // arreglo de {id, nombreCompleto, ...}
        nombreGrupo: ''
    });

    // Datos para selección
    const [projectsList, setProjectsList] = useState([]);
    const [studentsList, setStudentsList] = useState([]);
    const [areasInvestigacion, setAreasInvestigacion] = useState([]);

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

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

    // Obtener área del usuario (server action)
    const fetchUserArea = useCallback(async () => {
        try {
            const area = await getUserAreaAction();
            if (!area || area.id === null) {
                setUserAreaId(null);
                setUserAreaName('Sin área asignada');
                return;
            }
            setUserAreaId(area.id);
            setUserAreaName(area.name || 'Área no encontrada');
        } catch (err) {
            console.error('Error al obtener área del usuario:', err);
            setUserAreaName('Error al cargar área');
        }
    }, []);

    // Cargar grupos (server action)
    const fetchGroups = useCallback(async () => {
        setLoading(true);
        try {
            const result = await groupsListAction(userAreaId ?? undefined);
            setGroups(result || []);
        } catch (error) {
            console.error('Error fetching groups:', error);
            alert('No se pudieron cargar los grupos');
            setGroups([]);
        } finally {
            setLoading(false);
        }
    }, [userAreaId]);

    // Cargar datos para el wizard (server action)
    const fetchWizardData = useCallback(async () => {
        try {
            const { projects, students, areas } = await groupsWizardDataAction(userAreaId);
            setProjectsList(projects || []);
            setStudentsList(students || []);
            setAreasInvestigacion(areas || []);
        } catch (error) {
            console.error('Error loading wizard data:', error);
        }
    }, [userAreaId]);

    useEffect(() => {
        fetchGroups();
        fetchUserArea();
    }, [fetchGroups, fetchUserArea]);

    useEffect(() => {
        if (isWizardOpen && userAreaId) {
            fetchWizardData();
        }
    }, [isWizardOpen, userAreaId, fetchWizardData]);

    // Generar nombre de grupo automáticamente cuando cambian las dependencias
    useEffect(() => {
        if (wizardData.selectedStudents.length > 0 && wizardData.id_proyecto && wizardData.periodo) {
            const cedulas = wizardData.selectedStudents.map(s => s.id).join('-');
            const generatedName = `${cedulas}-${wizardData.id_proyecto}-${wizardData.periodo}`;
            setWizardData(prev => ({ ...prev, nombreGrupo: generatedName }));
        } else {
            setWizardData(prev => ({ ...prev, nombreGrupo: '' }));
        }
    }, [wizardData.selectedStudents, wizardData.id_proyecto, wizardData.periodo]);

    const handleNewClick = () => {
        if (!userAreaId) {
            alert('No puedes crear grupos sin un área asignada.');
            return;
        }
        setIsWizardOpen(true);
        setCurrentStep(1);
        setEditingGroupKey(null);
        setWizardData({
            periodo: '',
            id_proyecto: null,
            selectedStudents: [],
            nombreGrupo: ''
        });
        setSelectedRowKey(null);
        setOriginalGroupKey(null);
    };

    const handleEditClick = () => {
        if (!selectedRowKey) {
            alert('Selecciona un grupo para modificar.');
            return;
        }

        const groupToEdit = groups.find(g => g.compositeKey === selectedRowKey);
        if (!groupToEdit) {
            alert('Grupo no encontrado.');
            return;
        }

        if (groupToEdit.id_area_investigacion !== userAreaId) {
            alert('No tienes permiso para modificar grupos de otras áreas.');
            return;
        }

        // Cargar datos del grupo para edición
        setEditingGroupKey(selectedRowKey);
        setIsWizardOpen(true);
        setCurrentStep(1);
        
        // Parsear la clave compuesta
        const [cedula, idProyecto, periodo] = selectedRowKey.split('|');
        
        setOriginalGroupKey({
            cedula_estudiante: cedula,
            id_proyecto: parseInt(idProyecto),
            periodo_academico: periodo
        });
        
        (async () => {
            try {
                const supabase = createClient();
                const { data: grupoRows } = await supabase
                    .from('tbgrupos')
                    .select('cedula_estudiante')
                    .eq('nombre_grupo', groupToEdit.nombre_grupo)
                    .eq('id_proyecto', groupToEdit.id_proyecto)
                    .eq('periodo_academico', groupToEdit.periodo_academico);

                const cedulas = (grupoRows || []).map(r => r.cedula_estudiante).filter(Boolean);

                let selected = [];
                if (cedulas.length > 0) {
                    const { data: estudiantes } = await supabase
                        .from('tbestudiante')
                        .select('id, primer_nomb, segundo_nomb, primer_ape, segundo_ape, tbcarrera (nombre_carrera)')
                        .in('id', cedulas);

                    selected = (estudiantes || []).map(s => ({
                        id: s.id,
                        nombreCompleto: [s.primer_nomb, s.segundo_nomb, s.primer_ape, s.segundo_ape].filter(Boolean).join(' '),
                        nombreSimple: `${s.primer_nomb || ''} ${s.primer_ape || ''}`.trim(),
                        carrera: s.tbcarrera?.nombre_carrera || ''
                    }));
                }

                setWizardData({
                    periodo: groupToEdit.periodo_academico || '',
                    id_proyecto: groupToEdit.id_proyecto,
                    selectedStudents: selected,
                    nombreGrupo: groupToEdit.nombre_grupo || ''
                });
            } catch (e) {
                setWizardData({
                    periodo: groupToEdit.periodo_academico || '',
                    id_proyecto: groupToEdit.id_proyecto,
                    selectedStudents: [],
                    nombreGrupo: groupToEdit.nombre_grupo || ''
                });
            }
        })();
    };

    const handleDeleteClick = async () => {
        if (!selectedRowKey) {
            alert('Selecciona un grupo para eliminar.');
            return;
        }

        const group = groups.find(g => g.compositeKey === selectedRowKey);
        if (!group) {
            alert('Grupo no encontrado.');
            return;
        }

        if (group.id_area_investigacion !== userAreaId) {
            alert('No tienes permiso para eliminar grupos de otras áreas.');
            return;
        }

        if (window.confirm(`¿Estás seguro de eliminar el grupo "${group.nombre_grupo}"?`)) {
            setLoading(true);
            try {
                await deleteGroupByNameAction(group.nombre_grupo, group.id_proyecto, group.periodo_academico);
                alert(`Grupo "${group.nombre_grupo}" eliminado correctamente`);
                fetchGroups();
                setSelectedRowKey(null);
            } catch (error) {
                console.error('Error al eliminar grupo:', error);
                alert('Error al eliminar grupo: ' + (error.message || 'Error desconocido'));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleWizardNext = () => {
        // Validaciones por paso
        if (currentStep === 1 && wizardData.selectedStudents.length === 0) {
            alert('Debes seleccionar al menos un estudiante.');
            return;
        }
        if (currentStep === 2 && !wizardData.id_proyecto) {
            alert('Debes seleccionar un proyecto.');
            return;
        }
        if (currentStep === 3 && !wizardData.periodo) {
            alert('Debes ingresar el periodo académico.');
            return;
        }
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleWizardBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleWizardFinish = async () => {
        if (!wizardData.selectedStudents.length || !wizardData.id_proyecto || !wizardData.periodo) {
            alert('Faltan datos requeridos.');
            return;
        }

        setLoading(true);

        try {
            // Para edición: eliminar todos los registros del grupo anterior
            if (editingGroupKey && originalGroupKey) {
                // Eliminar por nombre_grupo original
                const originalGroup = groups.find(g => g.compositeKey === editingGroupKey);
                if (originalGroup) {
                    await deleteGroupByNameAction(
                        originalGroup.nombre_grupo,
                        originalGroup.id_proyecto,
                        originalGroup.periodo_academico
                    );
                }
            }

            // Construir arreglo de inserts (uno por cada estudiante seleccionado)
            await saveGroupsAction({
                selectedStudents: wizardData.selectedStudents.map(s => ({ id: s.id })),
                id_proyecto: wizardData.id_proyecto,
                periodo: wizardData.periodo,
                nombreGrupo: wizardData.nombreGrupo,
            });

            alert(editingGroupKey 
                ? `Grupo "${wizardData.nombreGrupo}" actualizado exitosamente` 
                : `Se creó el grupo "${wizardData.nombreGrupo}" con ${wizardData.selectedStudents.length} estudiante(s)`
            );
            
            setIsWizardOpen(false);
            setEditingGroupKey(null);
            setOriginalGroupKey(null);
            setSelectedRowKey(null);
            fetchGroups();
        } catch (error) {
            console.error('Error al guardar grupos:', error);
            alert('Error al guardar los grupos: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const toggleStudentSelection = (student) => {
        setWizardData(prev => {
            const exists = prev.selectedStudents.some(s => s.id === student.id);
            if (exists) {
                return {
                    ...prev,
                    selectedStudents: prev.selectedStudents.filter(s => s.id !== student.id)
                };
            } else {
                return {
                    ...prev,
                    selectedStudents: [...prev.selectedStudents, student]
                };
            }
        });
    };

    // Filtrar grupos según término de búsqueda
    const filteredGroups = groups.filter(group => 
        group.nombre_grupo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.cedula_estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.proyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.periodo_academico.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`${styles.container} ${sidebarCollapsed ? styles.collapsed : ''}`}>
            <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1>Módulo de Grupos</h1>
                    <div className={styles.headerIcons}>
                        <div className={styles.headerProfile} title={`Área: ${userAreaName}`}>
                            <span style={{ marginRight: '10px', fontSize: '0.8rem', fontWeight: 'bold', color: '#1a56db' }}>
                                {userAreaName}
                            </span>
                            <Image src="/image/logo.png" alt="User Avatar" width={32} height={32} />
                        </div>
                    </div>
                </header>

                {!isWizardOpen ? (
                    <div className={styles.card}>
                        <div className={styles.searchBar}>
                            <i className="bx bx-search"></i>
                            <input
                                type="text"
                                placeholder="Buscar por grupo, estudiante, cédula, proyecto o período..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <p>Cargando grupos...</p>
                            </div>
                        ) : (
                            <div className={styles.dataTableContainer}>
                                <table className={styles.dataTable}>
                                    <thead>
                                        <tr>
                                            <th>Agrupación</th>
                                            <th>Periodo</th>
                                            <th>Cédula(s)</th>
                                            <th>Estudiante(s)</th>
                                            <th>Proyecto</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredGroups.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                                                    {searchTerm ? 'No se encontraron grupos con ese criterio' : 'No hay grupos registrados'}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredGroups.map(group => (
                                                <tr
                                                    key={group.compositeKey}
                                                    className={selectedRowKey === group.compositeKey ? styles.selected : ''}
                                                    onClick={() => setSelectedRowKey(group.compositeKey)}
                                                    style={group.id_area_investigacion !== userAreaId ? { 
                                                        opacity: 0.6, 
                                                        backgroundColor: '#f9f9f9' 
                                                    } : {}}
                                                    title={`Haz clic para seleccionar el grupo: ${group.nombre_grupo}`}
                                                >
                                                    <td>{group.nombre_grupo}</td>
                                                    <td>{group.periodo_academico}</td>
                                                    <td>{group.cedula_estudiante}</td>
                                                    <td>{group.estudiante}</td>
                                                    <td>{group.proyecto}</td>
                                                    <td>
                                                        <span className={`${styles.statusBadge} ${
                                                            group.estado === 'Activo' ? styles.statusActive :
                                                            group.estado === 'En revisión' ? styles.statusReview :
                                                            group.estado === 'Aprobado' ? styles.statusApproved :
                                                            styles.statusInactive
                                                        }`}>
                                                            {group.estado}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button 
                                className="btn btn-outline-secondary" type="button" id="button-addon2" 
                                onClick={handleNewClick}
                                disabled={loading}
                            >
                                Nuevo
                            </button>
                            <button 
                                className="btn btn-outline-secondary" type="button" id="button-addon2" 
                                onClick={handleEditClick}
                                disabled={!selectedRowKey || loading}
                            >
                                Modificar
                            </button>
                            <button 
                                className="btn btn-outline-danger" 
                                onClick={handleDeleteClick}
                                disabled={!selectedRowKey || loading}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.card}>
                        <div className={styles.wizardContainer}>
                            <div className={styles.wizardHeader}>
                                <h2>{editingGroupKey ? 'Editar Grupo' : 'Registro de Grupo'}</h2>
                                <div className={styles.wizardStepIndicator}>
                                    Paso {currentStep} de 4: {
                                        currentStep === 1 ? 'Seleccionar Estudiantes' :
                                        currentStep === 2 ? 'Seleccionar Proyecto' :
                                        currentStep === 3 ? 'Información General' :
                                        'Resumen y Confirmación'
                                    }
                                </div>
                            </div>

                            {/* Paso 1: Seleccionar Estudiantes */}
                            {currentStep === 1 && (
                                <div className={styles.dataTableContainer}>
                                    <div className={styles.selectionCounter}>
                                        Estudiantes seleccionados: <strong>{wizardData.selectedStudents.length}</strong>
                                    </div>
                                    <table className={styles.dataTable}>
                                        <thead>
                                            <tr>
                                                <th>Cédula</th>
                                                <th>Nombre Completo</th>
                                                <th>Carrera</th>
                                                <th>Asignar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentsList.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                                        No hay estudiantes disponibles
                                                    </td>
                                                </tr>
                                            ) : (
                                                studentsList.map(student => {
                                                    const isSelected = wizardData.selectedStudents.some(s => s.id === student.id);
                                                    return (
                                                        <tr
                                                            key={student.id}
                                                            className={isSelected ? styles.selected : ''}
                                                            onClick={() => toggleStudentSelection(student)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <td>{student.id}</td>
                                                            <td>{student.nombreCompleto}</td>
                                                            <td>{student.carrera}</td>
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    readOnly
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleStudentSelection(student);
                                                                    }}
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Paso 2: Seleccionar Proyecto */}
                            {currentStep === 2 && (
                                <div className={styles.dataTableContainer}>
                                    <table className={styles.dataTable}>
                                        <thead>
                                            <tr>
                                                <th>Título del Proyecto</th>
                                                <th>Seleccionar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projectsList.length === 0 ? (
                                                <tr>
                                                    <td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>
                                                        No hay proyectos disponibles en tu área
                                                    </td>
                                                </tr>
                                            ) : (
                                                projectsList.map(project => (
                                                    <tr
                                                        key={project.id}
                                                        className={wizardData.id_proyecto === project.id ? styles.selected : ''}
                                                        onClick={() => setWizardData({ ...wizardData, id_proyecto: project.id })}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <td>{project.titulo}</td>
                                                        <td>
                                                            <input
                                                                type="radio"
                                                                checked={wizardData.id_proyecto === project.id}
                                                                readOnly
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Paso 3: Información General */}
                            {currentStep === 3 && (
                                <div className={styles.formContainer}>
                                    <div className={styles.formGroup}>
                                        <label>Área de investigación</label>
                                        <input
                                            type="text"
                                            value={userAreaName}
                                            readOnly
                                            className={styles.readOnlyInput}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Periodo Académico *</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: 1-2025, 2-2024"
                                            value={wizardData.periodo}
                                            onChange={(e) => setWizardData({ ...wizardData, periodo: e.target.value })}
                                            className={styles.formInput}
                                        />
                                        <small>Formato: semestre-año (Ej: 1-2025)</small>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Nombre del Grupo (generado automáticamente)</label>
                                        <input
                                            type="text"
                                            value={wizardData.nombreGrupo || 'Se generará al completar los pasos anteriores'}
                                            readOnly
                                            className={styles.readOnlyInput}
                                        />
                                        <small>Formato: cédulas-idProyecto-período</small>
                                    </div>
                                </div>
                            )}

                            {/* Paso 4: Resumen */}
                            {currentStep === 4 && (
                                <div className={styles.summaryContainer}>
                                    <h3>Resumen del Registro</h3>
                                    
                                    <div className={styles.summaryGrid}>
                                        <div className={styles.summaryItem}>
                                            <strong>Área:</strong> {userAreaName}
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <strong>Periodo:</strong> {wizardData.periodo || '—'}
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <strong>Proyecto:</strong> {projectsList.find(p => p.id === wizardData.id_proyecto)?.titulo || '—'}
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <strong>Nombre del Grupo:</strong> {wizardData.nombreGrupo || '—'}
                                        </div>
                                    </div>

                                    <div className={styles.summarySection}>
                                        <h4>Estudiantes seleccionados ({wizardData.selectedStudents.length})</h4>
                                        <ul className={styles.studentsList}>
                                            {wizardData.selectedStudents.map(s => (
                                                <li key={s.id}>
                                                    <strong>{s.nombreCompleto}</strong> - Cédula: {s.id}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={styles.summaryNote}>
                                        <p><strong>Nota:</strong> Se creará un registro por cada estudiante seleccionado con el mismo nombre de grupo.</p>
                                    </div>
                                </div>
                            )}

                            <div className={styles.stepActions}>
                                {currentStep > 1 && (
                                    <button 
                                        className={`${styles.button} ${styles.buttonOutline}`} 
                                        onClick={handleWizardBack}
                                        disabled={loading}
                                    >
                                        Atrás
                                    </button>
                                )}

                                <button 
                                    className={`${styles.button} ${styles.buttonOutline}`} 
                                    onClick={() => {
                                        setIsWizardOpen(false);
                                        setEditingGroupKey(null);
                                        setOriginalGroupKey(null);
                                    }}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>

                                {currentStep < 4 ? (
                                    <button 
                                        className={`${styles.button} ${styles.buttonSecondary}`} 
                                        onClick={handleWizardNext}
                                        disabled={loading}
                                    >
                                        Siguiente
                                    </button>
                                ) : (
                                    <button 
                                        className={`${styles.button} ${styles.buttonPrimary}`} 
                                        onClick={handleWizardFinish}
                                        disabled={loading}
                                    >
                                        {loading ? 'Guardando...' : editingGroupKey ? 'Actualizar Grupo' : 'Guardar Grupos'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModuloGrupos;
