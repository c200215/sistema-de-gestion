import assert from 'node:assert/strict'
if(!new URL(process.env.DATABASE_URL).pathname.endsWith('_test'))throw Error('Base de prueba requerida')
const base=process.env.TEST_URL||'http://127.0.0.1:3100'
const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD})})
assert.equal(login.status,200)
const cookie=login.headers.get('set-cookie').split(';')[0]
async function post(path,body,session=cookie){return fetch(base+path,{method:'POST',headers:{cookie:session,'content-type':'application/json'},body:JSON.stringify(body)})}
const workerMail='gmail-worker-'+Date.now()+'@example.test'
assert.equal((await post('/api/acciones',{accion:'persona',datos:{nombre:workerMail,correo:workerMail,perfil:'Trabajador',especialidad:'Soporte',clave:'Clave-test-12345'}})).status,200)
const workerLogin=await post('/api/auth/login',{email:workerMail,password:'Clave-test-12345'})
const workerCookie=workerLogin.headers.get('set-cookie').split(';')[0]
assert.equal((await fetch(base+'/api/gmail/estado',{headers:{cookie:workerCookie}})).status,403)
for(const path of ['/api/gmail/conectar','/api/gmail/sincronizar','/api/gmail/desconectar'])assert.equal((await post(path,{},workerCookie)).status,403)
for(const path of ['/api/gmail/estado','/api/gmail/adjuntos/11111111-1111-4111-8111-111111111111'])assert.equal((await fetch(base+path)).status,401)
const denied=await fetch(base+'/api/gmail/conectar',{method:'POST',headers:{cookie,origin:'https://evil.example'}})
assert.equal(denied.status,403)
const state=await (await fetch(base+'/api/gmail/estado',{headers:{cookie}})).json()
assert.ok(!JSON.stringify(state).includes('tokensCifrados'))
const connect=await fetch(base+'/api/gmail/conectar',{method:'POST',headers:{cookie}})
assert.equal(connect.status,200)
const url=new URL((await connect.json()).url)
assert.equal(url.hostname,'accounts.google.com')
assert.equal(url.searchParams.get('login_hint'),'test.trabajo.integracion@gmail.com')
assert.equal(url.searchParams.get('scope'),'https://www.googleapis.com/auth/gmail.readonly')
assert.equal(url.searchParams.get('code_challenge_method'),'S256')
const oauthCookie=connect.headers.get('set-cookie').split(';')[0]
const callback=base+'/api/gmail/callback?error=access_denied&state='+encodeURIComponent(url.searchParams.get('state'))
// Wrong browser cannot consume a state. The original browser can still deny it once.
assert.match(await (await fetch(callback)).text(),/gmail=error/)
assert.match(await (await fetch(callback,{headers:{cookie:oauthCookie}})).text(),/gmail=denegado/)
assert.match(await (await fetch(callback,{headers:{cookie:oauthCookie}})).text(),/gmail=error/)
const page=await fetch(base+'/admin/correos',{headers:{cookie}})
assert.equal(page.status,200);assert.match(await page.text(),/Conectar Gmail/)
let data=await (await fetch(base+'/api/datos',{headers:{cookie}})).json()
const mail=data.correos.find(c=>c.asunto.startsWith('Solicitud m1')&&!c.trabajo)
assert.ok(mail,'Ejecuta primero test:gmail para crear el correo de prueba')
const pdf=mail.adjuntos.find(a=>a.nombre==='informe.pdf'),exe=mail.adjuntos.find(a=>a.nombre==='programa.exe')
const work={titulo:'Trabajo desde Gmail',descripcion:'Conversión con adjuntos',tipo:'Consulta',cliente:'Prueba',contacto:'test@example.test',canal:'Correo',responsable:'Sin asignar',prioridad:'Media',fecha:'Sin fecha',correoId:mail.id}
const before=Object.keys(data.trabajos).length
assert.equal((await post('/api/acciones',{accion:'crear-trabajo',datos:{...work,adjuntosCorreoIds:[exe.id]}})).status,400)
data=await (await fetch(base+'/api/datos',{headers:{cookie}})).json();assert.equal(Object.keys(data.trabajos).length,before)
const created=await post('/api/acciones',{accion:'crear-trabajo',datos:{...work,adjuntosCorreoIds:[pdf.id]}})
assert.equal(created.status,200,await created.clone().text())
const job=await created.json()
data=await (await fetch(base+'/api/datos',{headers:{cookie}})).json()
assert.equal(data.correos.find(c=>c.id===mail.id).trabajo,job.codigo)
assert.equal(data.trabajos[job.codigo].documentos.length,1)
const fileId=data.trabajos[job.codigo].documentos[0].id
assert.match(await (await fetch(base+'/api/documentos/'+fileId,{headers:{cookie}})).text(),/Archivo Gmail de prueba/)
assert.equal((await post('/api/acciones',{accion:'crear-trabajo',datos:{...work,adjuntosCorreoIds:[pdf.id]}})).status,409)
console.log('Gmail HTTP: permisos, origen, OAuth/PKCE, cuenta, estado de un uso y pantalla correctos; sin llamadas a Google.')
console.log('Conversión de correo a trabajo y adjuntos: transacción, descarga, rechazo y prevención de duplicados correctos.')
