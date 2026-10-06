# Mesa de gestión · Nuxt + Prisma + MySQL (XAMPP)

Backend integrado con la interfaz existente. Requiere Node.js 22.12+ (o 24), npm y MySQL/MariaDB de XAMPP.

## Instalación local

1. Inicia **MySQL** desde el panel de XAMPP. Apache no es necesario para Nuxt. Crea una base vacía llamada `mesa_gestion` con cotejamiento `utf8mb4_unicode_ci` desde phpMyAdmin o el cliente MySQL.
2. Copia `.env.example` a `.env`. Configura `DATABASE_URL`, `ADMIN_EMAIL` y una `ADMIN_PASSWORD` de al menos 12 caracteres. La URL de ejemplo corresponde a XAMPP local, puerto 3306, usuario root sin contraseña. Ajusta esos valores a tu instalación.
3. Ejecuta:

```text
npm install
npm run db:generate
npm run db:setup
npm run dev
```

Abre la dirección que indique Nuxt e ingresa con los datos del administrador definidos en `.env`. El perfil se obtiene del servidor. Crea las cuentas de trabajadores desde Equipo y guarda sus contraseñas iniciales. `.env` no se versiona.

`db:setup` aplica las migraciones y crea el administrador si aún no existe; no cambia contraseñas existentes ni elimina datos. Para producción local: `npm run build` y `npm start`. No publiques XAMPP/root en Internet.

## Modelo de datos

La fuente de verdad es **prisma/schema.prisma**; la migración inicial está en **prisma/migrations**. Las consultas y escrituras usan Prisma Client con el adaptador MariaDB, compatible con MySQL/XAMPP.

| Modelo | Propósito y relaciones |
| --- | --- |
| Usuario | Administrador o trabajador; correo único, hash de contraseña, estado activo; responsable de trabajos y asignado a tareas. |
| Sesion | Token opaco almacenado como hash, asociado a usuario, con vencimiento de ocho horas. |
| Trabajo | Cliente, tipo, prioridad, estado, vencimiento, responsable opcional y versión para detectar ediciones concurrentes. El código TR se deriva del ID. |
| Tarea | Pertenece a un trabajo y a un trabajador; fechas, estado y momento real de finalización. |
| Comentario | Autor y trabajo obligatorios; tarea opcional para avances/observaciones. |
| Documento | Archivo binario, autor, tamaño y fecha; vinculado a trabajo y opcionalmente tarea. Las cargas pendientes pueden estar sin vincular. |
| Historial | Registro generado por el servidor con actor, fecha, trabajo y tarea opcional. |
| Mensaje | Emisor, receptor y texto. Receptor nulo representa un anuncio general; solo administradores pueden publicarlo. |
| Lectura | Último mensaje visto por usuario y conversación, con clave compuesta. |
| Notificacion | Aviso por usuario con enlace y marca de lectura. |
| Correo | Correo importado desde Gmail, identificación externa única, lectura/descarte y asociación opcional a trabajo. |
| CorreoAdjunto | Metadatos y contenido opcional del adjunto; pertenece a un correo. |
| GmailCuenta | Buzón conectado, tokens cifrados, cursor de sincronización y bloqueo de operaciones concurrentes. |
| GmailOAuthEstado | Autorización temporal de un solo uso, vinculada a sesión y navegador, con PKCE. |
| IntentoLogin | Control persistente de intentos de inicio de sesión. |

Se usan claves foráneas, índices en asignaciones/estados/fechas, fechas reales y enumeraciones para perfiles, estados, tipos y prioridades. Las relaciones guardan IDs, no nombres. El nombre es único por compatibilidad con los selectores de la interfaz actual. Los usuarios se desactivan en lugar de borrarse. El servidor verifica que una tarea, comentario o documento corresponda al trabajo de la operación.

## Operaciones disponibles

- Autenticación y cierre de sesión, cookies HTTP-only, comprobación de origen y limitación de intentos.
- Alta y edición de personas, desactivación y revocación de sesiones.
- Creación de trabajos, creación/asignación de tareas, cambios de estado y comentarios/avances.
- Archivos reales de hasta 5 MB: PDF, Word, Excel, PNG y JPEG; descarga con permisos.
- Mensajes privados, anuncios generales, notificaciones y actualización periódica cada 15 segundos.
- Reportes calculados desde datos persistidos; filtros por fecha límite del trabajo, tipo, estado y responsable.
- Conexión de Gmail mediante OAuth, importación incremental de correos y creación de trabajos con sus adjuntos. Consulta **GMAIL.md** para configurarla.

Los trabajadores solo consultan trabajos donde son responsables o tienen tareas, y solo cambian el estado de sus propias tareas. El servidor genera el historial y las notificaciones. Los cambios sobre un trabajo se ejecutan en transacciones y verifican su versión.

## API

`POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/datos`, `POST /api/acciones`, `POST /api/documentos`, `GET /api/documentos/:id`.

Las acciones aceptan `{ accion, datos, codigo?, tareaId?, version? }`. La versión se obtiene de `/api/datos`; los conflictos devuelven 409. La validación incorrecta devuelve 400; falta de sesión 401; permisos insuficientes 403/404.

## Desarrollo y pruebas

```text
npm run db:generate
npm run db:migrate -- --name descripcion_del_cambio
npm run db:studio
npm run build
npm run test:integration
```

Las pruebas requieren una aplicación iniciada en `http://127.0.0.1:3100` (o `TEST_URL`) y una **base exclusiva de pruebas** con el administrador de `.env`. Crean registros de prueba y los conservan para inspección. Comprueban autenticación, permisos, persistencia, conflictos, tareas, archivos, mensajes, renombrado y desactivación.

## Integración con Gmail

La integración está implementada y requiere credenciales OAuth de Google y la autorización del buzón. Ejecuta `npm run gmail:prepare` y sigue **GMAIL.md**. Solo solicita lectura: crear un trabajo o descartar un correo en la aplicación no modifica Gmail. La primera sincronización importa la bandeja de entrada de los últimos 30 días; continúa mientras la página de correos permanece abierta.

Las rutas de Gmail están bajo `/api/gmail` y exigen administrador. `npm run test:gmail` verifica sincronización, cifrado y errores con un proveedor simulado y una base MySQL exclusiva de pruebas. `npm run test:gmail:http` comprueba permisos, OAuth y creación de trabajos en el servidor local de prueba. Estas pruebas no autorizan ni leen un buzón real. No se importan datos de demostración como información real.

Documentación de referencia: [servidor Nuxt](https://nuxt.com/docs/4.x/directory-structure/server) y [Prisma con MySQL](https://docs.prisma.io/docs/prisma-orm/quickstart/mysql).
