import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import type { Credentials } from 'google-auth-library'
import { db } from '../database'
import { gmailConfig } from './config'
import { seal, unseal } from './crypto'
import { GmailError, googleProvider, type GmailProvider } from './provider'
import { parseGmailMessage, fileAllowed, MAX_GMAIL_FILE } from './mime'

export function safeGmailError(e:any){
  if(e instanceof GmailError){
    const messages={reauthorize:'Google requiere que vuelvas a conectar la cuenta.',quota:'Google alcanzó su límite temporal. Intenta nuevamente en unos minutos.',unavailable:'No se pudo contactar con Google. Intenta nuevamente.',missing:'El correo o adjunto ya no está disponible en Gmail.',scope:'Google no permitió leer el buzón. Revisa los permisos y que Gmail API esté habilitada.'}
    return createError({statusCode:e.kind==='reauthorize'?409:e.status,statusMessage:messages[e.kind]})
  }
  if(e.statusCode && e.statusMessage)return e
  return createError({statusCode:502,statusMessage:'No se pudo completar la operación de Gmail.'})
}

export function createGmailService(database=db,provider:GmailProvider=googleProvider,key=()=>gmailConfig().key){
  async function withAccount<T>(operation:(account:any,id:string)=>Promise<T>):Promise<T>{
    await database.gmailCuenta.upsert({where:{id:1},create:{id:1},update:{}})
    const id=randomUUID()
    const acquired=await database.gmailCuenta.updateMany({where:{id:1,OR:[{operacionHasta:null},{operacionHasta:{lt:new Date()}}]},data:{operacionId:id,operacionHasta:new Date(Date.now()+120000)}})
    if(!acquired.count)throw createError({statusCode:409,statusMessage:'Hay otra operación de Gmail en curso. Espera unos segundos.'})
    try{return await operation(await database.gmailCuenta.findUniqueOrThrow({where:{id:1}}),id)}
    catch(e){
      const err=safeGmailError(e)
      await database.gmailCuenta.updateMany({where:{id:1,operacionId:id},data:{ultimoError:err.statusMessage,...(e instanceof GmailError && e.kind==='reauthorize'?{requiereConexion:true}:{})}})
      throw err
    }finally{await database.gmailCuenta.updateMany({where:{id:1,operacionId:id},data:{operacionId:null,operacionHasta:null}})}
  }
  async function heartbeat(id:string){
    const held=await database.gmailCuenta.updateMany({where:{id:1,operacionId:id},data:{operacionHasta:new Date(Date.now()+120000)}})
    if(!held.count)throw createError({statusCode:409,statusMessage:'La operación de Gmail expiró. Vuelve a intentar.'})
  }
  async function tokensFor(account:any,id:string):Promise<Credentials>{
    if(!account.tokensCifrados||account.requiereConexion)throw new GmailError('reauthorize',401)
    let tokens=unseal<Credentials>(account.tokensCifrados,key())
    if(!tokens.access_token||!tokens.expiry_date||tokens.expiry_date<Date.now()+60000){
      tokens={...tokens,...await provider.refresh(tokens)}
      account.tokensCifrados=seal(tokens,key())
      await database.gmailCuenta.updateMany({where:{id:1,operacionId:id},data:{tokensCifrados:account.tokensCifrados}})
    }
    return tokens
  }
  async function api(account:any,id:string,tokens:Credentials,path:string,params:Record<string,string>={}):Promise<any>{
    try{return await provider.get(tokens,path,params)}catch(e){
      if(!(e instanceof GmailError)||e.kind!=='reauthorize')throw e
      const fresh=await provider.refresh(tokens)
      Object.assign(tokens,{...fresh,refresh_token:fresh.refresh_token||tokens.refresh_token})
      await database.gmailCuenta.updateMany({where:{id:1,operacionId:id},data:{tokensCifrados:seal(tokens,key())}})
      return provider.get(tokens,path,params)
    }
  }
  async function connect(tokens:Credentials){return withAccount(async(account,id)=>{
    const profile=await provider.get<any>(tokens,'/profile')
    if(!profile.emailAddress)throw new GmailError('unavailable')
    const email=String(profile.emailAddress).toLowerCase()
    if(process.env.GOOGLE_GMAIL_ADDRESS && email!==process.env.GOOGLE_GMAIL_ADDRESS.trim().toLowerCase())throw createError({statusCode:409,statusMessage:'La cuenta autorizada no coincide con el buzón configurado.'})
    if(!tokens.refresh_token && account.correo===email && account.tokensCifrados)tokens.refresh_token=unseal<Credentials>(account.tokensCifrados,key()).refresh_token
    if(!tokens.refresh_token)throw createError({statusCode:409,statusMessage:'Google no entregó acceso renovable. Vuelve a conectar y acepta el permiso.'})
    await database.gmailCuenta.updateMany({where:{id:1,operacionId:id},data:{correo:email,tokensCifrados:seal(tokens,key()),requiereConexion:false,ultimoError:null,historyId:account.correo===email?account.historyId:null,syncModo:null,syncPagina:null,syncAncla:null,syncConsulta:null,ultimaSync:account.correo===email?account.ultimaSync:null}})
    return email
  })}
  async function sync(){return withAccount(async(account,id)=>{
    const tokens=await tokensFor(account,id)
    if(!account.syncModo){
      if(account.historyId){account.syncModo='history';account.syncAncla=account.historyId}
      else{
        account.syncModo='full';account.syncAncla=(await api(account,id,tokens,'/profile')).historyId
        account.syncConsulta='in:inbox after:'+Math.floor((Date.now()-30*86400000)/1000)
      }
      await database.gmailCuenta.updateMany({where:{id:1,operacionId:id},data:{syncModo:account.syncModo,syncAncla:account.syncAncla,syncConsulta:account.syncConsulta,syncPagina:null}})
    }
    let page:any
    try{
      page=await api(account,id,tokens,account.syncModo==='full'?'/messages':'/history',{
        maxResults:'25',...(account.syncModo==='full'?{q:account.syncConsulta}:{startHistoryId:account.syncAncla}),...(account.syncPagina?{pageToken:account.syncPagina}:{}),
      })
    }catch(e){
      if(e instanceof GmailError && ((e.kind==='missing' && account.syncModo==='history') || (e.status===400 && account.syncPagina))){
        await database.gmailCuenta.updateMany({where:{id:1,operacionId:id},data:{historyId:null,syncModo:null,syncPagina:null,syncAncla:null,syncConsulta:null}})
        return {importados:0,pendiente:true,reiniciada:true}
      }
      throw e
    }
    const ids=new Set<string>(account.syncModo==='full'?(page.messages||[]).map((m:any)=>m.id):(page.history||[]).flatMap((h:any)=>[...(h.messagesAdded||[]).map((m:any)=>m.message.id),...(h.labelsAdded||[]).filter((m:any)=>m.labelIds?.includes('INBOX')).map((m:any)=>m.message.id)]))
    let imported=0
    for(const messageId of ids){
      await heartbeat(id)
      const externoId=account.correo+':'+messageId
      if(await database.correo.findUnique({where:{externoId},select:{id:true}}))continue
      let message:any
      try{message=await api(account,id,tokens,'/messages/'+encodeURIComponent(messageId),{format:'full'})}
      catch(e){if(e instanceof GmailError && e.kind==='missing')continue;throw e}
      if(!message.labelIds?.includes('INBOX'))continue
      const {adjuntos,...data}=parseGmailMessage(message)
      await database.$transaction(async tx=>{
        // Take the mailbox row lock before importing; a stale worker cannot commit after disconnect.
        const held=await tx.gmailCuenta.updateMany({where:{id:1,operacionId:id},data:{operacionHasta:new Date(Date.now()+120000)}})
        if(!held.count)throw createError({statusCode:409,statusMessage:'La operación de Gmail expiró.'})
        await tx.correo.upsert({where:{externoId},update:{},create:{...data,externoId,cuentaGoogle:account.correo,mensajeGoogleId:messageId,adjuntos:{create:adjuntos}}})
      })
      imported++
    }
    const pending=!!page.nextPageToken
    await database.gmailCuenta.updateMany({where:{id:1,operacionId:id},data:pending?{syncPagina:page.nextPageToken,ultimoError:null}:{historyId:account.syncModo==='full'?account.syncAncla:page.historyId||account.syncAncla,syncModo:null,syncPagina:null,syncAncla:null,syncConsulta:null,ultimaSync:new Date(),ultimoError:null}})
    return {importados:imported,pendiente:pending,reiniciada:false}
  })}
  async function attachmentBytes(attachment:any,account:any,tokens:Credentials,id:string){
    if(!fileAllowed(attachment.nombre,attachment.bytes))throw createError({statusCode:400,statusMessage:'El adjunto debe ser PDF, Word, Excel o imagen y pesar hasta 5 MB.'})
    if(attachment.contenido)return Buffer.from(attachment.contenido)
    if(account.correo!==attachment.correo.cuentaGoogle)throw createError({statusCode:409,statusMessage:'Conecta la cuenta de Gmail de origen para descargar este adjunto.'})
    if(!attachment.googleAdjuntoId)throw new GmailError('missing',404)
    const file=await api(account,id,tokens,'/messages/'+encodeURIComponent(attachment.correo.mensajeGoogleId)+'/attachments/'+encodeURIComponent(attachment.googleAdjuntoId))
    if(!file.data)throw new GmailError('missing',404)
    const bytes=Buffer.from(file.data,'base64url')
    if(bytes.length>MAX_GMAIL_FILE)throw createError({statusCode:413,statusMessage:'El adjunto supera los 5 MB.'})
    return bytes
  }
  async function attachments(ids:string[],correoId?:number){
    if(!ids.length)return []
    const records=await database.correoAdjunto.findMany({where:{id:{in:ids},...(correoId?{correoId}:{})},include:{correo:true}})
    if(records.length!==new Set(ids).size)throw createError({statusCode:404,statusMessage:'Adjunto no encontrado.'})
    if(records.some(r=>!fileAllowed(r.nombre,r.bytes)))throw createError({statusCode:400,statusMessage:'El adjunto debe ser PDF, Word, Excel o imagen y pesar hasta 5 MB.'})
    if(records.every(r=>r.contenido))return records.map(r=>{
      if(!fileAllowed(r.nombre,r.bytes))throw createError({statusCode:400,statusMessage:'Archivo no permitido.'})
      return {...r,contenido:Buffer.from(r.contenido!)}
    })
    return withAccount(async(account,id)=>{
      const tokens=await tokensFor(account,id),files=[]
      for(const record of records){await heartbeat(id);files.push({...record,contenido:await attachmentBytes(record,account,tokens,id)})}
      return files
    })
  }
  async function disconnect(){return withAccount(async(account,id)=>{
    let revoked=true
    if(account.tokensCifrados){try{await provider.revoke(unseal(account.tokensCifrados,key()))}catch{revoked=false}}
    await database.gmailCuenta.updateMany({where:{id:1,operacionId:id},data:{tokensCifrados:null,requiereConexion:false,historyId:null,syncModo:null,syncPagina:null,syncAncla:null,syncConsulta:null,ultimoError:null}})
    await database.gmailOAuthEstado.deleteMany({})
    return {ok:true,revocado:revoked}
  })}
  return {connect,sync,attachments,disconnect}
}
export const gmailService=createGmailService()
