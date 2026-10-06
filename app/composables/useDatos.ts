import { type Tarea, type Trabajo } from '~/data/trabajos'
import { type Integrante } from '~/data/equipo'
import { type Correo } from '~/data/correos'
import { type Conversacion } from '~/data/mensajes'
import { type Notificacion } from '~/data/notificaciones'

export type Rol = 'admin' | 'trabajador'


export function useTrabajos() {
  const trabajos = useState<Record<string, Trabajo>>('trabajos', () => ({}))

  function buscarTarea(id: number | string): { tarea: Tarea, trabajo: Trabajo } | null {
    for (const trabajo of Object.values(trabajos.value)) {
      const tarea = trabajo.tareas.find((t) => t.id === Number(id))
      if (tarea) return { tarea, trabajo }
    }
    return null
  }

  function tareasDe(persona: string) {
    return Object.values(trabajos.value).flatMap((trabajo) =>
      trabajo.tareas.filter((t) => t.asignado === persona).map((tarea) => ({ tarea, trabajo })),
    )
  }

  function siguienteCodigo() {
    const numeros = Object.keys(trabajos.value).map((codigo) => Number(codigo.slice(3)))
    return `TR-${String(Math.max(0, ...numeros) + 1).padStart(3, '0')}`
  }

  return { trabajos, buscarTarea, tareasDe, siguienteCodigo }
}

export function useEquipo() {
  return useState<Integrante[]>('equipo', () => [])
}

export function useCorreos() {
  return useState<Correo[]>('correos', () => [])
}

export function useConversaciones(rol: Rol) {
  return useState<Conversacion[]>(`conversaciones-${rol}`, () =>
    [])
}

export function useNotificaciones(rol: Rol) {
  return useState<Notificacion[]>(`notificaciones-${rol}`, () =>
    [])
}

interface Aviso {
  texto: string
  deshacer: (() => void) | null
  id: number
}

export function useAviso() {
  const aviso = useState<Aviso | null>('aviso', () => null)

  function mostrar(texto: string, deshacer: (() => void) | null = null) {
    const id = Date.now()
    aviso.value = { texto, deshacer, id }
    setTimeout(() => {
      if (aviso.value?.id === id) aviso.value = null
    }, deshacer ? 5000 : 3000)
  }

  function cerrar() {
    aviso.value = null
  }

  return { aviso, mostrar, cerrar }
}
