export type IconoNotificacion = 'check' | 'correo' | 'chat' | 'clip' | 'reloj' | 'bandera' | 'anuncio'
export type TonoNotificacion = 'teal' | 'azul' | 'gris' | 'ambar' | 'rosa'

export interface ParteTexto {
  texto: string
  destacado?: boolean
}

export interface Notificacion {
  id: number
  icono: IconoNotificacion
  tono: TonoNotificacion
  titulo: ParteTexto[]
  detalle: string
  fecha: string
  enlace: string
  leida: boolean
}

export const notificacionesAdmin: Notificacion[] = [
  {
    id: 1,
    icono: 'check',
    tono: 'teal',
    titulo: [{ texto: 'María García', destacado: true }, { texto: ' marcó como terminada la tarea ' }, { texto: 'Respaldar base de datos actual', destacado: true }],
    detalle: 'TR-001 · Migración base de datos cliente Acme',
    fecha: 'Hace 10 minutos',
    enlace: '/admin/tareas/1',
    leida: false,
  },
  {
    id: 2,
    icono: 'correo',
    tono: 'azul',
    titulo: [{ texto: 'Nuevo correo en Gmail sin vincular: ' }, { texto: 'Consulta por renovación de licencias', destacado: true }],
    detalle: 'De contacto@empresaacme.cl · Crea un trabajo o vincúlalo a uno existente',
    fecha: 'Hace 25 minutos',
    enlace: '/admin/correos',
    leida: false,
  },
  {
    id: 3,
    icono: 'chat',
    tono: 'gris',
    titulo: [{ texto: 'Carlos Rojas', destacado: true }, { texto: ' registró un avance en ' }, { texto: 'Ticket #4821: fallo de conexión VPN', destacado: true }],
    detalle: '"Se reinició el servicio VPN en la sede norte, quedo monitoreando la conexión."',
    fecha: 'Hace 1 hora',
    enlace: '/admin/trabajos/TR-002',
    leida: false,
  },
  {
    id: 4,
    icono: 'clip',
    tono: 'gris',
    titulo: [{ texto: 'Sofía Ríos', destacado: true }, { texto: ' adjuntó ' }, { texto: 'Presupuesto_renovacion_red_v2.pdf', destacado: true }],
    detalle: 'TR-004 · Preparar presupuesto para renovación de red',
    fecha: 'Hace 3 horas',
    enlace: '/admin/trabajos/TR-004',
    leida: false,
  },
  {
    id: 5,
    icono: 'reloj',
    tono: 'ambar',
    titulo: [{ texto: 'Migración base de datos cliente Acme', destacado: true }, { texto: ' vence en 4 días' }],
    detalle: 'Quedan 2 de 3 tareas sin terminar',
    fecha: 'Ayer',
    enlace: '/admin/trabajos/TR-001',
    leida: true,
  },
  {
    id: 6,
    icono: 'bandera',
    tono: 'teal',
    titulo: [{ texto: 'Tomás Vera', destacado: true }, { texto: ' terminó todas las tareas de ' }, { texto: 'Actualizar inventario de equipos', destacado: true }],
    detalle: 'Revisa el trabajo y actualiza su estado general',
    fecha: 'Ayer',
    enlace: '/admin/trabajos/TR-006',
    leida: true,
  },
]

export const notificacionesTrabajador: Notificacion[] = [
  {
    id: 1,
    icono: 'reloj',
    tono: 'rosa',
    titulo: [{ texto: 'Tu tarea ' }, { texto: 'Revisar logs del servidor VPN', destacado: true }, { texto: ' venció el 28 sept' }],
    detalle: 'TR-002 · Ticket #4821: fallo de conexión VPN',
    fecha: 'Hoy, 08:00',
    enlace: '/trabajador/tareas/4',
    leida: false,
  },
  {
    id: 2,
    icono: 'chat',
    tono: 'gris',
    titulo: [{ texto: 'María García', destacado: true }, { texto: ' comentó en ' }, { texto: 'Migración base de datos cliente Acme', destacado: true }],
    detalle: '"Respaldo completo terminado y verificado."',
    fecha: 'Hace 1 hora',
    enlace: '/trabajador/trabajos/TR-001',
    leida: false,
  },
  {
    id: 3,
    icono: 'anuncio',
    tono: 'azul',
    titulo: [{ texto: 'Nuevo anuncio de ' }, { texto: 'Roberto Salinas', destacado: true }],
    detalle: 'Recuerden actualizar el estado de sus tareas antes del viernes.',
    fecha: 'Ayer',
    enlace: '/trabajador/mensajes?c=general',
    leida: false,
  },
  {
    id: 4,
    icono: 'check',
    tono: 'teal',
    titulo: [{ texto: 'Roberto Salinas', destacado: true }, { texto: ' te asignó la tarea ' }, { texto: 'Configurar conexión con el nuevo servidor', destacado: true }],
    detalle: 'TR-001 · Migración base de datos cliente Acme',
    fecha: '26 sept',
    enlace: '/trabajador/tareas/2',
    leida: true,
  },
]
