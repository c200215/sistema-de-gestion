import { z } from 'zod'
import { createError } from 'h3'
export const text = z.string().trim().min(1).max(5000)
export const estado = z.enum(['Pendiente', 'En curso', 'Terminado'])
export const fecha = z.string().max(40)
export const workInput = z.object({ titulo: text.max(250), descripcion: text, tipo: z.enum(['Proyecto','Consulta','Soporte técnico']), cliente: text.max(250), contacto: text.max(254), canal: text.max(80), responsable: text.max(160), prioridad: z.enum(['Urgente','Alta','Media','Baja']), fecha })
export const taskInput = z.object({ titulo: text.max(250), descripcion: text, asignado: text.max(160), fecha })
export function canRead(user: any, work: any) {
  return user.perfil === 'Administrador' || work.responsable === user.nombre || work.tareas.some((t: any) => t.asignado === user.nombre)
}
export function allowed(condition: boolean) {
  if (!condition) throw createError({ statusCode: 403, statusMessage: 'No tienes permiso para esta operacion' })
}
export function audit(list: any[], text: string) { list.unshift({ texto: text, fecha: new Date().toISOString() }) }
export function decorate(work: any) {
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sept','oct','nov','dic']
  const late = (value: string, state: string) => {
    const parts = value.split(' ')
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : parts.length === 3 && months.includes(parts[1]!) ? `${parts[2]}-${String(months.indexOf(parts[1]!) + 1).padStart(2,'0')}-${parts[0]!.padStart(2,'0')}` : ''
    return !!iso && state !== 'Terminado' && iso < new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
  }
  work.vencido = late(work.fecha, work.estado)
  for (const task of work.tareas) task.vencida = late(task.fecha, task.estado)
  return work
}
