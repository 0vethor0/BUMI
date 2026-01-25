'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from '../../styles/ModuloTutores.module.css';

const ModuloTutores = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [tutors, setTutors] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newRowData, setNewRowData] = useState({
        cedula: '',
        nombre: '',
        apellido1: '',
        apellido2: '',
        especialidad: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTutors = useCallback(async () => {
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('tbtutor')
                .select('*');
            
            if (error) throw error;

            const mappedTutors = data.map(tutor => ({
                id: tutor.id,
                cedula: tutor.cedula,
                firstName: tutor.nombre,
                lastName: tutor.apellido1,
                secondLastName: tutor.apellido2,
                specialty: tutor.especialidad
            }));
            setTutors(mappedTutors);
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al cargar tutores:', error);
            alert('Error al cargar los tutores');
        }
    }, []);

    useEffect(() => {
        fetchTutors();
    }, [fetchTutors]);

    const handleSearchClick = async () => {
        if (!searchTerm.trim()) {
            fetchTutors();
            return;
        }
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('tbtutor')
                .select('*')
                .or(`cedula.ilike.%${searchTerm}%,nombre.ilike.%${searchTerm}%,apellido1.ilike.%${searchTerm}%`);

            if (error) throw error;

            const mappedTutors = data.map(tutor => ({
                id: tutor.id,
                cedula: tutor.cedula,
                firstName: tutor.nombre,
                lastName: tutor.apellido1,
                secondLastName: tutor.apellido2,
                specialty: tutor.especialidad
            }));
            setTutors(mappedTutors);
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al buscar tutores:', error);
            alert('Error al buscar tutores');
        }
    };

    const handleResetSearch = () => {
        setSearchTerm('');
        fetchTutors();
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleRowClick = (e, tutorId) => {
        e.stopPropagation();
        if (isEditing) return;
        setSelectedRowId(tutorId);
    };

    const handleNewClick = () => {
        if (isEditing) {
            alert('Por favor, guarda o cancela la edición actual antes de añadir una nueva fila.');
            return;
        }
        setSelectedRowId('new-row');
        setIsEditing(true);
        setNewRowData({
            cedula: '',
            nombre: '',
            apellido1: '',
            apellido2: '',
            especialidad: ''
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
            const rowToEdit = tutors.find(tutor => tutor.id === selectedRowId);
            if (rowToEdit) {
                setNewRowData({
                    cedula: rowToEdit.cedula,
                    nombre: rowToEdit.firstName,
                    apellido1: rowToEdit.lastName,
                    apellido2: rowToEdit.secondLastName,
                    especialidad: rowToEdit.specialty
                });
            }
        } else {
            const isEmpty = !newRowData.cedula || !newRowData.nombre || !newRowData.apellido1;
            if (isEmpty) {
                alert('Campos obligatorios: Cedula, Nombre, Primer Apellido');
                return;
            }

            try {
                const payload = {
                    cedula: newRowData.cedula,
                    nombre: newRowData.nombre,
                    apellido1: newRowData.apellido1,
                    apellido2: newRowData.apellido2,
                    especialidad: newRowData.especialidad
                };

                if (selectedRowId === 'new-row') {
                    const { error } = await supabase
                        .from('tbtutor')
                        .insert([payload]);
                    if (error) throw error;
                    alert('Tutor creado con éxito');
                } else {
                    const { error } = await supabase
                        .from('tbtutor')
                        .update(payload)
                        .eq('id', selectedRowId);
                    if (error) throw error;
                    alert('Tutor actualizado con éxito');
                }
                await fetchTutors();
                setIsEditing(false);
                setSelectedRowId(null);
            } catch (error) {
                console.error('Error al guardar tutor:', error);
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
                cedula: '',
                nombre: '',
                apellido1: '',
                apellido2: '',
                especialidad: ''
            });
        } else {
            if (window.confirm('¿Estás seguro de que quieres eliminar la fila seleccionada?')) {
                const supabase = createClient();
                try {
                    const { error } = await supabase
                        .from('tbtutor')
                        .delete()
                        .eq('id', selectedRowId);
                    
                    if (error) throw error;
                    
                    await fetchTutors();
                    setSelectedRowId(null);
                    alert('Fila eliminada.');
                } catch (error) {
                    console.error('Error al eliminar tutor:', error);
                    alert('Error al eliminar el tutor');
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
                        <li className={styles.active}><a href="#"><i className="fas fa-chalkboard-teacher"></i> <span>Tutores</span></a></li>
                        <li><Link href="../moduloEstudiantes/page.jsx"><i className="fas fa-user-graduate"></i> <span>Estudiantes</span></Link></li>
                        <li><a href="#"><i className="fas fa-users"></i> <span>Grupos</span></a></li>
                        <li><Link href="../moduloProyectos/page.jsx"><i className="fas fa-project-diagram"></i> <span>Proyectos</span></Link></li>
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
                    <h1>Modulo de Tutores</h1>
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
                        <table className={styles.dataTable} id="tutorsTable">
                            <thead>
                                <tr>
                                    <th>Cedula</th>
                                    <th>Nombre</th>
                                    <th>Primer Apellido</th>
                                    <th>Segundo Apellido</th>
                                    <th>Especialidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isEditing && selectedRowId === 'new-row' && (
                                    <tr className={styles.selected}>
                                        <td><input type="text" value={newRowData.cedula} onChange={(e) => handleInputChange(e, 'cedula')} /></td>
                                        <td><input type="text" value={newRowData.nombre} onChange={(e) => handleInputChange(e, 'nombre')} /></td>
                                        <td><input type="text" value={newRowData.apellido1} onChange={(e) => handleInputChange(e, 'apellido1')} /></td>
                                        <td><input type="text" value={newRowData.apellido2} onChange={(e) => handleInputChange(e, 'apellido2')} /></td>
                                        <td><input type="text" value={newRowData.especialidad} onChange={(e) => handleInputChange(e, 'especialidad')} /></td>
                                    </tr>
                                )}
                                {tutors.map(tutor => (
                                    <tr
                                        key={tutor.id}
                                        className={selectedRowId === tutor.id ? styles.selected : ''}
                                        onClick={(e) => handleRowClick(e, tutor.id)}
                                        style={{ cursor: isEditing ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isEditing && selectedRowId === tutor.id ? (
                                            <>
                                                <td><input type="text" value={newRowData.cedula} onChange={(e) => handleInputChange(e, 'cedula')} /></td>
                                                <td><input type="text" value={newRowData.nombre} onChange={(e) => handleInputChange(e, 'nombre')} /></td>
                                                <td><input type="text" value={newRowData.apellido1} onChange={(e) => handleInputChange(e, 'apellido1')} /></td>
                                                <td><input type="text" value={newRowData.apellido2} onChange={(e) => handleInputChange(e, 'apellido2')} /></td>
                                                <td><input type="text" value={newRowData.especialidad} onChange={(e) => handleInputChange(e, 'especialidad')} /></td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{tutor.cedula}</td>
                                                <td>{tutor.firstName}</td>
                                                <td>{tutor.lastName}</td>
                                                <td>{tutor.secondLastName}</td>
                                                <td>{tutor.specialty}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.actions}>
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

export default ModuloTutores;

