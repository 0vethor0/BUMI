import React, { useState } from 'react';
import locoAvatar from '../../image/logo.png';
import styles from '../styles/ModuloEstudiantes.module.css';

const ModuloEstudiantes = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [students, setStudents] = useState([
        { id: 1, cedula: 'V30523083', firstName: 'Yander', lastName: 'Graterol', career: 'Ing en Sistemas', group: 'Grupo A' }
    ]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newRowData, setNewRowData] = useState({
        cedula: '',
        firstName: '',
        lastName: '',
        career: '',
        group: ''
    });

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleRowClick = (id) => {
        if (isEditing) return;

        if (selectedRowId === id) {
            setSelectedRowId(null);
        } else {
            setSelectedRowId(id);
        }
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
            firstName: '',
            lastName: '',
            career: '',
            group: ''
        });
    };

    const handleModifyClick = () => {
        if (!selectedRowId) {
            alert('Por favor, selecciona una fila para modificar.');
            return;
        }

        if (!isEditing) {
            setIsEditing(true);
            const rowToEdit = students.find(student => student.id === selectedRowId);
            if (rowToEdit) {
                const { id, ...rest } = rowToEdit;
                setNewRowData(rest);
            } else if (selectedRowId === 'new-row') {
                setNewRowData({
                    cedula: '',
                    firstName: '',
                    lastName: '',
                    career: '',
                    group: ''
                });
            }
        } else {
            const isEmpty = Object.values(newRowData).some(value => value.trim() === '');
            if (isEmpty) {
                alert('Todos los campos deben ser rellenados.');
                return;
            }

            if (selectedRowId === 'new-row') {
                setStudents([...students, { ...newRowData, id: Date.now() }]);
            } else {
                setStudents(students.map(student =>
                    student.id === selectedRowId
                        ? { ...student, ...newRowData }
                        : student
                ));
            }
            setIsEditing(false);
            setSelectedRowId(null);
            setNewRowData({
                cedula: '',
                firstName: '',
                lastName: '',
                career: '',
                group: ''
            });
            alert('Cambios guardados exitosamente.');
        }
    };

    const handleDeleteClick = () => {
        if (!selectedRowId) {
            alert('Por favor, selecciona una fila para eliminar.');
            return;
        }

        if (isEditing) {
            setIsEditing(false);
            setSelectedRowId(null);
            setNewRowData({
                cedula: '',
                firstName: '',
                lastName: '',
                career: '',
                group: ''
            });
            alert('Edición cancelada.');
        } else {
            if (window.confirm('¿Estás seguro de que quieres eliminar la fila seleccionada?')) {
                setStudents(students.filter(student => student.id !== selectedRowId));
                setSelectedRowId(null);
                alert('Fila eliminada.');
            }
        }
    };

    const handleInputChange = (e, field) => {
        setNewRowData({ ...newRowData, [field]: e.target.value });
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
                        <li><a href="http://localhost:3000/moduloTutores"><i className="fas fa-chalkboard-teacher"></i> <span>Tutores</span></a></li>
                        <li className={styles.active}><a href="#"><i className="fas fa-user-graduate"></i> <span>Estudiantes</span></a></li>
                        <li><a href="#"><i className="fas fa-users"></i> <span>Grupos</span></a></li>
                        <li><a href="#"><i className="fas fa-project-diagram"></i> <span>Proyectos</span></a></li>
                        <li><a href="#"><i className="fas fa-clipboard-list"></i> <span>Estado de Proyecto</span></a></li>
                    </ul>
                    <ul className={styles.logout}>
                        <li><a href="#"><i className="fas fa-cog"></i> <span>Configuracion</span></a></li>
                        <li><a href="#"><i className="fas fa-sign-out-alt"></i> <span>Salir</span></a></li>
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
                        <input type="text" placeholder="Search..." />
                    </div>

                    <div className={styles.dataTableContainer}>
                        <table className={styles.dataTable} id="studentsTable">
                            <thead>
                                <tr>
                                    <th>Cedula</th>
                                    <th>Primer Nombre</th>
                                    <th>Primer Apellido</th>
                                    <th>Carrera</th>
                                    <th>Agrupación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isEditing && selectedRowId === 'new-row' && (
                                    <tr className={styles.selected}>
                                        <td><input type="text" value={newRowData.cedula} onChange={(e) => handleInputChange(e, 'cedula')} /></td>
                                        <td><input type="text" value={newRowData.firstName} onChange={(e) => handleInputChange(e, 'firstName')} /></td>
                                        <td><input type="text" value={newRowData.lastName} onChange={(e) => handleInputChange(e, 'lastName')} /></td>
                                        <td><input type="text" value={newRowData.career} onChange={(e) => handleInputChange(e, 'career')} /></td>
                                        <td><input type="text" value={newRowData.group} onChange={(e) => handleInputChange(e, 'group')} /></td>
                                    </tr>
                                )}
                                {students.map(student => (
                                    <tr
                                        key={student.id}
                                        className={selectedRowId === student.id ? styles.selected : ''}
                                        onClick={() => handleRowClick(student.id)}
                                    >
                                        {isEditing && selectedRowId === student.id ? (
                                            <>
                                                <td><input type="text" value={newRowData.cedula} onChange={(e) => handleInputChange(e, 'cedula')} /></td>
                                                <td><input type="text" value={newRowData.firstName} onChange={(e) => handleInputChange(e, 'firstName')} /></td>
                                                <td><input type="text" value={newRowData.lastName} onChange={(e) => handleInputChange(e, 'lastName')} /></td>
                                                <td><input type="text" value={newRowData.career} onChange={(e) => handleInputChange(e, 'career')} /></td>
                                                <td><input type="text" value={newRowData.group} onChange={(e) => handleInputChange(e, 'group')} /></td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{student.cedula}</td>
                                                <td>{student.firstName}</td>
                                                <td>{student.lastName}</td>
                                                <td>{student.career}</td>
                                                <td>{student.group}</td>
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