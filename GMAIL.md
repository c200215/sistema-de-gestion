# Conectar el Gmail de prueba

Cuenta prevista: **test.trabajo.integracion@gmail.com**. El código está preparado; la conexión real requiere las credenciales de un proyecto de Google Cloud y el consentimiento de esa cuenta.

## Preparar Google Cloud

1. Crea o selecciona un proyecto en [Google Cloud Console](https://console.cloud.google.com/).
2. Habilita **Gmail API** en la biblioteca de APIs.
3. Configura la aplicación en Google Auth Platform. Para este Gmail personal usa audiencia externa en modo de prueba y añade `test.trabajo.integracion@gmail.com` como usuario de prueba.
4. Añade el permiso `https://www.googleapis.com/auth/gmail.readonly`.
5. Crea un cliente OAuth de tipo **Aplicación web**. Registra exactamente esta URI de redirección:

```text
http://localhost:3000/api/gmail/callback
```

Si ejecutas Nuxt en otro puerto, actualiza tanto Google Cloud como `.env`. `localhost` y `127.0.0.1` son orígenes distintos: abre la aplicación usando el mismo host registrado.

## Configurar el proyecto

Desde la carpeta del proyecto:

```text
npm install
npm run gmail:prepare
npm run db:generate
npm run db:setup
npm run dev
```

MySQL debe estar iniciado y `DATABASE_URL` debe apuntar a una base creada. La migración agrega las tablas de Gmail y amplía el campo de texto del correo; conserva los trabajos existentes. La instalación principal de XAMPP presentó un fallo de arranque durante las pruebas anteriores; la validación del código se realizó en una instancia aislada.

Completa **solo en `.env`**, sin publicar ni compartir el archivo:

```dotenv
GOOGLE_CLIENT_ID=el_identificador_del_cliente_web
GOOGLE_CLIENT_SECRET=el_secreto_del_cliente_web
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback
GOOGLE_GMAIL_ADDRESS=test.trabajo.integracion@gmail.com
GMAIL_TOKEN_KEY=clave_generada_por_gmail_prepare
```

`gmail:prepare` genera la clave de cifrado y conserva valores existentes. No reemplaces la clave mientras existan credenciales cifradas; guarda una copia segura junto con la configuración. Los secretos permanecen en el servidor y no se incluyen en las respuestas al navegador ni en el ZIP.

## Autorizar y probar

1. Entra como administrador en `http://localhost:3000`.
2. Abre **Correos → Conectar Gmail**.
3. Inicia sesión como `test.trabajo.integracion@gmail.com` y autoriza la lectura.
4. Al volver, se importan los correos de la bandeja de entrada de los últimos 30 días. Las siguientes sincronizaciones toman los cambios nuevos de Gmail.
5. Envía un mensaje de prueba a esa cuenta desde otra cuenta. Pulsa **Actualizar** o deja abierta la página Correos, que consulta cada minuto mientras está visible.
6. Abre el correo, descarga un adjunto o crea un trabajo seleccionando los adjuntos que quieras incluir. También puedes vincularlo a un trabajo existente.

La aplicación verifica que Google autorice el buzón configurado. Los archivos admitidos son PDF, Word, Excel, PNG y JPEG, de hasta 5 MB. En MySQL configura `max_allowed_packet` al menos en 8 MB para archivos próximos a ese límite. El cuerpo se muestra como texto; no ejecuta HTML del correo ni carga imágenes remotas. La descripción inicial del trabajo usa los primeros 5.000 caracteres del correo y puede editarse antes de guardar.

## Comportamiento y límites

- Un buzón compartido por instalación; solo los administradores pueden conectarlo, consultarlo, sincronizarlo o desconectarlo.
- Permiso de **lectura**. La aplicación no envía mensajes, elimina correos ni cambia las etiquetas o el estado leído de Gmail. Las marcas leído/descartado de la mesa son locales.
- Sincronización por páginas con cursor persistente, detección de duplicados e historial incremental. Los fallos no avanzan el cursor. Si el historial de Google vence, se repite la carga inicial de los últimos 30 días conservando lo ya importado.
- El botón Actualizar sincroniza manualmente. La consulta automática ocurre mientras la página Correos está abierta y visible; no se ha instalado un servicio programado, webhook ni Google Pub/Sub.
- Desconectar elimina las credenciales locales e intenta revocar el acceso en Google. Los correos y documentos ya guardados se conservan. Si la revocación remota falla, la interfaz avisa para revisar el permiso en la cuenta Google.
- Los tokens se cifran con AES-256-GCM. OAuth usa estado de un solo uso, vínculo con el navegador y la sesión, vencimiento y PKCE.
- Los adjuntos remotos se descargan al solicitarlos. Los adjuntos elegidos al crear un trabajo se guardan con ese trabajo en una transacción. Si falla la descarga, no se crea un trabajo incompleto.
- En aplicaciones externas de Google en modo de prueba, el refresh token puede vencer a los siete días para estos permisos. Reconectar resuelve ese caso; no es necesario renovar semanalmente todas las aplicaciones en producción. Ver [caducidad de tokens](https://developers.google.com/identity/protocols/oauth2#expiration).

## Verificación del código

Se usan MySQL real y respuestas simuladas de Google para probar autorización, cifrado, permisos, MIME, páginas, deduplicación, renovación, revocación, descarga, recuperación y transacciones. Esto **no sustituye** la primera prueba con la cuenta real autorizada.

```text
npm run test:gmail
npm run test:integration
```

Las pruebas requieren una base cuyo nombre termine en `_test`. `test:gmail:http` requiere además el servidor local de pruebas en el puerto 3100, configuración OAuth ficticia y ejecutar primero `test:gmail`; no hace llamadas a Google. No copies credenciales reales a las pruebas.

Referencias: [OAuth para servidores web](https://developers.google.com/identity/protocols/oauth2/web-server), [sincronización de Gmail](https://developers.google.com/workspace/gmail/api/guides/sync), [lectura de adjuntos](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages.attachments/get).
