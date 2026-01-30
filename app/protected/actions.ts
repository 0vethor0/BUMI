    'use server';
    
    import { createClient } from '@/lib/supabase/server';
    
    export async function getUserAreaAction() {
    const supabase = await createClient();
    const { data: areaId, error: rpcError } = await supabase.rpc('get_user_area');
    if (rpcError) throw rpcError;
    if (areaId === null) {
        return { id: null, name: 'Sin área asignada' };
    }
    const { data: areaData, error: areaError } = await supabase
        .from('tbareainvestigacion')
        .select('nomb_area')
        .eq('id', areaId)
        .single();
    if (areaError) throw areaError;
    return { id: areaId, name: areaData?.nomb_area || 'Área no encontrada' };
    }
    
    export async function fetchAllAreasAction() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tbareainvestigacion')
        .select('id, nomb_area');
    if (error) throw error;
    return data || [];
    }
    
    export async function listProjectsAction() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('tbproyecto').select('*');
    if (error) throw error;
    const mapped = (data || []).map((project: any) => ({
        ...project,
        titulo: project.titulo || '',
        resumen: project.resumen || '',
        pdf_url: project.pdf_url || '',
    }));
    return mapped;
    }
    
    export async function searchProjectsAction(searchTerm: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tbproyecto')
        .select('*')
        .or(
        `titulo.ilike.%${searchTerm}%,resumen.ilike.%${searchTerm}%,tipo_investigacion.ilike.%${searchTerm}%`
        );
    if (error) throw error;
    return data || [];
    }
    
    export async function saveProjectAction(selectedRowId: string | number, payload: any) {
    const supabase = await createClient();
    let error;
    if (selectedRowId === 'new-row') {
        ({ error } = await supabase.from('tbproyecto').insert([payload]));
    } else {
        ({ error } = await supabase
        .from('tbproyecto')
        .update(payload)
        .eq('id', selectedRowId));
    }
    if (error) throw error;
    return { ok: true };
    }
    
    export async function deleteProjectAction(id: number) {
    const supabase = await createClient();
    const { error } = await supabase.from('tbproyecto').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
    }

export async function listTutorsAction() {
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
    `);
  if (error) throw error;
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

export async function saveTutorAction(selectedRowId: string | number, payload: any) {
  const supabase = await createClient();
  let error;
  if (selectedRowId === 'new-row') {
    ({ error } = await supabase
      .from('tbtutor')
      .insert([{ ...payload, cedula_tutor: payload.cedula_tutor }]));
  } else {
    ({ error } = await supabase
      .from('tbtutor')
      .update(payload)
      .eq('cedula_tutor', selectedRowId));
  }
  if (error) throw error;
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
  const payload = {
    primer_nomb: newRowData.primer_nomb,
    segundo_nomb: newRowData.segundo_nomb,
    primer_ape: newRowData.primer_ape,
    segundo_ape: newRowData.segundo_ape,
    id_carrera: newRowData.id_carrera ? parseInt(newRowData.id_carrera) : null,
  };
  let error;
  if (selectedRowId === 'new-row') {
    ({ error } = await supabase.from('tbestudiante').insert([{ ...payload, id: newRowData.id }]));
  } else {
    ({ error } = await supabase.from('tbestudiante').update(payload).eq('id', selectedRowId));
  }
  if (error) throw error;
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
