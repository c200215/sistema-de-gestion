import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import 'dotenv/config'
import { db } from '../server/lib/database'
import { createGmailService } from '../server/lib/gmail/service'
import { GmailError, type GmailProvider } from '../server/lib/gmail/provider'
import { seal, unseal } from '../server/lib/gmail/crypto'
import { parseGmailMessage } from '../server/lib/gmail/mime'

if(!new URL(process.env.DATABASE_URL!).pathname.endsWith('_test'))throw Error('Se requiere una base exclusiva _test')
const key=randomBytes(32).toString('hex'),email='test.trabajo.integracion@gmail.com',run=Date.now().toString()
const m1='m1'+run,m2='m2'+run,m3='m3'+run
process.env.GOOGLE_GMAIL_ADDRESS=email
let mode='normal',refreshes=0,attachmentsFetched=0,revoked=0,calls:string[]=[]
const binary=Buffer.from('%PDF-1.4\nArchivo Gmail de prueba')
const encoded=(s:string)=>Buffer.from(s).toString('base64url')
const msg=(id:string)=>({id,internalDate:Date.now().toString(),labelIds:id==='sent'?['SENT']:['INBOX'],payload:{mimeType:'multipart/mixed',headers:[{name:'From',value:'Ana <ana@example.test>'},{name:'Subject',value:'Solicitud '+id}],parts:[{mimeType:'multipart/alternative',parts:[{mimeType:'text/html',body:{data:encoded('<p>Hola <b>equipo</b></p>')}},{mimeType:'text/plain',body:{data:encoded('Hola equipo en texto')}}]},{partId:'1',mimeType:'application/pdf',filename:'informe.pdf',body:{size:binary.length,attachmentId:'file1'}},{partId:'2',mimeType:'application/octet-stream',filename:'programa.exe',body:{size:5,attachmentId:'bad'}}]}})
const provider:GmailProvider={
  authUrl:()=>'',exchange:async()=>({}),
  refresh:async(tokens)=>{refreshes++;if(mode==='revoked')throw new GmailError('reauthorize',401);return {...tokens,access_token:'renovado',expiry_date:Date.now()+3600000}},
  revoke:async()=>{revoked++},
  get:async(tokens,path,params={})=>{
    calls.push(path)
    if(mode==='quota')throw new GmailError('quota',429)
    if(mode==='stale'&&tokens.access_token!=='renovado')throw new GmailError('reauthorize',401)
    if(path==='/profile')return {emailAddress:mode==='wrong-email'?'otra@example.test':email,historyId:'100'} as any
    if(path==='/messages')return (params.pageToken?{messages:[{id:m1},{id:m2},{id:'deleted'}]}:{messages:[{id:m1},{id:'sent'}],nextPageToken:'pagina2'}) as any
    if(path==='/history'){
      if(mode==='expired-history')throw new GmailError('missing',404)
      return {historyId:'200',history:[{messagesAdded:[{message:{id:m3}}],labelsAdded:[{labelIds:['INBOX'],message:{id:m3}}]}]} as any
    }
    if(path.includes('/attachments/')){attachmentsFetched++;return {data:binary.toString('base64url')} as any}
    const id=path.split('/').pop()!
    if(id==='deleted')throw new GmailError('missing',404)
    if(mode==='transient'&&id===m2)throw new GmailError('unavailable')
    return msg(id) as any
  },
}
const service=createGmailService(db,provider,()=>key)
const credentials={access_token:'acceso-ficticio',refresh_token:'renovacion-ficticia',expiry_date:Date.now()+3600000}

await test('Integración Gmail con MySQL real y Google simulado',async t=>{
  await db.gmailCuenta.deleteMany({})
  await t.test('Cifrado autenticado y detección de manipulación',()=>{
    const value=seal(credentials,key)
    assert.ok(!value.includes(credentials.refresh_token));assert.deepEqual(unseal(value,key),credentials)
    assert.throws(()=>unseal(value.slice(0,-4)+'AAAA',key))
    assert.throws(()=>unseal(value,randomBytes(32).toString('hex')))
  })
  await t.test('MIME anidado, texto preferido, HTML seguro y encabezados codificados',()=>{
    assert.equal(parseGmailMessage(msg(m1)).cuerpo,'Hola equipo en texto')
    const html=msg(m1);html.payload.parts=[{mimeType:'text/html',body:{data:encoded('<script>alert(1)</script><p>Hola</p><img src="https://tracker.test/a">')}}] as any
    const parsed=parseGmailMessage(html)
    assert.match(parsed.cuerpo,/Hola/);assert.ok(!parsed.cuerpo.includes('<script'));assert.ok(!parsed.cuerpo.includes('tracker.test'))
    html.payload.headers[1]!.value='=?UTF-8?B?'+Buffer.from('Cotización técnica').toString('base64')+'?='
    assert.equal(parseGmailMessage(html).asunto,'Cotización técnica')
  })
  await t.test('Rechaza una cuenta distinta a la configurada',async()=>{
    mode='wrong-email';await assert.rejects(service.connect({...credentials}),/no coincide/);mode='normal'
    assert.equal((await db.gmailCuenta.findUniqueOrThrow({where:{id:1}})).tokensCifrados,null)
  })
  await t.test('Conecta y guarda las credenciales cifradas',async()=>{
    assert.equal(await service.connect({...credentials}),email)
    const account=await db.gmailCuenta.findUniqueOrThrow({where:{id:1}})
    assert.ok(!account.tokensCifrados!.includes('ficticia'))
  })
  await t.test('Importa la primera página y no toma enviados',async()=>{
    const r=await service.sync();assert.equal(r.importados,1);assert.equal(r.pendiente,true)
    assert.equal(await db.correo.count({where:{externoId:email+':sent'}}),0)
    assert.equal((await db.gmailCuenta.findUniqueOrThrow({where:{id:1}})).historyId,null)
  })
  const first=await db.correo.findUniqueOrThrow({where:{externoId:email+':'+m1}})
  await db.correo.update({where:{id:first.id},data:{leido:true,descartado:true}})
  await t.test('Una interrupción conserva el cursor para reintentar',async()=>{
    mode='transient';await assert.rejects(service.sync());mode='normal'
    const account=await db.gmailCuenta.findUniqueOrThrow({where:{id:1}})
    assert.equal(account.syncPagina,'pagina2');assert.equal(account.historyId,null)
  })
  await t.test('Reintenta sin duplicar y tolera un correo eliminado',async()=>{
    const r=await service.sync();assert.equal(r.importados,1);assert.equal(r.pendiente,false)
    const row=await db.correo.findUniqueOrThrow({where:{id:first.id}})
    assert.equal(row.leido,true);assert.equal(row.descartado,true)
    assert.equal(await db.correo.count({where:{externoId:email+':'+m1}}),1)
    assert.equal((await db.gmailCuenta.findUniqueOrThrow({where:{id:1}})).historyId,'100')
  })
  await t.test('Sincronización incremental deduplica eventos de Gmail',async()=>{
    const r=await service.sync();assert.equal(r.importados,1)
    assert.equal((await db.gmailCuenta.findUniqueOrThrow({where:{id:1}})).historyId,'200')
  })
  await t.test('Descarga adjuntos reales y bloquea formatos no admitidos',async()=>{
    const records=await db.correoAdjunto.findMany({where:{correoId:first.id}})
    const pdf=records.find(r=>r.nombre==='informe.pdf')!,exe=records.find(r=>r.nombre==='programa.exe')!
    assert.deepEqual((await service.attachments([pdf.id],first.id))[0]!.contenido,binary)
    assert.equal(attachmentsFetched,1)
    await assert.rejects(service.attachments([exe.id],first.id),/adjunto/)
    await assert.rejects(service.attachments([pdf.id],first.id+9999),/no encontrado/)
  })
  await t.test('Un cursor vencido activa una nueva carga sin borrar correos',async()=>{
    mode='expired-history';assert.equal((await service.sync()).reiniciada,true);mode='normal'
    assert.ok(await db.correo.findUnique({where:{id:first.id}}))
  })
  await t.test('Renueva tokens vencidos y persiste la renovación cifrada',async()=>{
    await db.gmailCuenta.update({where:{id:1},data:{tokensCifrados:seal({...credentials,expiry_date:1},key)}})
    await service.sync();assert.ok(refreshes>0)
    const account=await db.gmailCuenta.findUniqueOrThrow({where:{id:1}})
    assert.equal(unseal(account.tokensCifrados!,key).access_token,'renovado')
  })
  await t.test('401 de acceso renueva y reintenta sin pedir autorización',async()=>{
    await db.gmailCuenta.update({where:{id:1},data:{tokensCifrados:seal(credentials,key)}})
    const before=refreshes;mode='stale';await service.sync();mode='normal';assert.equal(refreshes,before+1)
  })
  await t.test('Los errores de cuota no exponen tokens y liberan el bloqueo',async()=>{
    mode='quota';await assert.rejects(service.sync(),/límite/);mode='normal'
    assert.equal((await db.gmailCuenta.findUniqueOrThrow({where:{id:1}})).operacionId,null)
  })
  await t.test('Acceso revocado solicita reconexión y conserva importaciones',async()=>{
    await db.gmailCuenta.update({where:{id:1},data:{tokensCifrados:seal({...credentials,expiry_date:1},key)}})
    mode='revoked';await assert.rejects(service.sync(),/conectar/);mode='normal'
    assert.equal((await db.gmailCuenta.findUniqueOrThrow({where:{id:1}})).requiereConexion,true)
    assert.ok(await db.correo.findUnique({where:{id:first.id}}))
  })
  await t.test('Bloquea operaciones simultáneas',async()=>{
    await db.gmailCuenta.update({where:{id:1},data:{operacionId:'11111111-1111-4111-8111-111111111111',operacionHasta:new Date(Date.now()+60000)}})
    await assert.rejects(service.sync(),/otra operación/)
    await db.gmailCuenta.update({where:{id:1},data:{operacionId:null,operacionHasta:null}})
  })
  await t.test('Reconexión y desconexión revocan acceso, preservando correos',async()=>{
    await service.connect({...credentials});assert.equal((await service.disconnect()).revocado,true);assert.equal(revoked,1)
    assert.equal((await db.gmailCuenta.findUniqueOrThrow({where:{id:1}})).tokensCifrados,null)
    assert.ok(await db.correo.findUnique({where:{id:first.id}}))
  })
  // Cached test attachment lets the HTTP suite verify atomic email-to-job conversion without Google.
  await db.correoAdjunto.updateMany({where:{correoId:first.id,nombre:'informe.pdf'},data:{contenido:binary}})
})
await db.$disconnect()
