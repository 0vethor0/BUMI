    
    'use server';

/**
 * Acciones del Servidor (Server Actions) para el área protegida.
 * Este archivo centraliza la lógica de negocio que interactúa con la base de datos Supabase.
 * Al usar 'use server', estas funciones se ejecutan exclusivamente en el servidor.
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Obtiene el área de investigación asignada al usuario actual.
 * Utiliza una función RPC de PostgreSQL para identificar el área del usuario.
 * 
 * @returns {Promise<Object>} Un objeto con el ID y el nombre del área.
 */
export async function getUserAreaAction() {
    const supabase = await createClient();
    // Llama al procedimiento almacenado 'get_user_area' en la DB.
    const { data: areaId, error: rpcError } = await supabase.rpc('get_user_area');
    if (rpcError) throw rpcError;
    
    // Si no hay área asignada, retorna valores nulos.
    if (areaId === null) {
        return { id: null, name: 'Sin área asignada' };
    }
    
    // Consulta el nombre del área en la tabla 'tbareainvestigacion'.
    const { data: areaData, error: areaError } = await supabase
        .from('tbareainvestigacion')
        .select('nomb_area')
        .eq('id', areaId)
        .single();
    if (areaError) throw areaError;
    
    return { id: areaId, name: areaData?.nomb_area || 'Área no encontrada' };
}

/**
 * Lista todas las áreas de investigación disponibles en el sistema.
 * 
 * @returns {Promise<Array>} Arreglo de objetos con ID y nombre del área.
 */
export async function fetchAllAreasAction() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tbareainvestigacion')
        .select('id, nomb_area');
    if (error) throw error;
    return data || [];
}

/**
 * Obtiene todos los proyectos de investigación.
 * Mapea los resultados para asegurar que campos opcionales no sean nulos.
 * 
 * @returns {Promise<Array>} Lista de proyectos procesada.
 */
export async function listProjectsAction() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('tbproyecto').select('*');
    if (error) throw error;
    
    // Procesa cada proyecto para evitar valores nulos en el frontend.
    const mapped = (data || []).map((project: any) => ({
        ...project,
        titulo: project.titulo || '',
        resumen: project.resumen || '',
        pdf_url: project.pdf_url || '',
    }));
    return mapped;
}

/**
 * Realiza una búsqueda de proyectos utilizando una función de búsqueda insensible a acentos.
 * 
 * @param {string} searchTerm - Término de búsqueda.
 * @returns {Promise<Array>} Resultados de la búsqueda.
 */
export async function searchProjectsAction(searchTerm: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .rpc('search_projects_unaccent', { term: searchTerm, limit_count: 20 });

    if (error) throw error;
    return data || [];
}

/**
 * Crea o actualiza un proyecto en la base de datos.
 * 
 * @param {string|number} selectedRowId - ID de la fila ('new-row' para inserción).
 * @param {Object} payload - Datos del proyecto a guardar.
 */
export async function saveProjectAction(selectedRowId: string | number, payload: any) {
    const supabase = await createClient();
    let error;
    
    if (selectedRowId === 'new-row') {
        // Inserta un nuevo registro si el ID es 'new-row'.
        ({ error } = await supabase.from('tbproyecto').insert([payload]));
    } else {
        // Actualiza el registro existente basado en su ID.
        ({ error } = await supabase
            .from('tbproyecto')
            .update(payload)
            .eq('id', selectedRowId));
    }
    
    if (error) throw error;
    return { ok: true };
}

/**
 * Elimina un proyecto por su ID.
 * 
 * @param {number} id - ID del proyecto a eliminar.
 */
export async function deleteProjectAction(id: number) {
    const supabase = await createClient();
    const { error } = await supabase.from('tbproyecto').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
}

/**
 * Lista los tutores asociados al área del usuario actual.
 * Realiza un mapeo para estandarizar los nombres de las propiedades.
 * 
 * @returns {Promise<Array>} Lista de tutores procesada.
 */
export async function listTutorsAction() {
    const supabase = await createClient();
    const area = await getUserAreaAction();
    if (!area.id) return [];
    
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
    
    // Mapea los campos de la DB a una estructura más amigable para el frontend.
    return (data || []).map((tutor: any) => ({
        id: tutor.cedula_tutor,
        cedula: tutor.cedula_tutor,
        firstName: [tutor.primer_nomb, tutor.segundo_nomb].filter(Boolean).join(' '),
        lastName: [tutor.primer_ape, tutor.segundo_ape].filter(Boolean).join(' '),
    }));
}

export async function searchTutorsAction(term: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tbtutor')
    .select(`
      cedula_tutor,
      created_at,
      primer_nomb,
      segundo_nomb,
      primer_ape,
      segundo_ape
    `)
    .or(`
      cedula_tutor.ilike.%${term}%,
      primer_nomb.ilike.%${term}%,
      segundo_nomb.ilike.%${term}%,
      primer_ape.ilike.%${term}%,
      segundo_ape.ilike.%${term}%
    `);
  if (error) throw error;
  return (data || []).map((tutor: any) => ({
    id: tutor.cedula_tutor,
    cedula: tutor.cedula_tutor,
    firstName: [tutor.primer_nomb, tutor.segundo_nomb].filter(Boolean).join(' '),
    lastName: [tutor.primer_ape, tutor.segundo_ape].filter(Boolean).join(' '),
  }));
}

export async function saveTutorAction(selectedRowId: string | number, newRowData: any) {
  const supabase = await createClient();
  const area = await getUserAreaAction();
  if (!area.id) {
    throw new Error('No tienes área asignada. Contacta al administrador.');
  }

  // Preparar payload parcial
  const payload: Partial<any> = {};
  if (newRowData.primer_nomb !== undefined) payload.primer_nomb = newRowData.primer_nomb;
  if (newRowData.segundo_nomb !== undefined) payload.segundo_nomb = newRowData.segundo_nomb;
  if (newRowData.primer_ape !== undefined) payload.primer_ape = newRowData.primer_ape;
  if (newRowData.segundo_ape !== undefined) payload.segundo_ape = newRowData.segundo_ape;

  // Detectar si cedula_tutor cambió (PK)
  const oldCedula = selectedRowId.toString();
  const newCedula = newRowData.cedula_tutor?.toString() || oldCedula;
  const cedulaChanged = newCedula !== oldCedula;
  if (cedulaChanged) {
    payload.cedula_tutor = newCedula;
  }

  let error;
  if (selectedRowId === 'new-row') {
    // Insert nuevo
    ({ error } = await supabase.from('tbtutor').insert([{ ...payload, cedula_tutor: newCedula }]));
    if (error) {
      if (error.code === '23505') return { ok: false, duplicate: true };
      throw error;
    }

    // Asignar visibilidad
    const { error: visError } = await supabase.from('entity_visibility').upsert({
      entity_type: 'tutor',
      entity_id: newCedula,
      area_id: area.id,
      visible: true,
      created_by: (await supabase.auth.getUser()).data.user?.id
    }, { onConflict: 'entity_type, entity_id, area_id' });
    if (visError) throw visError;
  } else {
    // Update existente
    ({ error } = await supabase.from('tbtutor').update(payload).eq('cedula_tutor', oldCedula));
    if (error) {
      if (error.code === '23505') return { ok: false, duplicate: true };
      throw error;  // RLS fallará si no visible
    }

    // Propagación si cedula cambió
    if (cedulaChanged) {
      const { error: visUpdateError } = await supabase
        .from('entity_visibility')
        .update({ entity_id: newCedula })
        .eq('entity_type', 'tutor')
        .eq('entity_id', oldCedula)
        .eq('area_id', area.id);
      if (visUpdateError) throw visUpdateError;
    }

  }

  return { ok: true };
}

export async function deleteTutorAction(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from('tbtutor').delete().eq('cedula_tutor', id);
  if (error) throw error;
  return { ok: true };
}

export async function listCareersAction() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tbcarrera').select('*');
  if (error) throw error;
  return data || [];
}

export async function listStudentsAction() {
  const supabase = await createClient();
  const area = await getUserAreaAction();
  if (!area.id) {
    return [];  // O throw Error si prefieres
  }
  const { data, error } = await supabase
    .from('tbestudiante')
    .select(`
      id,
      created_at,
      primer_nomb,
      segundo_nomb,
      primer_ape,
      segundo_ape,
      id_carrera,
      tbcarrera ( nombre_carrera )
    `);
  if (error) throw error;
  return (data || []).map((student: any) => ({
    id: student.id,
    firstName: [student.primer_nomb, student.segundo_nomb].filter(Boolean).join(' '),
    lastName: [student.primer_ape, student.segundo_ape].filter(Boolean).join(' '),
    career: student.tbcarrera?.nombre_carrera || '',
    id_carrera: student.id_carrera,
  }));
}

export async function searchStudentsAction(term: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tbestudiante')
    .select(`
      id,
      created_at,
      primer_nomb,
      segundo_nomb,
      primer_ape,
      segundo_ape,
      id_carrera,
      tbcarrera ( nombre_carrera )
    `)
    .or(
      `id.ilike.%${term}%, primer_nomb.ilike.%${term}%, segundo_nomb.ilike.%${term}%, primer_ape.ilike.%${term}%, segundo_ape.ilike.%${term}%`
    );
  if (error) throw error;
  return (data || []).map((student: any) => ({
    id: student.id,
    firstName: [student.primer_nomb, student.segundo_nomb].filter(Boolean).join(' '),
    lastName: [student.primer_ape, student.segundo_ape].filter(Boolean).join(' '),
    career: student.tbcarrera?.nombre_carrera || '',
    id_carrera: student.id_carrera,
  }));
}

export async function saveStudentAction(selectedRowId: string | number, newRowData: any) {
  const supabase = await createClient();
  const area = await getUserAreaAction();
  if (!area.id) {
    throw new Error('No tienes área asignada. Contacta al administrador.');
  }

  // Preparar payload parcial (solo campos proporcionados)
  const payload: Partial<any> = {};
  if (newRowData.primer_nomb !== undefined) payload.primer_nomb = newRowData.primer_nomb;
  if (newRowData.segundo_nomb !== undefined) payload.segundo_nomb = newRowData.segundo_nomb;
  if (newRowData.primer_ape !== undefined) payload.primer_ape = newRowData.primer_ape;
  if (newRowData.segundo_ape !== undefined) payload.segundo_ape = newRowData.segundo_ape;
  if (newRowData.id_carrera !== undefined) payload.id_carrera = newRowData.id_carrera ? parseInt(newRowData.id_carrera) : null;

  // Detectar si ID cambió (para PK update)
  const oldId = selectedRowId.toString();
  const newId = newRowData.id?.toString() || oldId;  // Si no se proporciona, mantener old
  const idChanged = newId !== oldId;
  if (idChanged) {
    payload.id = newId;  // Incluir en update si cambió
  }

  let error;
  if (selectedRowId === 'new-row') {
    // Insert nuevo
    ({ error } = await supabase.from('tbestudiante').insert([{ ...payload, id: newId }]));
    if (error) {
      if (error.code === '23505') return { ok: false, duplicate: true };
      throw error;
    }

    // Asignar visibilidad (como antes)
    const { error: visError } = await supabase.from('entity_visibility').upsert({
      entity_type: 'estudiante',
      entity_id: newId,
      area_id: area.id,
      visible: true,
      created_by: (await supabase.auth.getUser()).data.user?.id
    }, { onConflict: 'entity_type, entity_id, area_id' });
    if (visError) throw visError;
  } else {
    // Update existente (parcial, con posible cambio de ID)
    ({ error } = await supabase.from('tbestudiante').update(payload).eq('id', oldId));
    if (error) {
      if (error.code === '23505') return { ok: false, duplicate: true };
      throw error;  // RLS fallará aquí si no visible
    }

    // Si ID cambió, propagar a entity_visibility (y otras tablas tienen CASCADE)
    if (idChanged) {
      const { error: visUpdateError } = await supabase
        .from('entity_visibility')
        .update({ entity_id: newId })
        .eq('entity_type', 'estudiante')
        .eq('entity_id', oldId)
        .eq('area_id', area.id);  // Solo para su área
      if (visUpdateError) throw visUpdateError;
    }
  }

  return { ok: true };
}

export async function deleteStudentAction(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from('tbestudiante').delete().eq('id', id);
  if (error) throw error;
  return { ok: true };
}

export async function groupsListAction(userAreaId?: number) {
  const supabase = await createClient();
  const { data: gruposData, error: gruposError } = await supabase
    .from('tbgrupos')
    .select(`
      cedula_estudiante,
      id_proyecto,
      periodo_academico,
      nombre_grupo,
      estado,
      created_by
    `)
    .order('nombre_grupo', { ascending: true });
  if (gruposError) throw gruposError;
  if (!gruposData || gruposData.length === 0) return [];

  const proyectoIds = gruposData
    .map((g: any) => g.id_proyecto)
    .filter((v: any) => v !== undefined && v !== null)
    .filter((v: any, i: number, arr: any[]) => arr.indexOf(v) === i);
  let proyectosMap: Record<string, any> = {};
  if (proyectoIds.length > 0) {
    const { data: proyectosData } = await supabase
      .from('tbproyecto')
      .select('id, titulo, id_area_investigacion')
      .in('id', proyectoIds);
    (proyectosData || []).forEach((p: any) => (proyectosMap[p.id] = p));
  }

  const cedulasEstudiantes = gruposData
    .map((g: any) => g.cedula_estudiante)
    .filter((v: any) => v !== undefined && v !== null)
    .filter((v: any, i: number, arr: any[]) => arr.indexOf(v) === i);
  let estudiantesMap: Record<string, string> = {};
  if (cedulasEstudiantes.length > 0) {
    const { data: estudiantesData } = await supabase
      .from('tbestudiante')
      .select('id, primer_nomb, primer_ape, segundo_nomb, segundo_ape')
      .in('id', cedulasEstudiantes);
    (estudiantesData || []).forEach((est: any) => {
      estudiantesMap[est.id] = [est.primer_nomb, est.segundo_nomb, est.primer_ape, est.segundo_ape]
        .filter(Boolean)
        .join(' ')
        .trim();
    });
  }

  const gruposPorNombre: Record<
    string,
    {
      compositeKey: string;
      nombre_grupo: string;
      periodo_academico: string;
      cedulas: Set<string>;
      estudiantes: Set<string>;
      id_proyecto: number;
      proyecto: string;
      id_area_investigacion?: number;
      estado: string;
    }
  > = {};

  (gruposData || []).forEach((grupo: any) => {
    const nombre = grupo.nombre_grupo;
    const compositeKey = `${grupo.cedula_estudiante}|${grupo.id_proyecto}|${grupo.periodo_academico}`;
    if (!gruposPorNombre[nombre]) {
      const proyecto = proyectosMap[grupo.id_proyecto];
      gruposPorNombre[nombre] = {
        compositeKey,
        nombre_grupo: nombre || 'Sin nombre',
        periodo_academico: grupo.periodo_academico || '—',
        cedulas: new Set(),
        estudiantes: new Set(),
        id_proyecto: grupo.id_proyecto,
        proyecto: proyecto?.titulo || 'Sin proyecto asignado',
        id_area_investigacion: proyecto?.id_area_investigacion,
        estado: grupo.estado || 'Sin estado',
      };
    }
    if (grupo.cedula_estudiante) {
      gruposPorNombre[nombre].cedulas.add(grupo.cedula_estudiante);
      if (estudiantesMap[grupo.cedula_estudiante]) {
        gruposPorNombre[nombre].estudiantes.add(estudiantesMap[grupo.cedula_estudiante]);
      }
    }
  });

  const mappedGroups = Object.values(gruposPorNombre).map((group) => ({
    compositeKey: group.compositeKey,
    nombre_grupo: group.nombre_grupo,
    periodo_academico: group.periodo_academico,
    cedula_estudiante: Array.from(group.cedulas).join(', '),
    estudiante: Array.from(group.estudiantes).join(', ') || 'Sin estudiantes asignados',
    id_proyecto: group.id_proyecto,
    proyecto: group.proyecto,
    id_area_investigacion: group.id_area_investigacion,
    estado: group.estado,
  }));

  if (userAreaId) {
    return mappedGroups.filter((g) => g.id_area_investigacion === userAreaId);
  }
  return mappedGroups;
}

export async function groupsWizardDataAction(userAreaId: number) {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('tbproyecto')
    .select('id, titulo')
    .eq('id_area_investigacion', userAreaId);

  const { data: students } = await supabase
    .from('tbestudiante')
    .select('id, primer_nomb, segundo_nomb, primer_ape, segundo_ape, tbcarrera (nombre_carrera)')
    .order('primer_ape', { ascending: true });

  const mappedStudents = (students || []).map((s: any) => ({
    id: s.id,
    nombreCompleto: [s.primer_nomb, s.segundo_nomb, s.primer_ape, s.segundo_ape].filter(Boolean).join(' '),
    nombreSimple: `${s.primer_nomb || ''} ${s.primer_ape || ''}`.trim(),
    carrera: s.tbcarrera?.nombre_carrera || '',
  }));

  const { data: areas } = await supabase.from('tbareainvestigacion').select('*');
  return {
    projects: projects || [],
    students: mappedStudents,
    areas: areas || [],
  };
}

export async function saveGroupsAction(wizardData: {
  selectedStudents: Array<{ id: string }>;
  id_proyecto: number;
  periodo: string;
  nombreGrupo: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  const inserts = wizardData.selectedStudents.map((student) => ({
    cedula_estudiante: student.id,
    id_proyecto: wizardData.id_proyecto,
    periodo_academico: wizardData.periodo,
    nombre_grupo: wizardData.nombreGrupo,
    estado: 'En revisión',
    created_by: userId,
  }));
  const { error } = await supabase.from('tbgrupos').insert(inserts);
  if (error) throw error;
  return { ok: true, count: inserts.length };
}

export async function deleteGroupByNameAction(nombre_grupo: string, id_proyecto: number, periodo_academico: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('tbgrupos')
    .delete()
    .eq('nombre_grupo', nombre_grupo)
    .eq('id_proyecto', id_proyecto)
    .eq('periodo_academico', periodo_academico);
  if (error) throw error;
  return { ok: true };
}


export async function filterProjectsAction(filters, currentSearchTerm = '') {
    const supabase = await createClient();
    
    // Iniciamos la consulta base
    let query = supabase
        .from('tbproyecto')
        .select(`
            *,
            tbestudiante!inner (id, primer_nomb, primer_ape, id_carrera),
            tbtutor!inner (cedula_tutor, primer_nomb, primer_ape)
        `);

    // 1. Aplicar búsqueda por texto si existe (Búsqueda en proceso)
    if (currentSearchTerm.trim()) {
        query = query.or(`titulo.ilike.%${currentSearchTerm}%,resumen.ilike.%${currentSearchTerm}%`);
    }

    // 2. Filtros Dinámicos (Solo se aplican si el campo tiene valor)
    if (filters.periodo) {
        query = query.eq('periodo_academico', filters.periodo);
    }
    if (filters.id_area) {
        query = query.eq('id_area_investigacion', filters.id_area);
    }
    if (filters.id_carrera) {
        query = query.eq('tbestudiante.id_carrera', filters.id_carrera);
    }
    
    // Filtros de Tutor (Nombre o Cédula)
    if (filters.cedula_tutor) {
        query = query.eq('tbtutor.cedula_tutor', filters.cedula_tutor);
    }
    if (filters.nombre_tutor) {
        query = query.ilike('tbtutor.primer_nomb', `%${filters.nombre_tutor}%`);
    }

    // Filtros de Estudiante (Nombre o Cédula)
    if (filters.cedula_estudiante) {
        query = query.eq('tbestudiante.id', filters.cedula_estudiante);
    }
    if (filters.nombre_estudiante) {
        query = query.ilike('tbestudiante.primer_nomb', `%${filters.nombre_estudiante}%`);
    }

    const { data, error } = await query.limit(50);

    if (error) {
        console.error("Error en filtrado:", error);
        throw error;
    }
    return data || [];
}

export async function checkStudentExistsAction(cedula: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('tbestudiante').select('id').eq('id', cedula).single();
    return !!data;
}

// assignStudentToAreaAction (actualizado)
export async function assignStudentToAreaAction(cedula: string) {
  const supabase = await createClient();
  const area = await getUserAreaAction();  // Ya devuelve {id, name}

  if (!area.id) {
    throw new Error('No tienes área asignada. Contacta al administrador.');
  }

  const { error } = await supabase
    .from('entity_visibility')
    .upsert({  // upsert evita duplicados si ya existe
      entity_type: 'estudiante',
      entity_id: cedula,
      area_id: area.id,
      visible: true,
      created_by: (await supabase.auth.getUser()).data.user?.id
    }, {
      onConflict: 'entity_type, entity_id, area_id'
    });

  if (error) throw error;
  return { ok: true };
}

export async function deslistStudentAction(cedula: string) {
    const supabase = await createClient();
    const area = await getUserAreaAction();
    if (!area.id) throw new Error('No tienes área asignada');
    const { error } = await supabase.from('entity_visibility').update({ visible: false }).eq('entity_type', 'estudiante').eq('entity_id', cedula).eq('area_id', area.id);
    if (error) throw error;
    return { ok: true };
}

// Nuevas para tutores
export async function checkTutorExistsAction(cedula: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('tbtutor').select('cedula_tutor').eq('cedula_tutor', cedula).single();
    return !!data;
}

export async function assignTutorToAreaAction(cedula: string) {
    const supabase = await createClient();
    const area = await getUserAreaAction();
    if (!area.id) throw new Error('No tienes área asignada');
    const { error } = await supabase
        .from('entity_visibility')
        .upsert({
            entity_type: 'tutor',
            entity_id: cedula,
            area_id: area.id,
            visible: true,
            created_by: (await supabase.auth.getUser()).data.user?.id
        }, {
            onConflict: 'entity_type, entity_id, area_id'
        });
    if (error) throw error;
    return { ok: true };
}

export async function deslistTutorAction(cedula: string) {
    const supabase = await createClient();
    const area = await getUserAreaAction();
    if (!area.id) throw new Error('No tienes área asignada');
    const { error } = await supabase.from('entity_visibility').update({ visible: false }).eq('entity_type', 'tutor').eq('entity_id', cedula).eq('area_id', area.id);
    if (error) throw error;
    return { ok: true };
}

