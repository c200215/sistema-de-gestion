import { db } from '../../lib/database'
import { tokenHash } from '../../lib/security'
import { gmailConfig, GMAIL_SCOPE } from '../../lib/gmail/config'
import { unseal } from '../../lib/gmail/crypto'
import { googleProvider } from '../../lib/gmail/provider'
import { gmailService } from '../../lib/gmail/service'
export default defineEventHandler(async event=>{
  setHeader(event,'Cache-Control','no-store');setHeader(event,'Referrer-Policy','no-referrer')
  setHeader(event,'Content-Security-Policy',"default-src 'none'; base-uri 'none'; frame-ancestors 'none'")
  const query=getQuery(event)
  let result='error'
  try{
    const state=typeof query.state==='string'?query.state:''
    const nonce=getCookie(event,'gmail_oauth')||''
    const pending=state&&nonce?await db.gmailOAuthEstado.findUnique({where:{hash:tokenHash(state)}}):null
    if(!pending||pending.navegadorHash!==tokenHash(nonce)||pending.expira<new Date())throw Error('invalid state')
    const session=await db.sesion.findUnique({where:{token:pending.sesionHash},include:{usuario:true}})
    if(!session||session.expira<new Date()||!session.usuario.activo||session.usuario.perfil!=='Administrador')throw Error('invalid session')
    const consumed=await db.gmailOAuthEstado.deleteMany({where:{hash:pending.hash,expira:{gte:new Date()}}})
    if(consumed.count!==1)throw Error('replayed state')
    if(query.error)result='denegado'
    else{
      if(typeof query.code!=='string'||query.code.length>4096)throw Error('invalid code')
      const tokens=await googleProvider.exchange(query.code,unseal<string>(pending.verifierCifrado,gmailConfig().key))
      if(tokens.scope&&!tokens.scope.split(' ').includes(GMAIL_SCOPE))throw Error('missing scope')
      await gmailService.connect(tokens)
      result='ok'
    }
  }catch{result='error'}
  deleteCookie(event,'gmail_oauth',{path:'/api/gmail/callback'})
  setHeader(event,'Content-Type','text/html; charset=utf-8')
  // A same-site navigation from a document restores the existing Strict application session cookie.
  return '<!doctype html><html lang="es"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/admin/correos?gmail='+result+'"><title>Conexión con Gmail</title><body><p>Volviendo a la mesa de gestión.</p><a href="/admin/correos?gmail='+result+'">Continuar</a></body></html>'
})
