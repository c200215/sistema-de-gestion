import { z } from 'zod'
import { db } from '../../lib/database'
import { sameOrigin, tokenHash, verifyPassword, loginCookie, publicUser } from '../../lib/security'
export default defineEventHandler(async event => {
  sameOrigin(event)
  const parsed=z.object({ email: z.string().email().max(254), password: z.string().min(1).max(256) }).safeParse(await readBody(event))
  if(!parsed.success) throw createError({statusCode:400,statusMessage:'Revisa el correo y la clave'})
  const {email,password}=parsed.data
  const key = tokenHash(email.trim().toLowerCase())
  await db.intentoLogin.deleteMany({where:{inicio:{lt:new Date(Date.now()-900000)}}})
  const attempt=await db.intentoLogin.upsert({where:{clave:key},create:{clave:key,intentos:1},update:{intentos:{increment:1}}})
  if (attempt.intentos > 10) throw createError({ statusCode: 429, statusMessage: 'Espera 15 minutos antes de volver a intentar' })
  const user=await db.usuario.findUnique({where:{correo:email.trim().toLowerCase()}})
  if (!user || !user.activo || user.eliminado || !verifyPassword(password, user.password_hash)) throw createError({ statusCode: 401, statusMessage: 'Correo o clave incorrectos' })
  await db.intentoLogin.deleteMany({where:{clave:key}})
  await db.usuario.update({where:{id:user.id},data:{acceso:new Date()}})
  await loginCookie(event, user.id)
  return publicUser(user)
})
