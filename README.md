# 📚 BUMI- Buscador de Material de Investigación de la UNEFA Yaracuy

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)


## 🎯 Descripción

**BUMI-UNEFA** (Buscador de Material de Investigación de la UNEFA) es un **repositorio institucional open-source** diseñado para centralizar y optimizar la gestión de materiales e informes de investigación generados en instituciones académicas. Este sistema permite registrar, organizar, consultar y descargar documentos académicos como:

- 📄 **Tesis y proyectos de grado**
- 📰 **Artículos científicos**
- 📑 **Informes técnicos**
- 🎤 **Presentaciones académicas**

BUMI supera las limitaciones de los sistemas de archivo tradicionales ofreciendo una **plataforma colaborativa moderna** con arquitectura serverless, fomentando el descubrimiento de investigaciones, la replicación de estudios y la colaboración académica.

---

## ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| 🗄️ **Centralización** | Almacena y organiza materiales académicos en un solo lugar |
| 🎨 **UI/UX Moderna** | Interfaz intuitiva diseñada para usuarios de todos los niveles |
| 🔍 **Búsqueda avanzada** | Función de búsqueda insensible a acentos (`search_projects_unaccent`) |
| 🔐 **Autenticación** | Gestión de sesiones con Supabase Auth |
| 📊 **RLS Policies** | Control de acceso por roles y áreas de investigación |
| 📁 **PDF Storage** | Almacenamiento en Cloudflare R2 con URLs pre-firmadas |
| 🚀 **Serverless** | Despliegue escalable en Vercel |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    BUMI - Producción                    │
├─────────────────────────────────────────────────────────┤
│  Frontend:  Next.js 14 (App Router)                    │
│  Backend:   Supabase (PostgreSQL + Auth)               │
│  Storage:   Cloudflare R2 (PDFs)                       │
│  Deploy:    Vercel                                     │
│  Auth:      Supabase Authentication                    │
│  DB:        PostgreSQL (via Supabase)                  │
└─────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Tecnología | Propósito |
|------------|-----------|
| **Next.js 14** | Frontend (migrado desde React.js/Create React App) |
| **Supabase** | Backend BaaS (migrado desde Laravel/PHP) |
| **PostgreSQL** | Base de datos |
| **Cloudflare R2** | Almacenamiento de PDFs (S3-compatible) |
| **Vercel** | Plataforma de despliegue |
| **Supabase Auth** | Autenticación de usuarios |

---
### Vista Previa

![pagina principal](https://i.ibb.co/rG5g3T03/vista-previa.webp)

## Cómo comenzar

### Prerrequisitos

- **Node.js** y **npm** instalados (para el frontend en Next.js).
- Una cuenta y proyecto en **Supabase** (Base de datos PostgreSQL + autenticación).
- Una cuenta en **Cloudflare** con un bucket **R2** configurado.
- (Opcional) Cuenta en **Vercel** si deseas replicar el despliegue en producción.

### Instalación

> **Nota importante**:  
> - Este proyecto ha sido migrado de React.js (Create React App) a **Next.js**. El frontend ahora está en la raíz del proyecto, no en la carpeta `client/`.  
> - El backend original en **Laravel/PHP** fue reemplazado por **Supabase** como backend as a service. Ya **no es necesario** levantar un servidor Laravel ni clonar el repositorio antiguo del backend.

1. Clona el repositorio:

   ```bash
   git clone https://github.com/0vethor0/BUMI.git
   ```

2. Navega al directorio del proyecto (raíz del repositorio):

   ```bash
   cd BUMI
   ```

3. Instala las dependencias del frontend (Next.js):

   ```bash
   npm install
   ```

4. Configura las variables de entorno para Supabase y Cloudflare R2:

   Crea un archivo `.env.local` en la raíz del proyecto con la siguiente configuración mínima:

   ```env
   # Supabase (backend BaaS)
   NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=TU_SUPABASE_ANON_KEY

   # Cloudflare R2 (almacenamiento de PDFs)
   CLOUDFLARE_R2_ACCOUNT_ID=TU_ACCOUNT_ID
   CLOUDFLARE_R2_ACCESS_KEY_ID=TU_ACCESS_KEY_ID
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=TU_SECRET_ACCESS_KEY
   CLOUDFLARE_R2_BUCKET=nombre-de-tu-bucket
   CLOUDFLARE_R2_PUBLIC_URL=https://tu-subdominio.r2.dev
   ```

   - Las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` son utilizadas por el SDK de Supabase tanto en el navegador como en el servidor (ver `lib/supabase/client.js` y `lib/supabase/server.js`).
   - Las variables que comienzan con `CLOUDFLARE_R2_` son usadas en la ruta de API `app/api/r2-presign/route.jsx` para generar URLs pre-firmadas de subida y construir los enlaces públicos de los PDFs.
   - En producción (Vercel), estas mismas variables deben configurarse en el panel de **Environment Variables** del proyecto para que el frontend y las API routes funcionen correctamente.

5. Configura tu proyecto en Supabase:

   - Crea las tablas y relaciones necesarias siguiendo el **diagrama de base de datos** incluido en los anexos de este README.
   - Habilita la autenticación de usuarios (correo/contraseña u otros proveedores según tus necesidades).
   - Opcionalmente ajusta las **RLS policies** para controlar qué usuarios pueden leer/escribir los registros asociados a los proyectos y documentos.

6. Asegúrate de tener creado y configurado tu bucket en Cloudflare R2:

   - Crea un bucket (por ejemplo, `bumi-pdfs`) y obtén las credenciales de acceso (Access Key / Secret Key).
   - Configura un dominio público o endpoint (`.r2.dev` u otro) que se usará en `CLOUDFLARE_R2_PUBLIC_URL` para servir los PDFs.
   - Verifica que las credenciales configuradas en `.env.local` tengan permisos de escritura en el bucket.

7. Inicia el servidor frontend Next.js (asegúrate de estar en la raíz del proyecto BUMI):

   ```bash
   npm run dev
   ```

   > **Nota sobre comandos**: 
   > - `npm run dev` - Inicia el servidor de desarrollo (con hot-reload).
   > - `npm start` - Inicia el servidor de producción (requiere `npm run build` primero).
   > 
   > Si vienes de React.js, el equivalente a `npm start` de Create React App ahora es `npm run dev` en Next.js.

   El frontend estará disponible en `http://localhost:3000` y se comunicará con:

   - Tu proyecto de **Supabase** (autenticación y base de datos).
   - Tu bucket de **Cloudflare R2** a través del endpoint `/api/r2-presign` para la subida y gestión de archivos PDF.

---

## 📖 Funcionalidades

### Gestión de Proyectos
- ✅ CRUD completo de proyectos de investigación
- ✅ Búsqueda con función `search_projects_unaccent`
- ✅ Filtrado por área, periodo, carrera, tutor y estudiante
- ✅ Control de visibilidad por área de investigación

### Gestión de Usuarios
- ✅ Autenticación con Supabase Auth
- ✅ Roles: administrador, tutor, estudiante
- ✅ Asignación de áreas de investigación
- ✅ Entity visibility policies

### Gestión de Documentos
- ✅ Subida de PDFs a Cloudflare R2
- ✅ URLs pre-firmadas para seguridad
- ✅ Enlaces públicos de descarga
- ✅ Metadatos asociados a cada documento

### Gestión de Entidades Académicas
- ✅ Tutores (crear, editar, eliminar, buscar)
- ✅ Estudiantes (crear, editar, eliminar, buscar)
- ✅ Carreras académicas
- ✅ Áreas de investigación
- ✅ Grupos de trabajo

---

## Contribuir

¡Las contribuciones son bienvenidas! Si deseas contribuir al proyecto, por favor sigue estos pasos:

1. Haz un *fork* del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz *commit* (`git commit -m 'Añade nueva funcionalidad'`).
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`).

Consulta las instrucciones de contribución para más detalles.

## Soporte

Si necesitas ayuda con el proyecto, puedes contactar al mantenedor principal a través de:

- **GitHub**: 0vethor0
- **Redes sociales**: @vincent_fernandez
- **Issues**: Abre un *issue* en el repositorio para reportar errores o sugerir mejoras.

### Anexos

Pagina del Buscador Principal (Diseño en Figma):

![Principal Page](https://i.ibb.co/BKPMzSTC/Pagina-Principal.webp)
Autor: Vincent Fernandez (2025)

---

Diagrama de la base de datos:

![base de datos](https://i.ibb.co/9mcsLh4h/image.png)

----

