# BUMI-UNEFA

### Descripción

BUMI-UNEFA (Buscador de Material de Investigación de la UNEFA) es una aplicación web diseñada para centralizar y optimizar la gestión de materiales e informes de investigación generados en la Universidad Nacional Experimental Politécnica de la Fuerza Armada Nacional Bolivariana (UNEFA). Este repositorio digital dinámico permite a estudiantes, profesores, investigadores y cualquier persona interesada registrar, organizar, consultar y descargar documentos académicos como proyectos de grado, tesis, artículos científicos, informes técnicos y presentaciones.

BUMI-UNEFA supera las limitaciones de los sistemas de archivo tradicionales al ofrecer una plataforma colaborativa con una interfaz intuitiva, fomentando el descubrimiento de investigaciones, la replicación de estudios y la colaboración académica. Su visión es convertirse en el eje central de la gestión del conocimiento en la UNEFA, democratizando el acceso al conocimiento y elevando la calidad y visibilidad de la producción científica de la institución.

### Características principales

- **Centralización de recursos**: Almacena y organiza materiales académicos en un solo lugar.
- **Interfaz amigable**: Diseñada para usuarios de todos los niveles tecnológicos.
- **Colaboración académica**: Facilita la interacción y el descubrimiento de investigaciones.
- **Arquitectura moderna**: Frontend en **Next.js** y backend migrado a **Supabase** (PostgreSQL + autenticación gestionada).
- **Almacenamiento de documentos PDF**: Uso de **Cloudflare R2** como almacenamiento S3-compatible para los archivos cargados.
- **Despliegue en la nube**: Aplicación alojada en **Vercel**, integrada con Supabase y Cloudflare R2 mediante variables de entorno.
- **Accesibilidad**: Permite consultar y descargar documentos de manera eficiente.

### Arquitectura actual (Supabase + Vercel + Cloudflare R2)

- **Backend**: El backend original en Laravel/PHP fue **migrado a Supabase**, que ahora gestiona:
  - Base de datos PostgreSQL.
  - Autenticación y manejo de sesiones a través del SDK de Supabase (`@supabase/ssr`).
- **Frontend**: Aplicación Next.js que se comunica con Supabase tanto desde el navegador como desde el servidor (RSC/API routes).
- **Almacenamiento de PDFs**:
  - La subida de archivos PDF se realiza contra **Cloudflare R2** mediante un endpoint interno de Next.js (`/api/r2-presign`) que genera URLs pre-firmadas.
  - Los enlaces públicos de descarga se construyen a partir de la URL pública configurada en R2.
- **Despliegue**:
  - En producción, el proyecto está desplegado en **Vercel**, utilizando variables de entorno para conectarse a Supabase y a Cloudflare R2.

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

Pagina del Buscador Principal:

![Principal Page](https://i.ibb.co/BKPMzSTC/Pagina-Principal.webp)

---

Diagrama de la base de datos:

![base de datos](https://i.ibb.co/1tWFvQDx/diagrama-db.png)

----


Diagrama de la base de datos:

![base de datos](https://i.ibb.co/1tWFvQDx/diagrama-db.png)

----
