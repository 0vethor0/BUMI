'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from '../../../styles/ModuloEstudiantes.module.css';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import Swal from 'sweetalert2';
import {
    listStudentsAction,
    searchStudentsAction,
    saveStudentAction,
    listCareersAction,
    checkStudentExistsAction,    // Nueva
    assignStudentToAreaAction,   // Nueva
    deslistStudentAction,         // Nueva (reemplaza delete)            
} from '@/app/protected/actions';

export const dynamic = 'force-dynamic';

const ModuloEstudiantes = () => {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newRowData, setNewRowData] = useState({
        id: '',
        primer_nomb: '',
        segundo_nomb: '',
        primer_ape: '',
        segundo_ape: '',
        id_carrera: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [careers, setCareers] = useState([]);

    const fetchStudents = useCallback(async () => {
        try {
            const mappedStudents = await listStudentsAction();
            setStudents(mappedStudents);
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            Swal.fire({
                title: "Error",
                text: 'Error al cargar los estudiantes: ' + (error.message || 'Error'),
                icon: "error"
            });
        }
    }, []);

    const fetchCareers = useCallback(async () => {
        try {
            const data = await listCareersAction();
            setCareers(data);
        } catch (error) {
            console.error('Error al cargar carreras:', error);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
        fetchCareers();
    }, [fetchStudents, fetchCareers]);

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

    const handleSearchClick = async () => {
        if (!searchTerm.trim()) {
            fetchStudents();
            return;
        }
        try {
            const mappedStudents = await searchStudentsAction(searchTerm);
            setStudents(mappedStudents);
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al buscar estudiantes:', error);
            Swal.fire({
                title: "Error",
                text: 'Error al buscar estudiantes: ' + (error.message || 'Error'),
                icon: "error"
            });
        }
    };

    const handleResetSearch = () => {
        setSearchTerm('');
        fetchStudents();
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleRowClick = (e, studentId) => {
        e.stopPropagation();
        if (isEditing) return;
        setSelectedRowId(studentId);
    };

    const handleNewClick = () => {
        if (isEditing) {
            Swal.fire({
                title: "Atención",
                text: 'Por favor, guarda o cancela la edición actual antes de añadir una nueva fila.',
                icon: "info"
            });
            return;
        }
        setSelectedRowId('new-row');
        setIsEditing(true);
        setNewRowData({
            id: '',
            primer_nomb: '',
            segundo_nomb: '',
            primer_ape: '',
            segundo_ape: '',
            id_carrera: ''
        });
    };

    const handleModifyClick = async () => {
        if (!selectedRowId && !isEditing) {
            Swal.fire({
                title: "Atención",
                text: 'Por favor, selecciona una fila para modificar.',
                icon: "info"
            });
            return;
        }

        if (!isEditing) {
            setIsEditing(true);
            const rowToEdit = students.find(student => student.id === selectedRowId);
            if (rowToEdit) {
                const [primer_nomb = '', segundo_nomb = ''] = rowToEdit.firstName.split(' ');
                const [primer_ape = '', segundo_ape = ''] = rowToEdit.lastName.split(' ');
                setNewRowData({
                    id: rowToEdit.id,
                    primer_nomb,
                    segundo_nomb,
                    primer_ape,
                    segundo_ape,
                    id_carrera: rowToEdit.id_carrera
                });
            }
        } else {
            const isEmpty = !newRowData.id || !newRowData.primer_nomb || !newRowData.primer_ape;
            if (isEmpty) {
                Swal.fire({
                    title: "Campos incompletos",
                    text: 'Campos obligatorios: Cedula, Primer Nombre, Primer Apellido',
                    icon: "warning"
                });
                return;
            }

            try {
                // Quitamos el chequeo manual previo para dejar que la BD lo maneje
                // O lo mantenemos si queremos ser proactivos, pero el usuario dice que el error sigue apareciendo
                // Así que vamos a capturar el error del saveStudentAction específicamente.

                const resultSave = await saveStudentAction(selectedRowId, newRowData);

                // Manejo de duplicado desde el retorno del action
                if (resultSave.duplicate) {
                    const result = await Swal.fire({
                        title: "¿Deseas asignar el registro a tu area?",
                        text: "El registro ya se encuentra en el sistema, puedes asignarlo a tu area o cancelar la operacion.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Si, asignar!",
                        cancelButtonText: "No, cancelar!"
                    });
                    
                    if (result.isConfirmed) {
                        setIsEditing(false);
                        setSelectedRowId(null);
                        await assignStudentToAreaAction(newRowData.id);
                        await Swal.fire({
                            title: "Asignado!",
                            text: "El registro ha sido asignado a tu area.",
                            icon: "success"
                        });
                        await fetchStudents();
                    }
                    return;
                }

                await Swal.fire({
                    title: "Éxito",
                    text: selectedRowId === 'new-row' ? 'Estudiante creado con éxito' : 'Estudiante actualizado con éxito',
                    icon: "success"
                });

                await fetchStudents();
                setIsEditing(false);
                setSelectedRowId(null);
            } catch (error) {
                console.error('Error al guardar estudiante:', error);
                
                // Si el error es de llave duplicada (PKEY) - Backup por si acaso
                if (error.message?.includes('duplicate key value violates unique constraint "tbestudiante_pkey"')) {
                    const result = await Swal.fire({
                        title: "¿Deseas asignar el registro a tu area?",
                        text: "El registro ya se encuentra en el sistema, puedes asignarlo a tu area o cancelar la operacion.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Si, asignar!",
                        cancelButtonText: "No, cancelar!"
                    });

                    if (result.isConfirmed) {
                        setIsEditing(false);
                        setSelectedRowId(null);
                        await assignStudentToAreaAction(newRowData.id);
                        await Swal.fire({
                            title: "Asignado!",
                            text: "El registro ha sido asignado a tu area.",
                            icon: "success"
                        });
                        await fetchStudents();
                    }
                    return;
                }

                if (resultSave.error?.code === '42501'){Swal.fire({
                    title: "Error de permisos",
                    text: "No se pudo asignar visibilidad. Verifica tus permisos o contacta al administrador.",
                    icon: "error"
                });}
            }
        }
    };

    const handleDeslistClick = async () => {  // Reemplaza handleDeleteClick
        if (isEditing) {
            setIsEditing(false);
            setSelectedRowId(null);
            return;
        }

        if (!selectedRowId) {
            Swal.fire({
                title: "Atención",
                text: 'Por favor, selecciona una fila para deslistar.',
                icon: "info"
            });
            return;
        }

        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Ocultarás este estudiante de tu área. No se eliminará del sistema.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, deslistar!",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await deslistStudentAction(selectedRowId);
                await fetchStudents();
                setSelectedRowId(null);
                Swal.fire({
                    title: "Deslistado!",
                    text: "Estudiante deslistado de tu área.",
                    icon: "success"
                });
            } catch (error) {
                console.error('Error al deslistar estudiante:', error);
                Swal.fire({
                    title: "Error",
                    text: 'Error al deslistar: ' + (error.message || 'Error'),
                    icon: "error"
                });
            }
        }
    };

    const handleInputChange = (e, field) => {
        setNewRowData({ ...newRowData, [field]: e.target.value });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const getButtonText = (buttonType) => {
        
        if (isEditing) {
            if (buttonType === 'modify') return 'Guardar';
            if (buttonType === 'deslist') return 'Cancelar';  // Cambiado de 'delete'
        }
        if (buttonType === 'modify') return 'Modificar';
        if (buttonType === 'deslist') return 'Eliminar';  // llamado eliminar para darle la persecion al usuario de que el registro sera eliminado
        return '';
    };

    return (
        <div className={`${styles.container} ${sidebarCollapsed ? styles.collapsed : ''}`}>
            
            <Sidebar 
                isCollapsed={sidebarCollapsed} 
                onToggle={toggleSidebar} 
            />

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1>Modulo de Estudiantes</h1>
                    <div className={styles.headerIcons}>
                        <button className={styles.iconButton}><i className="fas fa-ellipsis-v"></i></button>
                        <button className={styles.iconButton}><i className="fas fa-bell"></i></button>
                        <div className={styles.headerProfile}>
                            <Image src="/image/logo.png" alt="User Avatar" width={32} height={32} />
                        </div>
                    </div>
                </header>

                <div className={styles.card}>
                    <div className="input-group mb-3">
                        <input type="text" 
                            className="form-control" 
                            placeholder="Buscar por cedula, nombre, entre otros..." 
                            aria-label="Buscar por título o ..." 
                            aria-describedby="button-addon2" 
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleSearchClick} >Buscar</button>
                        <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleResetSearch} >Limpiar</button>
                    </div>

                    <div className={styles.dataTableContainer}>
                        <table className={styles.dataTable} id="studentsTable">
                            <thead>
                                <tr>
                                    <th>Cedula</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th>Carrera</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isEditing && selectedRowId === 'new-row' && (
                                    <tr className={styles.selected}>
                                        <td><input 
                                        
                                        type="text" value={newRowData.id} onChange={(e) => handleInputChange(e, 'id')} placeholder="Cedula. Ej: V12345678" 
                                        />
                                        <span class="error-msg"></span>
                                        </td>
                                        <td>
                                            <input type="text" value={newRowData.primer_nomb} onChange={(e) => handleInputChange(e, 'primer_nomb')} placeholder="Primer Nombre" />
                                            <input type="text" value={newRowData.segundo_nomb} onChange={(e) => handleInputChange(e, 'segundo_nomb')} placeholder="Segundo Nombre" />
                                        </td>
                                        <td>
                                            <input type="text" value={newRowData.primer_ape} onChange={(e) => handleInputChange(e, 'primer_ape')} placeholder="Primer Apellido" />
                                            <input type="text" value={newRowData.segundo_ape} onChange={(e) => handleInputChange(e, 'segundo_ape')} placeholder="Segundo Apellido" />
                                        </td>
                                        <td>
                                            <select
                                                value={newRowData.id_carrera}
                                                onChange={(e) => handleInputChange(e, 'id_carrera')}
                                            >
                                                <option value="">Seleccione una carrera</option>
                                                {careers.map((career) => (
                                                    <option key={career.id} value={career.id}>{career.nombre_carrera}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                )}
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center' }}>No hay estudiantes disponibles</td>
                                    </tr>
                                ) : (
                                    students.map(student => (
                                        <tr
                                            key={student.id}
                                            className={selectedRowId === student.id ? styles.selected : ''}
                                            onClick={(e) => handleRowClick(e, student.id)}
                                            style={{ cursor: isEditing ? 'not-allowed' : 'pointer' }}
                                        >
                                            {isEditing && selectedRowId === student.id ? (
                                                <>
                                                    <td><input type="text" value={newRowData.id} onChange={(e) => handleInputChange(e, 'id')} /></td>
                                                    <td>
                                                        <input type="text" value={newRowData.primer_nomb} onChange={(e) => handleInputChange(e, 'primer_nomb')} />
                                                        <input type="text" value={newRowData.segundo_nomb} onChange={(e) => handleInputChange(e, 'segundo_nomb')} />
                                                    </td>
                                                    <td>
                                                        <input type="text" value={newRowData.primer_ape} onChange={(e) => handleInputChange(e, 'primer_ape')} />
                                                        <input type="text" value={newRowData.segundo_ape} onChange={(e) => handleInputChange(e, 'segundo_ape')} />
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={newRowData.id_carrera}
                                                            onChange={(e) => handleInputChange(e, 'id_carrera')}
                                                        >
                                                            <option value="">Seleccione una carrera</option>
                                                            {careers.map((career) => (
                                                                <option key={career.id} value={career.id}>{career.nombre_carrera}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{student.id}</td>
                                                    <td>{student.firstName}</td>
                                                    <td>{student.lastName}</td>
                                                    <td>{student.career}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.actions}>
                        <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={() => router.push('/protected/dashboard/moduloGrupos')}>Asignar Agrupación</button>
                        <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleNewClick} disabled={isEditing}>Nuevo</button>
                        <button
                            className="btn btn-outline-secondary" type="button" id="button-addon2"
                            onClick={handleModifyClick}
                            disabled={!selectedRowId && !isEditing}
                        >
                            {getButtonText('modify')}
                        </button>
                        <button
                            className={`${styles.button} ${styles.buttonDanger}`}
                            id="deslistBtn"  // Cambiado de deleteBtn
                            onClick={handleDeslistClick}
                            disabled={!selectedRowId}
                        >
                            {getButtonText('deslist')} 
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ModuloEstudiantes;
