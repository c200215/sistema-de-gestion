import type { Estado, Prioridad } from '~/data/trabajos'

export const ESTADOS: Estado[] = ['Pendiente', 'En curso', 'Terminado']

export const clasesPrioridad: Record<Prioridad, string> = {
  Urgente: 'font-semibold text-white bg-rose-600',
  Alta: 'text-orange-700 bg-orange-50 border border-orange-200',
  Media: 'text-slate-600 bg-slate-100 border border-slate-200',
  Baja: 'text-slate-500 bg-white border border-slate-200',
}

export const clasesEstado: Record<Estado, string> = {
  Pendiente: 'text-amber-700 bg-amber-50 border border-amber-200',
  'En curso': 'text-blue-800 bg-blue-50 border border-blue-200',
  Terminado: 'text-teal-700 bg-teal-50 border border-teal-200',
}

export const clasesVencido = 'text-rose-700 bg-rose-50 border border-rose-200'
export const clasesPositivo = 'text-teal-700 bg-teal-50 border border-teal-200'
export const clasesAdvertencia = 'text-amber-700 bg-amber-50 border border-amber-200'
export const clasesNeutro = 'text-slate-500 bg-slate-100 border border-slate-200'

export function iniciales(nombre: string) {
  return nombre.split(/\s+/).slice(0, 2).map((parte) => parte[0] ?? '').join('').toUpperCase()
}

export function plural(cantidad: number, singular: string, pluralTexto: string) {
  return `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`
}

export function extension(nombre: string) {
  return nombre.split('.').pop()?.toLowerCase() ?? ''
}

export const coloresArchivo: Record<string, string> = {
  pdf: 'text-rose-600 bg-rose-50',
  doc: 'text-blue-800 bg-blue-50',
  docx: 'text-blue-800 bg-blue-50',
  xls: 'text-teal-700 bg-teal-50',
  xlsx: 'text-teal-700 bg-teal-50',
}

export const EXTENSIONES_PERMITIDAS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg']
export const LIMITE_ARCHIVO = 5 * 1024 * 1024

export function formatoPeso(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function normalizar(texto: string) {
  return texto.trim().toLocaleLowerCase('es')
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']

export function fechaDesdeISO(valor: string) {
  if (!valor) return ''
  const [anio, mes, dia] = valor.split('-')
  return `${dia} ${MESES[Number(mes) - 1]} ${anio}`
}

export function procesarArchivos(archivos: File[], autor: string) {
  const aceptados: { nombre: string, peso: string, autor: string, fecha: string }[] = []
  let rechazados = 0

  for (const archivo of archivos) {
    if (!EXTENSIONES_PERMITIDAS.includes(extension(archivo.name)) || archivo.size > LIMITE_ARCHIVO) {
      rechazados++
      continue
    }
    aceptados.push({ nombre: archivo.name, peso: formatoPeso(archivo.size), autor, fecha: 'Ahora' })
  }

  return { aceptados, rechazados }
}

export function mensajeCarga(aceptados: number, rechazados: number) {
  if (rechazados) {
    const inicio = rechazados === 1 ? 'Un archivo no se adjuntó' : `${rechazados} archivos no se adjuntaron`
    return `${inicio}: revisa el formato y que pese menos de 5 MB`
  }
  if (aceptados) return aceptados === 1 ? 'Documento adjuntado' : `${aceptados} documentos adjuntados`
  return ''
}
