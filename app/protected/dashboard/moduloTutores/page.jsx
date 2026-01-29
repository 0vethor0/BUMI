'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
import styles from '../../../styles/ModuloTutores.module.css';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';



const ModuloTutores = () => {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [tutors, setTutors] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newRowData, setNewRowData] = useState({
        cedula_tutor: '',
        primer_nomb: '',
        segundo_nomb: '',
        primer_ape: '',
        segundo_ape: ''
        
    });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTutors = useCallback(async () => {
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('tbtutor')
                .select(`
                    cedula_tutor,
                    created_at,
                    primer_nomb,
                    segundo_nomb,
                    primer_ape,
                    segundo_ape
                `);
            
            if (error) throw error;

            const mappedTutors = data.map(tutor => ({
                id: tutor.cedula_tutor,
                cedula: tutor.cedula_tutor,
                firstName: [tutor.primer_nomb, tutor.segundo_nomb].filter(Boolean).join(' '),
                lastName: [tutor.primer_ape, tutor.segundo_ape].filter(Boolean).join(' ')
            }));

            setTutors(mappedTutors);
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al cargar tutores:', error);
            alert('Error al cargar los tutores: ' + error.message);
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
                .select(`
                    cedula_tutor,
                    created_at,
                    primer_nomb,
                    segundo_nomb,
                    primer_ape,
                    segundo_ape,
                `)
                .or(`
                    cedula_tutor.ilike.%${searchTerm}%,
                    primer_nomb.ilike.%${searchTerm}%,
                    segundo_nomb.ilike.%${searchTerm}%,
                    primer_ape.ilike.%${searchTerm}%,
                    segundo_ape.ilike.%${searchTerm}%
                `);

            if (error) throw error;

            const mappedTutors = data.map(tutor => ({
                id: tutor.cedula_tutor,
                cedula: tutor.cedula_tutor,
                firstName: [tutor.primer_nomb, tutor.segundo_nomb].filter(Boolean).join(' '),
                lastName: [tutor.primer_ape, tutor.segundo_ape].filter(Boolean).join(' '),
                
            }));

            setTutors(mappedTutors);
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al buscar tutores:', error);
            alert('Error al buscar tutores: ' + error.message);
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
            cedula_tutor: '',
            primer_nomb: '',
            segundo_nomb: '',
            primer_ape: '',
            segundo_ape: '',
            
        });
    };

    const handleModifyClick = async () => {
        if (!selectedRowId && !isEditing) {
            alert('Por favor, selecciona una fila para modificar.');
            return;
        }

        const supabase = createClient();

        if (!isEditing) {
            // Entrar en modo edición
            setIsEditing(true);
            const rowToEdit = tutors.find(tutor => tutor.id === selectedRowId);
            if (rowToEdit) {
                const [primer_nomb = '', segundo_nomb = ''] = rowToEdit.firstName.split(' ');
                const [primer_ape = '', segundo_ape = ''] = rowToEdit.lastName.split(' ');
                setNewRowData({
                    cedula_tutor: rowToEdit.cedula,
                    primer_nomb,
                    segundo_nomb,
                    primer_ape,
                    segundo_ape,
                    
                });
            }
        } else {
            // Guardar cambios
            const isEmpty = !newRowData.cedula_tutor || !newRowData.primer_nomb || !newRowData.primer_ape;
            if (isEmpty) {
                alert('Campos obligatorios: Cédula, Primer Nombre, Primer Apellido');
                return;
            }

            try {
                const payload = {
                    primer_nomb: newRowData.primer_nomb,
                    segundo_nomb: newRowData.segundo_nomb || null,
                    primer_ape: newRowData.primer_ape,
                    segundo_ape: newRowData.segundo_ape || null,
                    
                };

                let error;

                if (selectedRowId === 'new-row') {
                    // Crear nuevo tutor
                    ({ error } = await supabase
                        .from('tbtutor')
                        .insert([{ ...payload, cedula_tutor: newRowData.cedula_tutor }]));
                } else {
                    // Actualizar tutor existente
                    ({ error } = await supabase
                        .from('tbtutor')
                        .update(payload)
                        .eq('cedula_tutor', selectedRowId));
                }

                if (error) throw error;

                alert(selectedRowId === 'new-row' 
                    ? 'Tutor creado con éxito' 
                    : 'Tutor actualizado con éxito');

                await fetchTutors();
                setIsEditing(false);
                setSelectedRowId(null);
            } catch (error) {
                console.error('Error al guardar tutor:', error);
                alert('Error al guardar: ' + (error.message || 'Error desconocido'));
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
                cedula_tutor: '',
                primer_nomb: '',
                segundo_nomb: '',
                primer_ape: '',
                segundo_ape: '',
                
            });
        } else {
            if (window.confirm('¿Estás seguro de que quieres eliminar la fila seleccionada?')) {
                const supabase = createClient();
                try {
                    const { error } = await supabase
                        .from('tbtutor')
                        .delete()
                        .eq('cedula_tutor', selectedRowId);
                    
                    if (error) throw error;
                    
                    await fetchTutors();
                    setSelectedRowId(null);
                    alert('Tutor eliminado.');
                } catch (error) {
                    console.error('Error al eliminar tutor:', error);
                    alert('Error al eliminar el tutor: ' + error.message);
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
                                    <th>Cédula</th>
                                    <th>Nombre</th>
                                    <th>Apellidos</th>
                                
                                </tr>
                            </thead>
                            <tbody>
                                {isEditing && selectedRowId === 'new-row' && (
                                    <tr className={styles.selected}>
                                        <td>
                                            <input 
                                                type="text" 
                                                value={newRowData.cedula_tutor} 
                                                onChange={(e) => handleInputChange(e, 'cedula_tutor')} 
                                                placeholder="Cédula" 
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                type="text" 
                                                placeholder="Primer Nombre" 
                                                value={newRowData.primer_nomb} 
                                                onChange={(e) => handleInputChange(e, 'primer_nomb')} 
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Segundo Nombre" 
                                                value={newRowData.segundo_nomb} 
                                                onChange={(e) => handleInputChange(e, 'segundo_nomb')} 
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                type="text" 
                                                placeholder="Primer Apellido" 
                                                value={newRowData.primer_ape} 
                                                onChange={(e) => handleInputChange(e, 'primer_ape')} 
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Segundo Apellido" 
                                                value={newRowData.segundo_ape} 
                                                onChange={(e) => handleInputChange(e, 'segundo_ape')} 
                                            />
                                        </td>

                                    </tr>
                                )}

                                {tutors.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center' }}>
                                            No hay tutores disponibles
                                        </td>
                                    </tr>
                                ) : (
                                    tutors.map(tutor => (
                                        <tr
                                            key={tutor.id}
                                            className={selectedRowId === tutor.id ? styles.selected : ''}
                                            onClick={(e) => handleRowClick(e, tutor.id)}
                                            style={{ cursor: isEditing ? 'not-allowed' : 'pointer' }}
                                        >
                                            {isEditing && selectedRowId === tutor.id ? (
                                                <>
                                                    <td>
                                                        <input 
                                                            type="text" 
                                                            value={newRowData.cedula_tutor} 
                                                            onChange={(e) => handleInputChange(e, 'cedula_tutor')} 
                                                        />
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="text" 
                                                            value={newRowData.primer_nomb} 
                                                            onChange={(e) => handleInputChange(e, 'primer_nomb')} 
                                                        />
                                                        <input 
                                                            type="text" 
                                                            value={newRowData.segundo_nomb} 
                                                            onChange={(e) => handleInputChange(e, 'segundo_nomb')} 
                                                        />
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="text" 
                                                            value={newRowData.primer_ape} 
                                                            onChange={(e) => handleInputChange(e, 'primer_ape')} 
                                                        />
                                                        <input 
                                                            type="text" 
                                                            value={newRowData.segundo_ape} 
                                                            onChange={(e) => handleInputChange(e, 'segundo_ape')} 
                                                        />
                                                    </td>
                                                    
                                                </>
                                            ) : (
                                                <>
                                                    <td>{tutor.cedula}</td>
                                                    <td>{tutor.firstName}</td>
                                                    <td>{tutor.lastName}</td>

                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.actions}>
                        <button 
                            className={`${styles.button} ${styles.buttonSecondary}`} 
                            id="newBtn" 
                            onClick={handleNewClick} 
                            disabled={isEditing}
                        >
                            Nuevo
                        </button>
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