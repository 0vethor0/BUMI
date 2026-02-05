'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from '../../../styles/ModuloEstudiantes.module.css';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import {
    listStudentsAction,
    searchStudentsAction,
    saveStudentAction,
    deleteStudentAction,
    listCareersAction
} from '@/app/protected/actions';

export const dynamic = 'force-dynamic'

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
            alert('Error al cargar los estudiantes: ' + (error.message || 'Error'));
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
            alert('Error al buscar estudiantes: ' + (error.message || 'Error'));
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
            alert('Por favor, guarda o cancela la edición actual antes de añadir una nueva fila.');
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
            alert('Por favor, selecciona una fila para modificar.');
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
                alert('Campos obligatorios: Cedula, Primer Nombre, Primer Apellido');
                return;
            }

            try {
                await saveStudentAction(selectedRowId, newRowData);
                alert(selectedRowId === 'new-row' ? 'Estudiante creado con éxito' : 'Estudiante actualizado con éxito');

                await fetchStudents();
                setIsEditing(false);
                setSelectedRowId(null);
            } catch (error) {
                console.error('Error al guardar estudiante:', error);
                alert('Error al guardar: ' + (error.message || 'Error'));
            }
        }
    };

    const handleDeleteClick = async () => {
        if (!selectedRowId && !isEditing) {
            alert('Por favor, selecciona una fila para eliminar.');
            return;
        }

        if (isEditing) {
            setIsEditing(false);
            setSelectedRowId(null);
            setNewRowData({
                id: '',
                primer_nomb: '',
                segundo_nomb: '',
                primer_ape: '',
                segundo_ape: '',
                id_carrera: ''
            });
        } else {
            if (window.confirm('¿Estás seguro de que quieres eliminar la fila seleccionada?')) {
                try {
                    await deleteStudentAction(selectedRowId);
                    await fetchStudents();
                    setSelectedRowId(null);
                    alert('Fila eliminada.');
                } catch (error) {
                    console.error('Error al eliminar estudiante:', error);
                    alert('Error al eliminar el estudiante');
                }
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
            if (buttonType === 'delete') return 'Cancelar';
        }
        if (buttonType === 'modify') return 'Modificar';
        if (buttonType === 'delete') return 'Eliminar';
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
                    <div className={styles.searchBar}>
                        <i className="fas fa-search"></i>
                        <input 
                            type="text" 
                            placeholder="Buscar por cedula o nombre..." 
                            value={searchTerm}
                            onChange={handleSearchChange}
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
                                        <td><input type="text" value={newRowData.id} onChange={(e) => handleInputChange(e, 'id')} placeholder="Carnet/ID" /></td>
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
                        <button className={`${styles.button} ${styles.buttonSecondary} ${styles.assignButton}`} id="assignGroupBtn">Asignar Agrupacion</button>
                        <button className={`${styles.button} ${styles.buttonSecondary}`} id="newBtn" onClick={handleNewClick} disabled={isEditing}>Nuevo</button>
                        <button
                            className={`${styles.button} ${styles.buttonOutline}`}
                            id="modifyBtn"
                            onClick={handleModifyClick}
                            disabled={!selectedRowId && !isEditing}
                        >
                            {getButtonText('modify')}
                        </button>
                        <button
                            className={`${styles.button} ${styles.buttonDanger}`}
                            id="deleteBtn"
                            onClick={handleDeleteClick}
                            disabled={!selectedRowId && !isEditing}
                        >
                            {getButtonText('delete')}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ModuloEstudiantes;
