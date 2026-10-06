import { db } from '../../lib/database'
import { sameOrigin, tokenHash } from '../../lib/security'
export default defineEventHandler(async event => {
  sameOrigin(event)
  const token = getCookie(event, 'mesa_session')
  if (token) await db.sesion.deleteMany({where:{token:tokenHash(token)}})
  deleteCookie(event, 'mesa_session', { path: '/' })
  return { ok: true }
})
