export type Perfil = 'Administrador' | 'Trabajador'

export interface Integrante {
  id: number
  nombre: string
  correo: string
  perfil: Perfil
  especialidad: string
  activo: boolean
  acceso: string
  yo?: boolean
}

export const especialidades = ['Coordinación', 'Soporte', 'Redes', 'Desarrollo', 'Infraestructura']

export const equipoInicial: Integrante[] = [
  { id: 1, nombre: 'Roberto Salinas', correo: 'r.salinas@ignitelatam.com', perfil: 'Administrador', especialidad: 'Coordinación', activo: true, acceso: 'En línea', yo: true },
  { id: 2, nombre: 'María García', correo: 'm.garcia@ignitelatam.com', perfil: 'Trabajador', especialidad: 'Soporte', activo: true, acceso: 'Hoy, 10:05' },
  { id: 3, nombre: 'Carlos Rojas', correo: 'c.rojas@ignitelatam.com', perfil: 'Trabajador', especialidad: 'Redes', activo: true, acceso: 'Hoy, 10:31' },
  { id: 4, nombre: 'Sofía Ríos', correo: 's.rios@ignitelatam.com', perfil: 'Trabajador', especialidad: 'Infraestructura', activo: true, acceso: 'Hoy, 09:55' },
  { id: 5, nombre: 'Tomás Vera', correo: 't.vera@ignitelatam.com', perfil: 'Trabajador', especialidad: 'Soporte', activo: true, acceso: 'Ayer, 15:30' },
  { id: 6, nombre: 'Ana Torres', correo: 'a.torres@ignitelatam.com', perfil: 'Trabajador', especialidad: 'Desarrollo', activo: true, acceso: 'Hace 3 días' },
  { id: 7, nombre: 'Luis Méndez', correo: 'l.mendez@ignitelatam.com', perfil: 'Trabajador', especialidad: 'Desarrollo', activo: false, acceso: '14 ago 2026' },
]

export interface FilaReporte {
  iniciales: string
  nombre: string
  especialidad: string
  trabajos: number
  asignadas: number
  terminadas: number
  aTiempo: number
  vencidas: number
}

export const filasReporte: FilaReporte[] = [
  { iniciales: 'MG', nombre: 'María García', especialidad: 'Soporte', trabajos: 3, asignadas: 8, terminadas: 6, aTiempo: 5, vencidas: 0 },
  { iniciales: 'CR', nombre: 'Carlos Rojas', especialidad: 'Redes', trabajos: 0, asignadas: 5, terminadas: 2, aTiempo: 2, vencidas: 1 },
  { iniciales: 'SR', nombre: 'Sofía Ríos', especialidad: 'Infraestructura', trabajos: 2, asignadas: 7, terminadas: 4, aTiempo: 4, vencidas: 0 },
  { iniciales: 'TV', nombre: 'Tomás Vera', especialidad: 'Soporte', trabajos: 1, asignadas: 4, terminadas: 4, aTiempo: 3, vencidas: 0 },
]
