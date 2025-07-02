import React, { useState } from 'react';
import locoAvatar from '../../image/logo.png';
import styles from '../styles/ModuloProyectos.module.css';

const ModuloProyectos = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [projects, setProjects] = useState([
        { id: 1, title: 'Diseño de un sistema de control domótico...', description: 'Informe técnico, libro, artículo, junio 2023', authors: 'David Cortes, Mario Lopez, Luisa Sampayo', type: 'trabajo especial de grado' }
    ]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', objectiveGeneral: '', objectivesSpecific: '', type: '', summary: '', pdf: null });
    const [editProject, setEditProject] = useState({ id: null, title: '', objectiveGeneral: '', objectivesSpecific: '', type: '', summary: '', pdf: null });

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    const handleProjectClick = (id) => setSelectedProjectId(id === selectedProjectId ? null : id);

    const handleNewInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject({ ...newProject, [name]: value });
    };

    const handleNewFileChange = (e) => {
        setNewProject({ ...newProject, pdf: e.target.files[0] });
    };

    const handleSaveNewProject = () => {
        const newId = projects.length + 1;
        setProjects([...projects, { id: newId, title: newProject.title, description: newProject.summary, authors: 'TBD', type: newProject.type }]);
        setNewProject({ title: '', objectiveGeneral: '', objectivesSpecific: '', type: '', summary: '', pdf: null });
        setShowNewForm(false);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditProject({ ...editProject, [name]: value });
    };

    const handleEditFileChange = (e) => {
        setEditProject({ ...editProject, pdf: e.target.files[0] });
    };

    const handleEditProject = (project) => {
        setEditProject({ ...project });
        setShowEditForm(true);
    };

    const handleSaveEditProject = () => {
        setProjects(projects.map(p => p.id === editProject.id ? { ...editProject, description: editProject.summary } : p));
        setShowEditForm(false);
    };

    const handleDeleteProject = (id) => {
        setProjects(projects.filter(p => p.id !== id));
        setSelectedProjectId(null);
    };

    return (
        <div className={`${styles.container} ${sidebarCollapsed ? styles.collapsed : ''}`}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo} onClick={toggleSidebar}><i className="fas fa-bars"></i></div>
                    <span className={styles.appName}>Bumi Unefa</span>
                </div>
                <nav className={styles.sidebarNav}>
                    <ul>
                        <li><a href="#"><i className="fas fa-chart-line"></i> <span>Dashboard</span></a></li>
                        <li><a href="#"><i className="fas fa-chalkboard-teacher"></i> <span>Tutores</span></a></li>
                        <li><a href="#"><i className="fas fa-user-graduate"></i> <span>Estudiantes</span></a></li>
                        <li><a href="#"><i className="fas fa-users"></i> <span>Grupos</span></a></li>
                        <li className={styles.active}><a href="#"><i className="fas fa-project-diagram"></i> <span>Proyectos</span></a></li>
                        <li><a href="#"><i className="fas fa-clipboard-list"></i> <span>Estado de Proyecto</span></a></li>
                    </ul>
                    <ul className={styles.logout}>
                        <li><a href="#"><i className="fas fa-cog"></i> <span>Configuración</span></a></li>
                        <li><a href="#"><i className="fas fa-sign-out-alt"></i> <span>Salir</span></a></li>
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

                {!showNewForm && !showEditForm && (
                    <div className={styles.card}>
                        <div className={styles.searchBar}>
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Search..." />
                            <button className={styles.searchButton}>Buscar</button>
                        </div>

                        <div className={styles.projectList}>
                            {projects.map(project => (
                                <div
                                    key={project.id}
                                    className={`${styles.projectItem} ${selectedProjectId === project.id ? styles.selected : ''}`}
                                    onClick={() => handleProjectClick(project.id)}
                                >
                                    <div className={styles.projectContent}>
                                        <strong>{project.title}</strong> <a href="#">VER PDF</a>
                                        <p>{project.description}</p>
                                        <span className={styles.filter}>Filtro por: {project.type}</span>
                                        <p>{project.authors}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.pagination}>
                            <button>Anterior</button>
                            <span>1 2 3 4 5 6 7 8 9 ...</span>
                            <button>Siguiente</button>
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.button} onClick={() => setShowNewForm(true)}>Nuevo</button>
                            <button className={styles.button} onClick={() => selectedProjectId && handleEditProject(projects.find(p => p.id === selectedProjectId))}>Modificar</button>
                            <button className={styles.deleteButton} onClick={() => selectedProjectId && handleDeleteProject(selectedProjectId)}>Eliminar</button>
                        </div>
                    </div>
                )}

                {showNewForm && (
                    <div className={styles.fullScreenForm}>
                        <header className={styles.header}>
                            <h1>Registro de Nuevo Proyecto</h1>
                            <div className={styles.headerIcons}>
                                <button className={styles.iconButton} onClick={() => setShowNewForm(false)}><i className="fas fa-times"></i></button>
                            </div>
                        </header>
                        <div className={styles.formCard}>
                            <div className={styles.formContainer}>
                                <div className={styles.formColumn}>
                                    <div className={styles.formGroup}>
                                        <label>Título</label>
                                        <input type="text" name="title" value={newProject.title} onChange={handleNewInputChange} placeholder="Ingrese el Título del Proyecto:" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Objetivo General</label>
                                        <input type="text" name="objectiveGeneral" value={newProject.objectiveGeneral} onChange={handleNewInputChange} placeholder="Ingrese el Objetivo General del Proyecto:" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Objetivos Específicos</label>
                                        <textarea name="objectivesSpecific" value={newProject.objectivesSpecific} onChange={handleNewInputChange} placeholder="Ingrese y enumere los objetivos específicos que desea guardar:" />
                                    </div>
                                </div>
                                <div className={styles.formColumn}>
                                    <div className={styles.formGroup}>
                                        <label>Tipo de Investigación</label>
                                        <input type="text" name="type" value={newProject.type} onChange={handleNewInputChange} placeholder="Ingrese el tipo de investigación. Ej: Cuantitativo" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Resumen</label>
                                        <textarea name="summary" value={newProject.summary} onChange={handleNewInputChange} placeholder="Ingrese el resumen de la investigación:" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Adjuntar Documento en PDF</label>
                                        <div className={`${styles.fileInputContainer} ${newProject.pdf ? styles.fileSelected : ''}`}>
                                            
                                            <input id="newFileInput" type="file" accept="application/pdf" onChange={handleNewFileChange} />
                                            <button className={styles.uploadButton}>Subir</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className={styles.saveButton} onClick={handleSaveNewProject}>Guardar</button>
                        </div>
                    </div>
                )}

                {showEditForm && (
                    <div className={styles.fullScreenForm}>
                        <header className={styles.header}>
                            <h1>Modificar Proyecto</h1>
                            <div className={styles.headerIcons}>
                                <button className={styles.iconButton} onClick={() => setShowEditForm(false)}><i className="fas fa-times"></i></button>
                            </div>
                        </header>
                        <div className={styles.formCard}>
                            <div className={styles.formContainer}>
                                <div className={styles.formColumn}>
                                    <div className={styles.formGroup}>
                                        <label>Título</label>
                                        <input type="text" name="title" value={editProject.title} onChange={handleEditInputChange} placeholder="Ingrese el Título del Proyecto:" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Objetivo General</label>
                                        <input type="text" name="objectiveGeneral" value={editProject.objectiveGeneral} onChange={handleEditInputChange} placeholder="Ingrese el Objetivo General del Proyecto:" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Objetivos Específicos</label>
                                        <textarea name="objectivesSpecific" value={editProject.objectivesSpecific} onChange={handleEditInputChange} placeholder="Ingrese y enumere los objetivos específicos que desea guardar:" />
                                    </div>
                                </div>
                                <div className={styles.formColumn}>
                                    <div className={styles.formGroup}>
                                        <label>Tipo de Investigación</label>
                                        <input type="text" name="type" value={editProject.type} onChange={handleEditInputChange} placeholder="Ingrese el tipo de investigación. Ej: Cuantitativo" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Resumen</label>
                                        <textarea name="summary" value={editProject.summary} onChange={handleEditInputChange} placeholder="Ingrese el resumen de la investigación:" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Adjuntar Documento en PDF</label>
                                        <div className={`${styles.fileInputContainer} ${editProject.pdf ? styles.fileSelected : ''}`}>

                                            <input id="editFileInput" type="file" accept="application/pdf" onChange={handleEditFileChange} />
                                            <button className={styles.uploadButton}>Subir</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className={styles.saveButton} onClick={handleSaveEditProject}>Modificar</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModuloProyectos;