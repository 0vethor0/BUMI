import React, { useState, useEffect } from 'react';
import axios from 'axios';
import locoAvatar from '../../image/logo.png';
import styles from '../styles/ModuloEstudiantes.module.css';

const ModuloEstudiantes = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newRowData, setNewRowData] = useState({
        cedulaEstudiante: '',
        '1er_nombre': '',
        '2do_nombre': '',
        '1er_ape': '',
        '2do_ape': '',
        idcarrera: '',
        cedulaTutor: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [tutors, setTutors] = useState([]);

    const careerOptions = ['Turismo', 'TSU ADS', 'Ing Agroindustrial', 'Ing en Sistemas', 'Ing Civil', 'Ing Mecanica', 'Enfermeria'];
    const careerIdMap = {
        'Turismo': 9,
        'TSU ADS': 11,
        'Ing Agroindustrial': 12,
        'Ing en Sistemas': 13,
        'Ing Civil': 14,
        'Ing Mecanica': 15,
        'Enfermeria': 16
    };

    useEffect(() => {
        fetchStudents();
        fetchTutors();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/consultar_todos_los_estudiantes/');
            const mappedStudents = response.data.map(student => ({
                cedula: student.cedulaEstudiante,
                firstName: student['1er_nombre'],
                secondName: student['2do_nombre'],
                lastName: student['1er_ape'],
                secondLastName: student['2do_ape'],
                career: Object.keys(careerIdMap).find(key => careerIdMap[key] === student.idcarrera) || '',
                cedulaTutor: student.cedulaTutor
            }));
            setStudents(mappedStudents);
            setSelectedRowId(null);
            console.log('Estudiantes cargados:', mappedStudents);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            alert('Error al cargar los estudiantes');
        }
    };

    const fetchTutors = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/consultar_datosBasicos_tutor/');
            setTutors(response.data);
            console.log('Tutores cargados:', response.data);
        } catch (error) {
            console.error('Error al cargar tutores:', error);
            alert('Error al cargar los tutores');
        }
    };

    const handleSearchClick = async () => {
        if (!searchTerm.trim()) {
            alert('Por favor, ingrese una cédula o nombre para buscar.');
            return;
        }
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/buscar_estudiante?busqueda=${searchTerm}`);
            if (response.data.message === 'No se encontraron estudiantes con esa búsqueda') {
                alert('No se encontró un estudiante con esa cédula o nombre.');
                setStudents([]);
            } else {
                const mappedStudents = response.data.map(student => ({
                    cedula: student.cedulaEstudiante,
                    firstName: student['1er_nombre'],
                    secondName: student['2do_nombre'],
                    lastName: student['1er_ape'],
                    secondLastName: student['2do_ape'],
                    career: Object.keys(careerIdMap).find(key => careerIdMap[key] === student.idcarrera) || '',
                    cedulaTutor: student.cedulaTutor
                }));
                setStudents(mappedStudents);
                console.log('Resultados de búsqueda:', mappedStudents);
            }
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

    const handleRowClick = (e, cedula) => {
        e.stopPropagation();
        if (isEditing) {
            console.log('Clic en fila ignorado: Modo edición activo');
            return;
        }
        if (!cedula) {
            console.error('Cédula de estudiante inválida:', cedula);
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
            cedulaEstudiante: '',
            '1er_nombre': '',
            '2do_nombre': '',
            '1er_ape': '',
            '2do_ape': '',
            idcarrera: '',
            cedulaTutor: ''
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
            const rowToEdit = students.find(student => student.cedula === selectedRowId);
            if (rowToEdit) {
                setNewRowData({
                    cedulaEstudiante: rowToEdit.cedula,
                    '1er_nombre': rowToEdit.firstName,
                    '2do_nombre': rowToEdit.secondName,
                    '1er_ape': rowToEdit.lastName,
                    '2do_ape': rowToEdit.secondLastName,
                    idcarrera: careerIdMap[rowToEdit.career] || '',
                    cedulaTutor: rowToEdit.cedulaTutor
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
                    await axios.post('http://127.0.0.1:8000/api/crear_estudiante', newRowData);
                } else {
                    await axios.put(`http://127.0.0.1:8000/api/actualizar_estudiante/${selectedRowId}`, newRowData);
                }
                await fetchStudents();
                setIsEditing(false);
                setSelectedRowId(null);
                setNewRowData({
                    cedulaEstudiante: '',
                    '1er_nombre': '',
                    '2do_nombre': '',
                    '1er_ape': '',
                    '2do_ape': '',
                    idcarrera: '',
                    cedulaTutor: ''
                });
                alert('Cambios guardados exitosamente.');
                console.log('Cambios guardados, estado reseteado');
            } catch (error) {
                console.error('Error al guardar estudiante:', error);
                alert('Error al guardar los cambios');
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
                cedulaEstudiante: '',
                '1er_nombre': '',
                '2do_nombre': '',
                '1er_ape': '',
                '2do_ape': '',
                idcarrera: '',
                cedulaTutor: ''
            });
            alert('Edición cancelada.');
            console.log('Edición cancelada, estado reseteado');
        } else {
            if (window.confirm('¿Estás seguro de que quieres eliminar la fila seleccionada?')) {
                try {
                    await axios.delete(`http://127.0.0.1:8000/api/eliminar_estudiante/${selectedRowId}`);
                    await fetchStudents();
                    setSelectedRowId(null);
                    alert('Fila eliminada.');
                    console.log('Fila eliminada, selectedRowId reseteado');
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
            <link
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
                rel="stylesheet"
                integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM"
                crossorigin="anonymous"
            />
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
                        <li><a href="http://localhost:3000/moduloTutores"><i className="fas fa-chalkboard-teacher"></i> <span>Tutores</span></a></li>
                        <li className={styles.active}><a href="#"><i className="fas fa-user-graduate"></i> <span>Estudiantes</span></a></li>
                        <li><a href="#"><i className="fas fa-users"></i> <span>Grupos</span></a></li>
                        <li><a href="http://localhost:3000/moduloProyectos"><i className="fas fa-project-diagram"></i> <span>Proyectos</span></a></li>
                        <li><a href="#"><i className="fas fa-clipboard-list"></i> <span>Estado de Proyecto</span></a></li>
                    </ul>
                    <ul className={styles.logout}>
                        <li><a href="#"><i className="fas fa-cog"></i> <span>Configuracion</span></a></li>
                        <li><a href="http://localhost:3000"><i className="fas fa-sign-out-alt"></i> <span>Salir</span></a></li>
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
                            <img src={locoAvatar} alt="User Avatar" />
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
                                    <th>Cedula</th>
                                    <th>Primer Nombre</th>
                                    <th>Segundo Nombre</th>
                                    <th>Primer Apellido</th>
                                    <th>Segundo Apellido</th>
                                    <th>Carrera</th>
                                    <th>Tutor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isEditing && selectedRowId === 'new-row' && (
                                    <tr className={styles.selected}>
                                        <td><input type="text" value={newRowData.cedulaEstudiante} onChange={(e) => handleInputChange(e, 'cedulaEstudiante')} /></td>
                                        <td><input type="text" value={newRowData['1er_nombre']} onChange={(e) => handleInputChange(e, '1er_nombre')} /></td>
                                        <td><input type="text" value={newRowData['2do_nombre']} onChange={(e) => handleInputChange(e, '2do_nombre')} /></td>
                                        <td><input type="text" value={newRowData['1er_ape']} onChange={(e) => handleInputChange(e, '1er_ape')} /></td>
                                        <td><input type="text" value={newRowData['2do_ape']} onChange={(e) => handleInputChange(e, '2do_ape')} /></td>
                                        <td>
                                            <select
                                                className="form-select"
                                                value={careerOptions.find(option => careerIdMap[option] === newRowData.idcarrera) || ''}
                                                onChange={(e) => handleInputChange({ target: { value: careerIdMap[e.target.value] } }, 'idcarrera')}
                                            >
                                                <option value="">Seleccione una carrera</option>
                                                {careerOptions.map((option, index) => (
                                                    <option key={index} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className="form-select"
                                                value={newRowData.cedulaTutor}
                                                onChange={(e) => handleInputChange(e, 'cedulaTutor')}
                                            >
                                                <option value="">Seleccione un tutor</option>
                                                {tutors.map((tutor, index) => (
                                                    <option key={index} value={tutor.cedulaTutor}>
                                                        {`${tutor['1er_nombre']} ${tutor['1er_ape']}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                )}
                                {students.map(student => (
                                    <tr
                                        key={student.cedula}
                                        className={selectedRowId === student.cedula ? styles.selected : ''}
                                        onClick={(e) => handleRowClick(e, student.cedula)}
                                        style={{ cursor: isEditing ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isEditing && selectedRowId === student.cedula ? (
                                            <>
                                                <td><input type="text" value={newRowData.cedulaEstudiante} onChange={(e) => handleInputChange(e, 'cedulaEstudiante')} /></td>
                                                <td><input type="text" value={newRowData['1er_nombre']} onChange={(e) => handleInputChange(e, '1er_nombre')} /></td>
                                                <td><input type="text" value={newRowData['2do_nombre']} onChange={(e) => handleInputChange(e, '2do_nombre')} /></td>
                                                <td><input type="text" value={newRowData['1er_ape']} onChange={(e) => handleInputChange(e, '1er_ape')} /></td>
                                                <td><input type="text" value={newRowData['2do_ape']} onChange={(e) => handleInputChange(e, '2do_ape')} /></td>
                                                <td>
                                                    <select
                                                        className="form-select"
                                                        value={careerOptions.find(option => careerIdMap[option] === newRowData.idcarrera) || ''}
                                                        onChange={(e) => handleInputChange({ target: { value: careerIdMap[e.target.value] } }, 'idcarrera')}
                                                    >
                                                        <option value="">Seleccione una carrera</option>
                                                        {careerOptions.map((option, index) => (
                                                            <option key={index} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-select"
                                                        value={newRowData.cedulaTutor}
                                                        onChange={(e) => handleInputChange(e, 'cedulaTutor')}
                                                    >
                                                        <option value="">Seleccione un tutor</option>
                                                        {tutors.map((tutor, index) => (
                                                            <option key={index} value={tutor.cedulaTutor}>
                                                                {`${tutor['1er_nombre']} ${tutor['1er_ape']}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{student.cedula}</td>
                                                <td>{student.firstName}</td>
                                                <td>{student.secondName}</td>
                                                <td>{student.lastName}</td>
                                                <td>{student.secondLastName}</td>
                                                <td>{student.career}</td>
                                                <td>
                                                    {tutors.find(tutor => tutor.cedulaTutor === student.cedulaTutor)
                                                        ? `${tutors.find(tutor => tutor.cedulaTutor === student.cedulaTutor)['1er_nombre']} ${tutors.find(tutor => tutor.cedulaTutor === student.cedulaTutor)['1er_ape']}`
                                                        : student.cedulaTutor}
                                                </td>
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