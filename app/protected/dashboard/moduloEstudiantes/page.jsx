'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from '../../styles/ModuloEstudiantes.module.css';
import { useRouter } from 'next/navigation';

const ModuloEstudiantes = () => {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newRowData, setNewRowData] = useState({
        carnet: '',
        nombre: '',
        apellido1: '',
        apellido2: '',
        id_carrera: '',
        // cedulaTutor removed as it is not in the schema
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [careers, setCareers] = useState([]);

    const fetchStudents = useCallback(async () => {
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('tbestudiante')
                .select(`
                    *,
                    tbcarrera (
                        nombre
                    )
                `);
            
            if (error) throw error;

            const mappedStudents = data.map(student => ({
                id: student.id,
                cedula: student.carnet,
                firstName: student.nombre, // Assuming nombre stores the full first name or just one name
                lastName: student.apellido1,
                secondLastName: student.apellido2,
                career: student.tbcarrera?.nombre || '',
                id_carrera: student.id_carrera
            }));
            setStudents(mappedStudents);
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            alert('Error al cargar los estudiantes');
        }
    }, []);

    const fetchCareers = useCallback(async () => {
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('tbcarrera')
                .select('*');
            
            if (error) throw error;
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
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('tbestudiante')
                .select(`
                    *,
                    tbcarrera (
                        nombre
                    )
                `)
                .or(`carnet.ilike.%${searchTerm}%,nombre.ilike.%${searchTerm}%,apellido1.ilike.%${searchTerm}%`);

            if (error) throw error;

            const mappedStudents = data.map(student => ({
                id: student.id,
                cedula: student.carnet,
                firstName: student.nombre,
                lastName: student.apellido1,
                secondLastName: student.apellido2,
                career: student.tbcarrera?.nombre || '',
                id_carrera: student.id_carrera
            }));
            setStudents(mappedStudents);
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al buscar estudiantes:', error);
            alert('Error al buscar estudiantes');
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
            carnet: '',
            nombre: '',
            apellido1: '',
            apellido2: '',
            id_carrera: ''
        });
    };

    const handleModifyClick = async () => {
        if (!selectedRowId && !isEditing) {
            alert('Por favor, selecciona una fila para modificar.');
            return;
        }

        const supabase = createClient();

        if (!isEditing) {
            setIsEditing(true);
            const rowToEdit = students.find(student => student.id === selectedRowId);
            if (rowToEdit) {
                setNewRowData({
                    carnet: rowToEdit.cedula,
                    nombre: rowToEdit.firstName,
                    apellido1: rowToEdit.lastName,
                    apellido2: rowToEdit.secondLastName,
                    id_carrera: rowToEdit.id_carrera
                });
            }
        } else {
            const isEmpty = !newRowData.carnet || !newRowData.nombre || !newRowData.apellido1;
            if (isEmpty) {
                alert('Campos obligatorios: Carnet, Nombre, Primer Apellido');
                return;
            }

            try {
                const payload = {
                    carnet: newRowData.carnet,
                    nombre: newRowData.nombre,
                    apellido1: newRowData.apellido1,
                    apellido2: newRowData.apellido2,
                    id_carrera: newRowData.id_carrera ? parseInt(newRowData.id_carrera) : null
                };

                if (selectedRowId === 'new-row') {
                    const { error } = await supabase
                        .from('tbestudiante')
                        .insert([payload]);
                    if (error) throw error;
                    alert('Estudiante creado con éxito');
                } else {
                    const { error } = await supabase
                        .from('tbestudiante')
                        .update(payload)
                        .eq('id', selectedRowId);
                    if (error) throw error;
                    alert('Estudiante actualizado con éxito');
                }
                await fetchStudents();
                setIsEditing(false);
                setSelectedRowId(null);
            } catch (error) {
                console.error('Error al guardar estudiante:', error);
                alert('Error al guardar: ' + error.message);
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
                carnet: '',
                nombre: '',
                apellido1: '',
                apellido2: '',
                id_carrera: ''
            });
        } else {
            if (window.confirm('¿Estás seguro de que quieres eliminar la fila seleccionada?')) {
                const supabase = createClient();
                try {
                    const { error } = await supabase
                        .from('tbestudiante')
                        .delete()
                        .eq('id', selectedRowId);
                    
                    if (error) throw error;
                    
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
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo} id="sidebarToggle" onClick={toggleSidebar}>
                        <i className="fas fa-bars"></i>
                    </div>
                    <span className={styles.appName}>Bumi Unefa</span>
                </div>
                <nav className={styles.sidebarNav}>
                    <ul>
                        <li><a href="#"><i className="fas fa-chart-line"></i> <span>Dashboard</span></a></li>
                        <li><Link href="../../dashboard/moduloTutores/page.jsx"><i className="fas fa-chalkboard-teacher"></i> <span>Tutores</span></Link></li>
                        <li className={styles.active}><a href="#"><i className="fas fa-user-graduate"></i> <span>Estudiantes</span></a></li>
                        <li><a href="#"><i className="fas fa-users"></i> <span>Grupos</span></a></li>
                        <li><Link href="../../dashboard/moduloProyectos/page.jsx"><i className="fas fa-project-diagram"></i> <span>Proyectos</span></Link></li>
                        <li><a href="#"><i className="fas fa-clipboard-list"></i> <span>Estado de Proyecto</span></a></li>
                    </ul>
                    <ul className={styles.logout}>
                        <li><a href="#"><i className="fas fa-cog"></i> <span>Configuracion</span></a></li>
                        <li><Link href="/"><i className="fas fa-sign-out-alt"></i> <span>Salir</span></Link></li>
                    </ul>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1>Modulo de Estudiantes</h1>
                    <div className={styles.headerIcons}>
                        <button className={styles.iconButton}><i className="fas fa-ellipsis-v"></i></button>
                        <button className={styles.iconButton}><i className="fas fa-bell"></i></button>
                        <div className={styles.headerProfile}>
                            <img src="/image/logo.png" alt="User Avatar" />
                        </div>
                    </div>
                </header>

                <div className={styles.card}>
                    <div className={styles.searchBar}>
                        <i className="fas fa-search"></i>
                        <input 
                            type="text" 
                            placeholder="Buscar por cédula o nombre..." 
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
                                    <th>Carnet</th>
                                    <th>Nombre</th>
                                    <th>Primer Apellido</th>
                                    <th>Segundo Apellido</th>
                                    <th>Carrera</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isEditing && selectedRowId === 'new-row' && (
                                    <tr className={styles.selected}>
                                        <td><input type="text" value={newRowData.carnet} onChange={(e) => handleInputChange(e, 'carnet')} /></td>
                                        <td><input type="text" value={newRowData.nombre} onChange={(e) => handleInputChange(e, 'nombre')} /></td>
                                        <td><input type="text" value={newRowData.apellido1} onChange={(e) => handleInputChange(e, 'apellido1')} /></td>
                                        <td><input type="text" value={newRowData.apellido2} onChange={(e) => handleInputChange(e, 'apellido2')} /></td>
                                        <td>
                                            <select
                                                className="form-select"
                                                value={newRowData.id_carrera}
                                                onChange={(e) => handleInputChange(e, 'id_carrera')}
                                            >
                                                <option value="">Seleccione una carrera</option>
                                                {careers.map((career) => (
                                                    <option key={career.id} value={career.id}>{career.nombre}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                )}
                                {students.map(student => (
                                    <tr
                                        key={student.id}
                                        className={selectedRowId === student.id ? styles.selected : ''}
                                        onClick={(e) => handleRowClick(e, student.id)}
                                        style={{ cursor: isEditing ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isEditing && selectedRowId === student.id ? (
                                            <>
                                                <td><input type="text" value={newRowData.carnet} onChange={(e) => handleInputChange(e, 'carnet')} /></td>
                                                <td><input type="text" value={newRowData.nombre} onChange={(e) => handleInputChange(e, 'nombre')} /></td>
                                                <td><input type="text" value={newRowData.apellido1} onChange={(e) => handleInputChange(e, 'apellido1')} /></td>
                                                <td><input type="text" value={newRowData.apellido2} onChange={(e) => handleInputChange(e, 'apellido2')} /></td>
                                                <td>
                                                    <select
                                                        className="form-select"
                                                        value={newRowData.id_carrera}
                                                        onChange={(e) => handleInputChange(e, 'id_carrera')}
                                                    >
                                                        <option value="">Seleccione una carrera</option>
                                                        {careers.map((career) => (
                                                            <option key={career.id} value={career.id}>{career.nombre}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{student.cedula}</td>
                                                <td>{student.firstName}</td>
                                                <td>{student.lastName}</td>
                                                <td>{student.secondLastName}</td>
                                                <td>{student.career}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
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

