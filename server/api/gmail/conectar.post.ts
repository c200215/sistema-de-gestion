import { randomBytes, createHash } from 'node:crypto'
import { db } from '../../lib/database'
import { admin, requireUser, sameOrigin, tokenHash } from '../../lib/security'
import { gmailConfig } from '../../lib/gmail/config'
import { seal } from '../../lib/gmail/crypto'
import { googleProvider } from '../../lib/gmail/provider'
export default defineEventHandler(async event=>{
  sameOrigin(event);admin(await requireUser(event))
  const config=gmailConfig()
  if(getRequestURL(event).origin!==new URL(config.redirectUri).origin)throw createError({statusCode:400,statusMessage:'Abre la aplicación desde '+new URL(config.redirectUri).origin+' para conectar Google.'})
  const state=randomBytes(32).toString('base64url'),nonce=randomBytes(32).toString('base64url'),verifier=randomBytes(48).toString('base64url')
  const challenge=createHash('sha256').update(verifier).digest('base64url')
  const sesionHash=tokenHash(getCookie(event,'mesa_session')!)
  await db.gmailOAuthEstado.deleteMany({where:{OR:[{expira:{lt:new Date()}},{sesionHash}]}})
  await db.gmailOAuthEstado.create({data:{hash:tokenHash(state),navegadorHash:tokenHash(nonce),sesionHash,verifierCifrado:seal(verifier,config.key),expira:new Date(Date.now()+600000)}})
  setCookie(event,'gmail_oauth',nonce,{httpOnly:true,sameSite:'lax',secure:new URL(config.redirectUri).protocol==='https:',path:'/api/gmail/callback',maxAge:600})
  setHeader(event,'Cache-Control','no-store')
  return {url:googleProvider.authUrl(state,challenge)}
})
