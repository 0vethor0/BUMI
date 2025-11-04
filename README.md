# BUMI-UNEFA

### Descripción

BUMI-UNEFA (Buscador de Material de Investigación de la UNEFA) es una aplicación web diseñada para centralizar y optimizar la gestión de materiales e informes de investigación generados en la Universidad Nacional Experimental Politécnica de la Fuerza Armada Nacional Bolivariana (UNEFA). Este repositorio digital dinámico permite a estudiantes, profesores, investigadores y cualquier persona interesada registrar, organizar, consultar y descargar documentos académicos como proyectos de grado, tesis, artículos científicos, informes técnicos y presentaciones.

BUMI-UNEFA supera las limitaciones de los sistemas de archivo tradicionales al ofrecer una plataforma colaborativa con una interfaz intuitiva, fomentando el descubrimiento de investigaciones, la replicación de estudios y la colaboración académica. Su visión es convertirse en el eje central de la gestión del conocimiento en la UNEFA, democratizando el acceso al conocimiento y elevando la calidad y visibilidad de la producción científica de la institución.

### Características principales

- **Centralización de recursos**: Almacena y organiza materiales académicos en un solo lugar.
- **Interfaz amigable**: Diseñada para usuarios de todos los niveles tecnológicos.
- **Colaboración académica**: Facilita la interacción y el descubrimiento de investigaciones.
- **Escalabilidad**: Construida con tecnologías modernas como React.js para el frontend y Laravel con PHP para el backend.
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

1. Clona el repositorio:

   ```bash
   git clone https://github.com/0vethor0/BUMI.git
   ```

2. Navega al directorio del proyecto:

   ```bash
   cd ./client/
   ```
3. Ejecuta npm para instalar las dependencias:

 ```bash
 npm install
 ```
3. Instala las dependencias del backend:

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
 ```bash
  npm install
 ```

4. Configura el archivo `.env` en el directorio `backend` con tus credenciales de base de datos.

5. Ejecuta las migraciones de la base de datos:

   ```bash
   php artisan migrate
   ```

6. Inicia el servidor backend:

   ```bash
   php artisan serve
   ```

7. Inicia el servidor frontend:

   ```bash
   npm start
   ```

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
