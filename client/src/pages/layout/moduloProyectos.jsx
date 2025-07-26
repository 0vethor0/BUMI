import React, { useState, useEffect } from 'react';
import axios from 'axios';
import locoAvatar from '../../image/logo.png';
import styles from '../styles/ModuloProyectos.module.css';

const ModuloProyectos = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newRowData, setNewRowData] = useState({
        idproyecto: '',
        title: '',
        objectiveGeneral: '',
        objectivesSpecific: '',
        type: '',
        summary: '',
        pdf: null
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/consultar_todos_los_proyectos/');
            const mappedProjects = response.data.map(project => ({
                idproyecto: project.idproyecto,
                title: project.Titulo,
                objectiveGeneral: project.objetivo_general,
                objectivesSpecific: project.objetivos_especificos,
                summary: project.resumen,
                type: project.tipoInvestigacion,
                authors: project.authors || 'TBD'
            }));
            setProjects(mappedProjects);
            setSelectedRowId(null);
            console.log('Proyectos cargados:', mappedProjects);
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
            alert('Error al cargar los proyectos');
        }
    };

    const handleSearchClick = async () => {
        if (!searchTerm.trim()) {
            alert('Por favor, ingrese un título para buscar.');
            setProjects([]);
            return;
        }
        try {
            const response = await axios.get(`http://localhost:8000/api/buscar_proyecto_titulo?busqueda=${searchTerm}`);
            if (response.data.message === 'No se encontraron proyectos con ese título') {
                alert('No se encontró un proyecto con ese título.');
                setProjects([]);
            } else {
                const mappedProjects = response.data.map(project => ({
                    idproyecto: project.idproyecto,
                    title: project.Titulo,
                    objectiveGeneral: project.objetivo_general,
                    objectivesSpecific: project.objetivos_especificos,
                    summary: project.resumen,
                    type: project.tipoInvestigacion,
                    authors: project.authors || 'TBD'
                }));
                setProjects(mappedProjects);
                console.log('Resultados de búsqueda:', mappedProjects);
            }
            setSelectedRowId(null);
        } catch (error) {
            console.error('Error al buscar proyectos:', error);
            alert('Error al buscar proyectos');
        }
    };

    const handleResetSearch = () => {
        setSearchTerm('');
        fetchProjects();
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleProjectClick = (e, idproyecto) => {
        e.stopPropagation();
        if (isEditing) {
            console.log('Clic en proyecto ignorado: Modo edición activo');
            return;
        }
        if (!idproyecto) {
            console.error('ID de proyecto inválido:', idproyecto);
            return;
        }
        setSelectedRowId(idproyecto);
        console.log('Proyecto clicado, ID:', idproyecto, 'Nuevo selectedRowId:', idproyecto);
    };

    const handleNewClick = () => {
        if (isEditing) {
            alert('Por favor, guarda o cancela la edición actual antes de añadir un nuevo proyecto.');
            return;
        }
        setSelectedRowId('new-row');
        setIsEditing(true);
        setNewRowData({
            idproyecto: '',
            title: '',
            objectiveGeneral: '',
            objectivesSpecific: '',
            type: '',
            summary: '',
            pdf: null
        });
        console.log('Nuevo proyecto iniciado, selectedRowId:', 'new-row', 'isEditing:', true);
    };

    const handleModifyClick = async () => {
        console.log('Modificar clicado, selectedRowId:', selectedRowId, 'isEditing:', isEditing);
        if (!selectedRowId && !isEditing) {
            alert('Por favor, selecciona un proyecto para modificar.');
            return;
        }

        if (!isEditing) {
            setIsEditing(true);
            const projectToEdit = projects.find(project => project.idproyecto === selectedRowId);
            if (projectToEdit) {
                setNewRowData({
                    idproyecto: projectToEdit.idproyecto,
                    title: projectToEdit.title,
                    objectiveGeneral: projectToEdit.objectiveGeneral || '',
                    objectivesSpecific: projectToEdit.objectivesSpecific || '',
                    type: projectToEdit.type,
                    summary: projectToEdit.summary,
                    pdf: projectToEdit.pdf || null
                });
                console.log('Editando proyecto:', projectToEdit);
            } else {
                console.error('Proyecto para editar no encontrado para idproyecto:', selectedRowId);
            }
        } else {
            const isEmpty = ['title', 'objectiveGeneral', 'objectivesSpecific', 'type', 'summary'].some(field => newRowData[field].toString().trim() === '');
            if (isEmpty) {
                alert('Todos los campos deben ser rellenados.');
                return;
            }

            try {
                const dataToSend = {
                    Titulo: newRowData.title,
                    objetivo_general: newRowData.objectiveGeneral,
                    objetivos_especificos: newRowData.objectivesSpecific,
                    resumen: newRowData.summary,
                    tipoInvestigacion: newRowData.type
                };
                if (selectedRowId === 'new-row') {
                    await axios.post('http://localhost:8000/api/crear_proyecto', dataToSend);
                } else {
                    await axios.put(`http://localhost:8000/api/actualizar_proyecto/${selectedRowId}`, dataToSend);
                }
                await fetchProjects();
                setIsEditing(false);
                setSelectedRowId(null);
                setNewRowData({
                    idproyecto: '',
                    title: '',
                    objectiveGeneral: '',
                    objectivesSpecific: '',
                    type: '',
                    summary: '',
                    pdf: null
                });
                alert('Cambios guardados exitosamente.');
                console.log('Cambios guardados, estado reseteado');
            } catch (error) {
                console.error('Error al guardar proyecto:', error);
                alert('Error al guardar los cambios');
            }
        }
    };

    const handleDeleteClick = async () => {
        console.log('Eliminar clicado, selectedRowId:', selectedRowId, 'isEditing:', isEditing);
        if (!selectedRowId && !isEditing) {
            alert('Por favor, selecciona un proyecto para eliminar.');
            return;
        }

        if (isEditing) {
            setIsEditing(false);
            setSelectedRowId(null);
            setNewRowData({
                idproyecto: '',
                title: '',
                objectiveGeneral: '',
                objectivesSpecific: '',
                type: '',
                summary: '',
                pdf: null
            });
            alert('Edición cancelada.');
            console.log('Edición cancelada, estado reseteado');
        } else {
            if (window.confirm('¿Estás seguro de que quieres eliminar el proyecto seleccionado?')) {
                try {
                    await axios.delete(`http://localhost:8000/api/eliminar_proyecto/${selectedRowId}`);
                    await fetchProjects();
                    setSelectedRowId(null);
                    alert('Proyecto eliminado.');
                    console.log('Proyecto eliminado, selectedRowId reseteado');
                } catch (error) {
                    console.error('Error al eliminar proyecto:', error);
                    alert('Error al eliminar el proyecto');
                }
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRowData({ ...newRowData, [name]: value });
    };

    const handleFileChange = (e) => {
        setNewRowData({ ...newRowData, pdf: e.target.files[0] });
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
                    <div className={styles.logo} onClick={toggleSidebar}><i className="fas fa-bars"></i></div>
                    <span className={styles.appName}>Bumi Unefa</span>
                </div>
                <nav className={styles.sidebarNav}>
                    <ul>
                        <li><a href="#"><i className="fas fa-chart-line"></i> <span>Dashboard</span></a></li>
                        <li><a href="http://localhost:3000/moduloTutores"><i className="fas fa-chalkboard-teacher"></i> <span>Tutores</span></a></li>
                        <li><a href="http://localhost:3000/moduloEstudiantes"><i className="fas fa-user-graduate"></i> <span>Estudiantes</span></a></li>
                        <li><a href="#"><i className="fas fa-users"></i> <span>Grupos</span></a></li>
                        <li className={styles.active}><a href="#"><i className="fas fa-project-diagram"></i> <span>Proyectos</span></a></li>
                        <li><a href="#"><i className="fas fa-clipboard-list"></i> <span>Estado de Proyecto</span></a></li>
                    </ul>
                    <ul className={styles.logout}>
                        <li><a href="#"><i className="fas fa-cog"></i> <span>Configuración</span></a></li>
                        <li><a href="http://localhost:3000"><i className="fas fa-sign-out-alt"></i> <span>Salir</span></a></li>
                    </ul>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1>Modulo de Proyectos</h1>
                    <div className={styles.headerIcons}>
                        <button className={styles.iconButton}><i className="fas fa-ellipsis-v"></i></button>
                        <button className={styles.iconButton}><i className="fas fa-bell"></i></button>
                        <div className={styles.headerProfile}><img src={locoAvatar} alt="User Avatar" /></div>
                    </div>
                </header>

                {!isEditing && (
                    <div className={styles.card}>
                        <div className={styles.searchBar}>
                            <i className="fas fa-search"></i>
                            <input 
                                type="text" 
                                placeholder="Buscar por título..." 
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

                        <div className={styles.projectList}>
                            {projects.map(project => (
                                <div
                                    key={project.idproyecto}
                                    className={`${styles.projectItem} ${selectedRowId === project.idproyecto ? styles.selected : ''}`}
                                    onClick={(e) => handleProjectClick(e, project.idproyecto)}
                                    style={{ cursor: isEditing ? 'not-allowed' : 'pointer' }}
                                >
                                    <div className={styles.projectContent}>
                                        <strong>{project.title}</strong> <a href="#">VER PDF</a>
                                        <p>{project.summary}</p>
                                        <span className={styles.filter}>Filtro por: {project.type}</span>
                                        <p>{project.authors}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.actions}>
                            <button 
                                className={`${styles.button} ${styles.buttonSecondary}`} 
                                onClick={handleNewClick} 
                                disabled={isEditing}
                            >
                                Nuevo
                            </button>
                            <button 
                                className={`${styles.button} ${styles.buttonOutline}`} 
                                onClick={handleModifyClick}
                                disabled={!selectedRowId && !isEditing}
                            >
                                {getButtonText('modify')}
                            </button>
                            <button 
                                className={`${styles.button} ${styles.buttonDanger}`} 
                                onClick={handleDeleteClick}
                                disabled={!selectedRowId && !isEditing}
                            >
                                {getButtonText('delete')}
                            </button>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <div className={styles.fullScreenForm}>
                        <header className={styles.header}>
                            <h1>{selectedRowId === 'new-row' ? 'Registro de Nuevo Proyecto' : 'Modificar Proyecto'}</h1>
                            <div className={styles.headerIcons}>
                                <button 
                                    className={styles.iconButton} 
                                    onClick={handleDeleteClick}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </header>
                        <div className={styles.formCard}>
                            <div className={styles.formContainer}>
                                <div className={styles.formColumn}>
                                    <div className={styles.formGroup}>
                                        <label>Título</label>
                                        <input 
                                            type="text" 
                                            name="title" 
                                            value={newRowData.title} 
                                            onChange={handleInputChange} 
                                            placeholder="Ingrese el Título del Proyecto:" 
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Objetivo General</label>
                                        <input 
                                            type="text" 
                                            name="objectiveGeneral" 
                                            value={newRowData.objectiveGeneral} 
                                            onChange={handleInputChange} 
                                            placeholder="Ingrese el Objetivo General del Proyecto:" 
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Objetivos Específicos</label>
                                        <textarea 
                                            name="objectivesSpecific" 
                                            value={newRowData.objectivesSpecific} 
                                            onChange={handleInputChange} 
                                            placeholder="Ingrese y enumere los objetivos específicos que desea guardar:" 
                                        />
                                    </div>
                                </div>
                                <div className={styles.formColumn}>
                                    <div className={styles.formGroup}>
                                        <label>Tipo de Investigación</label>
                                        <input 
                                            type="text" 
                                            name="type" 
                                            value={newRowData.type} 
                                            onChange={handleInputChange} 
                                            placeholder="Ingrese el tipo de investigación. Ej: Cuantitativo" 
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Resumen</label>
                                        <textarea 
                                            name="summary" 
                                            value={newRowData.summary} 
                                            onChange={handleInputChange} 
                                            placeholder="Ingrese el resumen de la investigación:" 
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Adjuntar Documento en PDF</label>
                                        <div className={`${styles.fileInputContainer} ${newRowData.pdf ? styles.fileSelected : ''}`}>
                                            <input id="fileInput" type="file" accept="application/pdf" onChange={handleFileChange} />
                                            <button className={styles.uploadButton}>Subir</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button 
                                className={styles.saveButton} 
                                onClick={handleModifyClick}
                            >
                                {getButtonText('modify')}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModuloProyectos;