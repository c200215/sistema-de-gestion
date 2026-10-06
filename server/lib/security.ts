import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto'
import { createError, getCookie, setCookie, getRequestURL, getHeader, type H3Event } from 'h3'
import { db } from './database'

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}
export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const expected = Buffer.from(hash, 'hex')
  return expected.length === 64 && timingSafeEqual(expected, scryptSync(password, salt, 64))
}
export const tokenHash = (value: string) => createHash('sha256').update(value).digest('hex')
export function sameOrigin(event: H3Event) {
  const origin = getHeader(event, 'origin')
  if (origin && origin !== getRequestURL(event).origin) throw createError({ statusCode: 403, statusMessage: 'Origen no permitido' })
}
export async function requireUser(event: H3Event) {
  const token = getCookie(event, 'mesa_session')
  const session=token ? await db.sesion.findUnique({where:{token:tokenHash(token)},include:{usuario:true}}) : null
  const user=session?.usuario
  if (!user?.activo || user.eliminado || session!.expira <= new Date()) throw createError({ statusCode: 401, statusMessage: 'Inicia sesion para continuar' })
  return user
}
export function admin(user: any) {
  if (user.perfil !== 'Administrador') throw createError({ statusCode: 403, statusMessage: 'Solo administradores' })
}
export function publicUser(user: any) {
  return { id: user.id, nombre: user.nombre, correo: user.correo, perfil: user.perfil, especialidad: user.especialidad, activo: !!user.activo, acceso: user.acceso || 'Nunca', rol: user.perfil === 'Administrador' ? 'admin' : 'trabajador' }
}
export async function loginCookie(event: H3Event, id: number) {
  const token = randomBytes(32).toString('hex')
  await db.sesion.deleteMany({where:{expira:{lte:new Date()}}})
  await db.sesion.create({data:{token:tokenHash(token),usuarioId:id,expira:new Date(Date.now()+28800000)}})
  setCookie(event, 'mesa_session', token, { httpOnly: true, sameSite: 'strict', secure: getRequestURL(event).protocol === 'https:', path: '/', maxAge: 28800 })
}
