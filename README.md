# BUMI-UNEFA

### Descripción

BUMI-UNEFA (Buscador de Material de Investigación de la UNEFA) es una aplicación web diseñada para centralizar y optimizar la gestión de materiales e informes de investigación generados en la Universidad Nacional Experimental Politécnica de la Fuerza Armada Nacional Bolivariana (UNEFA). Este repositorio digital dinámico permite a estudiantes, profesores, investigadores y cualquier persona interesada registrar, organizar, consultar y descargar documentos académicos como proyectos de grado, tesis, artículos científicos, informes técnicos y presentaciones.

BUMI-UNEFA supera las limitaciones de los sistemas de archivo tradicionales al ofrecer una plataforma colaborativa con una interfaz intuitiva, fomentando el descubrimiento de investigaciones, la replicación de estudios y la colaboración académica. Su visión es convertirse en el eje central de la gestión del conocimiento en la UNEFA, democratizando el acceso al conocimiento y elevando la calidad y visibilidad de la producción científica de la institución.

### Características principales

- **Centralización de recursos**: Almacena y organiza materiales académicos en un solo lugar.
- **Interfaz amigable**: Diseñada para usuarios de todos los niveles tecnológicos.
- **Colaboración académica**: Facilita la interacción y el descubrimiento de investigaciones.
- **Escalabilidad**: Construida con tecnologías modernas como Next.js para el frontend y Laravel con PHP para el backend.
- **Accesibilidad**: Permite consultar y descargar documentos de manera eficiente.


### Vista Previa

![pagina principal](https://i.ibb.co/rG5g3T03/vista-previa.webp)

## Cómo comenzar

### Prerrequisitos

- Node.js y npm instalados para el frontend.
- PHP y Composer instalados para el backend.
- MySQL para la base de datos.
- Un entorno de desarrollo como XAMPP o Laravel Sail.

### Instalacion

> **Nota importante**: Este proyecto ha sido migrado de React.js (Create React App) a Next.js. El frontend ahora está en la raíz del proyecto, no en la carpeta `client/`. Si encuentras referencias a `client/` en documentación antigua, ignóralas ya que esa carpeta se mantiene solo como respaldo.

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

4. Configura las variables de entorno:

   Crea un archivo `.env.local` en la raíz del proyecto con la siguiente configuración:

   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   ```

5. Instala las dependencias del backend:

Abre una nueva ventana en tu editor de codigo y clona el repositorio:
   ```bash
  git clone https://github.com/0vethor0/dbServer_BUMI
   ```
Navega al directorio principal:

```bash
  cd ./db_BUMI_ApiRest/
```

Instala las dependencias:
 ```bash
  composer install
 ```

6. Configura el archivo `.env` en el directorio del backend con tus credenciales de base de datos.

7. Ejecuta las migraciones de la base de datos:

   ```bash
   php artisan migrate
   ```

8. Inicia el servidor backend (en el directorio del backend):

   ```bash
   php artisan serve
   ```

9. Inicia el servidor frontend Next.js (asegúrate de estar en la raíz del proyecto BUMI):

   ```bash
   npm run dev
   ```

   > **Nota sobre comandos**: 
   > - `npm run dev` - Inicia el servidor de desarrollo (con hot-reload)
   > - `npm start` - Inicia el servidor de producción (requiere `npm run build` primero)
   > 
   > Si vienes de React.js, el equivalente a `npm start` de Create React App ahora es `npm run dev` en Next.js.

   El frontend estará disponible en `http://localhost:3000`

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
