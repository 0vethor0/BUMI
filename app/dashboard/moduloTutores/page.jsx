'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import styles from '../../styles/ModuloTutores.module.css';

const ModuloTutores = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [tutors, setTutors] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newRowData, setNewRowData] = useState({
        cedulaTutor: '',
        '1er_nombre': '',
        '2do_nombre': '',
        '1er_ape': '',
        '2do_ape': '',
        tipoTutor: '',
        idAreaInvestigacion: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [areaOptions, setAreaOptions] = useState([]);
    const hasUpdatedAreasRef = useRef(false);

    const areaInvestigacionIdMap = {
        'Área de Trabajo Especial de Grado': 1,
        'Área de Trabajo Especial de Posgrado': 2,
        'Servicio Comunitario': 3,
        'Pasantía': 4,
    };

    // Función helper para obtener el nombre del área de investigación
    const getAreaName = (idAreaInvestigacion) => {
        // Primero intenta con el mapa estático
        const staticArea = Object.keys(areaInvestigacionIdMap).find(
            key => areaInvestigacionIdMap[key] === idAreaInvestigacion
        );
        if (staticArea) return staticArea;
        
        // Si no está en el mapa, busca en areaOptions
        const dynamicArea = areaOptions.find(
            area => area.idAreaInvestigacion === idAreaInvestigacion
        );
        return dynamicArea?.nomb_Area || '';
    };

    useEffect(() => {
        // Primero cargar las áreas, luego los tutores
        const loadData = async () => {
            await fetchAreas();
            await fetchTutors();
        };
        loadData();
    }, []);

    // Actualizar las áreas de los tutores cuando areaOptions se carga por primera vez
    // (solo si los tutores ya estaban cargados antes de que las áreas estuvieran disponibles)
    // Esto es un respaldo por si fetchAreas falla la primera vez pero luego se carga
    useEffect(() => {
        if (areaOptions.length > 0 && tutors.length > 0 && !hasUpdatedAreasRef.current) {
            // Verificar si algún tutor tiene área vacía pero tiene idAreaInvestigacion
            const needsUpdate = tutors.some(tutor => 
                tutor.idAreaInvestigacion && !tutor.area
            );
            if (needsUpdate) {
                const updatedTutors = tutors.map(tutor => ({
                    ...tutor,
                    area: tutor.idAreaInvestigacion ? getAreaName(tutor.idAreaInvestigacion) : tutor.area
                }));
                setTutors(updatedTutors);
                hasUpdatedAreasRef.current = true;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [areaOptions.length]);

    const fetchTutors = async () => {
        try {
            const response = await api.get('/consultar_todos_los_tutores/');
            const mappedTutors = response.data.map(tutor => ({
                cedula: tutor.cedulaTutor,
                firstName: tutor['1er_nombre'],
                secondName: tutor['2do_nombre'],
                lastName: tutor['1er_ape'],
                secondLastName: tutor['2do_ape'],
                tipoTutor: tutor.tipoTutor,
                idAreaInvestigacion: tutor.idAreaInvestigacion, // Guardar el ID para poder actualizar después
                area: getAreaName(tutor.idAreaInvestigacion),
            }));
            setTutors(mappedTutors);
            setSelectedRowId(null);
            console.log('Tutores cargados:', mappedTutors);
        } catch (error) {
            console.error('Error al cargar tutores:', error);
            alert('Error al cargar los tutores');
        }
    };

    const fetchAreas = async () => {
        try {
            const response = await api.get('/consultar_todas_las_areas_investigacion/');
            setAreaOptions(response.data);
            console.log('Áreas de investigación cargadas:', response.data);
        } catch (error) {
            console.error('Error al cargar áreas de investigación:', error);
            alert('Error al cargar las áreas de investigación');
        }
    };

    const handleSearchClick = async () => {
        if (!searchTerm.trim()) {
            alert('Por favor, ingrese una cédula o nombre para buscar.');
            setTutors([]);
            return;
        }
        try {
            const response = await api.get(`/buscar_tutor?busqueda=${searchTerm}`);
            if (response.data.message === 'No se encontraron tutores con esa búsqueda') {
                alert('No se encontró un tutor con esa cédula o nombre.');
                setTutors([]);
            } else {
                const mappedTutors = response.data.map(tutor => ({
                    cedula: tutor.cedulaTutor,
                    firstName: tutor['1er_nombre'],
                    secondName: tutor['2do_nombre'],
                    lastName: tutor['1er_ape'],
                    secondLastName: tutor['2do_ape'],
                    tipoTutor: tutor.tipoTutor,
                    idAreaInvestigacion: tutor.idAreaInvestigacion,
                    area: getAreaName(tutor.idAreaInvestigacion)
                }));
                setTutors(mappedTutors);
                console.log('Resultados de búsqueda:', mappedTutors);
            }
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

    const handleRowClick = (e, cedula) => {
        e.stopPropagation();
        if (isEditing) {
            console.log('Clic en fila ignorado: Modo edición activo');
            return;
        }
        if (!cedula) {
            console.error('Cédula de tutor inválida:', cedula);
            return;
        }
        setSelectedRowId(cedula);
        console.log('Fila clicada, Cédula:', cedula, 'Nuevo selectedRowId:', cedula);
    };

    const handleNewClick = () => {
        if (isEditing) {
            alert('Por favor, guarda o cancela la edición actual antes de añadir una nueva fila.');
            return;
        }
        setSelectedRowId('new-row');
        setIsEditing(true);
        setNewRowData({
            cedulaTutor: '',
            '1er_nombre': '',
            '2do_nombre': '',
            '1er_ape': '',
            '2do_ape': '',
            tipoTutor: '',
            idAreaInvestigacion: ''
        });
        console.log('Nueva fila iniciada, selectedRowId:', 'new-row', 'isEditing:', true);
    };

    const handleModifyClick = async () => {
        console.log('Modificar clicado, selectedRowId:', selectedRowId, 'isEditing:', isEditing);
        if (!selectedRowId && !isEditing) {
            alert('Por favor, selecciona una fila para modificar.');
            return;
        }

        if (!isEditing) {
            setIsEditing(true);
            const rowToEdit = tutors.find(tutor => tutor.cedula === selectedRowId);
            if (rowToEdit) {
                setNewRowData({
                    cedulaTutor: rowToEdit.cedula,
                    '1er_nombre': rowToEdit.firstName,
                    '2do_nombre': rowToEdit.secondName,
                    '1er_ape': rowToEdit.lastName,
                    '2do_ape': rowToEdit.secondLastName,
                    tipoTutor: rowToEdit.tipoTutor,
                    idAreaInvestigacion: areaOptions.find(area => area.nomb_Area === rowToEdit.area)?.idAreaInvestigacion || ''
                });
                console.log('Editando fila:', rowToEdit);
            } else {
                console.error('Fila para editar no encontrada para cédula:', selectedRowId);
            }
        } else {
            const isEmpty = Object.values(newRowData).some(value => value.toString().trim() === '');
            if (isEmpty) {
                alert('Todos los campos deben ser rellenados.');
                return;
            }

            try {
                if (selectedRowId === 'new-row') {
                    await api.post('/crear_tutor', newRowData);
                } else {
                    await api.put(`/actualizar_tutor/${selectedRowId}`, newRowData);
                }
                await fetchTutors();
                setIsEditing(false);
                setSelectedRowId(null);
                setNewRowData({
                    cedulaTutor: '',
                    '1er_nombre': '',
                    '2do_nombre': '',
                    '1er_ape': '',
                    '2do_ape': '',
                    tipoTutor: '',
                    idAreaInvestigacion: ''
                });
                alert('Cambios guardados exitosamente.');
                console.log('Cambios guardados, estado reseteado');
            } catch (error) {
                console.error('Error al guardar tutor:', error);
                alert('Error al registrar tutor, ya esta existente');
            }
        }
    };

    const handleDeleteClick = async () => {
        console.log('Eliminar clicado, selectedRowId:', selectedRowId, 'isEditing:', isEditing);
        if (!selectedRowId && !isEditing) {
            alert('Por favor, selecciona una fila para eliminar.');
            return;
        }

        if (isEditing) {
            setIsEditing(false);
            setSelectedRowId(null);
            setNewRowData({
                cedulaTutor: '',
                '1er_nombre': '',
                '2do_nombre': '',
                '1er_ape': '',
                '2do_ape': '',
                tipoTutor: '',
                idAreaInvestigacion: ''
            });
            alert('Edición cancelada.');
            console.log('Edición cancelada, estado reseteado');
        } else {
            if (window.confirm('¿Estás seguro de que quieres eliminar la fila seleccionada?')) {
                try {
                    await api.delete(`/eliminar_tutor/${selectedRowId}`);
                    await fetchTutors();
                    setSelectedRowId(null);
                    alert('Fila eliminada.');
                    console.log('Fila eliminada, selectedRowId reseteado');
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
                        <li><Link href="/moduloEstudiantes"><i className="fas fa-user-graduate"></i> <span>Estudiantes</span></Link></li>
                        <li><a href="#"><i className="fas fa-users"></i> <span>Grupos</span></a></li>
                        <li><Link href="/moduloProyectos"><i className="fas fa-project-diagram"></i> <span>Proyectos</span></Link></li>
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
                                    <th>Primer Nombre</th>
                                    <th>Segundo Nombre</th>
                                    <th>Primer Apellido</th>
                                    <th>Segundo Apellido</th>
                                    <th>Tipo Tutor</th>
                                    <th>Area de Investigacion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isEditing && selectedRowId === 'new-row' && (
                                    <tr className={styles.selected}>
                                        <td><input type="text" value={newRowData.cedulaTutor} onChange={(e) => handleInputChange(e, 'cedulaTutor')} /></td>
                                        <td><input type="text" value={newRowData['1er_nombre']} onChange={(e) => handleInputChange(e, '1er_nombre')} /></td>
                                        <td><input type="text" value={newRowData['2do_nombre']} onChange={(e) => handleInputChange(e, '2do_nombre')} /></td>
                                        <td><input type="text" value={newRowData['1er_ape']} onChange={(e) => handleInputChange(e, '1er_ape')} /></td>
                                        <td><input type="text" value={newRowData['2do_ape']} onChange={(e) => handleInputChange(e, '2do_ape')} /></td>
                                        <td><input type="text" value={newRowData.tipoTutor} onChange={(e) => handleInputChange(e, 'tipoTutor')} /></td>
                                        <td>
                                            <select
                                                className="form-select"
                                                value={areaOptions.find(area => area.idAreaInvestigacion === newRowData.idAreaInvestigacion)?.nomb_Area || ''}
                                                onChange={(e) => handleInputChange({ target: { value: areaOptions.find(area => area.nomb_Area === e.target.value)?.idAreaInvestigacion || '' } }, 'idAreaInvestigacion')}
                                            >
                                                <option value="">Seleccione una área</option>
                                                {areaOptions.map((area, index) => (
                                                    <option key={index} value={area.nomb_Area}>{area.nomb_Area}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                )}
                                {tutors.map(tutor => (
                                    <tr
                                        key={tutor.cedula}
                                        className={selectedRowId === tutor.cedula ? styles.selected : ''}
                                        onClick={(e) => handleRowClick(e, tutor.cedula)}
                                        style={{ cursor: isEditing ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isEditing && selectedRowId === tutor.cedula ? (
                                            <>
                                                <td><input type="text" value={newRowData.cedulaTutor} onChange={(e) => handleInputChange(e, 'cedulaTutor')} /></td>
                                                <td><input type="text" value={newRowData['1er_nombre']} onChange={(e) => handleInputChange(e, '1er_nombre')} /></td>
                                                <td><input type="text" value={newRowData['2do_nombre']} onChange={(e) => handleInputChange(e, '2do_nombre')} /></td>
                                                <td><input type="text" value={newRowData['1er_ape']} onChange={(e) => handleInputChange(e, '1er_ape')} /></td>
                                                <td><input type="text" value={newRowData['2do_ape']} onChange={(e) => handleInputChange(e, '2do_ape')} /></td>
                                                <td><input type="text" value={newRowData.tipoTutor} onChange={(e) => handleInputChange(e, 'tipoTutor')} /></td>
                                                
                                                <td>
                                                    <select
                                                        className="form-select"
                                                        value={areaOptions.find(area => area.idAreaInvestigacion === newRowData.idAreaInvestigacion)?.nomb_Area || ''}
                                                        onChange={(e) => handleInputChange({ target: { value: areaOptions.find(area => area.nomb_Area === e.target.value)?.idAreaInvestigacion || '' } }, 'idAreaInvestigacion')}
                                                    >
                                                        <option value="">Seleccione una área</option>
                                                        {areaOptions.map((area, index) => (
                                                            <option key={index} value={area.nomb_Area}>{area.nomb_Area}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{tutor.cedula}</td>
                                                <td>{tutor.firstName}</td>
                                                <td>{tutor.secondName}</td>
                                                <td>{tutor.lastName}</td>
                                                <td>{tutor.secondLastName}</td>
                                                <td>{tutor.tipoTutor}</td>
                                                <td>{tutor.area}</td>
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

