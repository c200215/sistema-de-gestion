export interface MensajeChat {
  mio: boolean
  texto: string
  hora: string
}

export interface Conversacion {
  id: string
  nombre: string
  iniciales: string
  detalle: string
  general?: boolean
  admin?: boolean
  noLeidos: boolean
  mensajes: MensajeChat[]
}

export const conversacionesAdmin: Conversacion[] = [
  {
    id: 'carlos',
    nombre: 'Carlos Rojas',
    iniciales: 'CR',
    detalle: 'Redes',
    noLeidos: true,
    mensajes: [
      { mio: true, texto: 'Carlos, ¿cómo va el ticket de la VPN de la sede norte?', hora: 'Hoy, 10:12' },
      { mio: false, texto: 'Reinicié el servicio y quedó estable por ahora. Sigo monitoreando la conexión.', hora: 'Hoy, 10:20' },
      { mio: false, texto: '¿Te subo el log de la VPN al trabajo o te lo mando por acá?', hora: 'Hoy, 10:31' },
    ],
  },
  {
    id: 'sofia',
    nombre: 'Sofía Ríos',
    iniciales: 'SR',
    detalle: 'Infraestructura',
    noLeidos: true,
    mensajes: [
      { mio: true, texto: 'Sofía, necesito el presupuesto actualizado para enviarlo a la Sede Central.', hora: 'Hoy, 08:50' },
      { mio: false, texto: 'Listo el presupuesto v2, quedó adjunto en TR-004.', hora: 'Hoy, 09:55' },
    ],
  },
  {
    id: 'general',
    nombre: 'Anuncios del equipo',
    iniciales: 'EQ',
    detalle: 'Mensajes generales para todo el equipo',
    general: true,
    noLeidos: false,
    mensajes: [
      { mio: true, texto: 'Bienvenidos a la plataforma. Desde ahora los trabajos, tareas y avances se registran aquí.', hora: 'Lun 28 sept, 09:02' },
      { mio: true, texto: 'Recuerden actualizar el estado de sus tareas antes del viernes.', hora: 'Ayer, 17:40' },
    ],
  },
  {
    id: 'maria',
    nombre: 'María García',
    iniciales: 'MG',
    detalle: 'Soporte',
    noLeidos: false,
    mensajes: [
      { mio: true, texto: 'María, recuerda respaldar la base de datos antes de iniciar la migración de Acme.', hora: 'Ayer, 16:05' },
      { mio: false, texto: 'Perfecto, mañana temprano reviso el respaldo.', hora: 'Ayer, 16:12' },
    ],
  },
  {
    id: 'tomas',
    nombre: 'Tomás Vera',
    iniciales: 'TV',
    detalle: 'Soporte',
    noLeidos: false,
    mensajes: [
      { mio: false, texto: 'Terminé todas las tareas del inventario de equipos, ¿lo puedes revisar?', hora: 'Lun 28 sept, 15:30' },
      { mio: true, texto: 'Gracias, Tomás. Lo reviso y actualizo el estado del trabajo.', hora: 'Lun 28 sept, 15:42' },
    ],
  },
]

export const conversacionesTrabajador: Conversacion[] = [
  {
    id: 'general',
    nombre: 'Anuncios del equipo',
    iniciales: 'EQ',
    detalle: 'Mensajes generales del administrador',
    general: true,
    noLeidos: true,
    mensajes: [
      { mio: false, texto: 'Bienvenidos a la plataforma. Desde ahora los trabajos, tareas y avances se registran aquí.', hora: 'Lun 28 sept, 09:02' },
      { mio: false, texto: 'Recuerden actualizar el estado de sus tareas antes del viernes.', hora: 'Ayer, 17:40' },
    ],
  },
  {
    id: 'sofia',
    nombre: 'Sofía Ríos',
    iniciales: 'SR',
    detalle: 'Infraestructura',
    noLeidos: true,
    mensajes: [
      { mio: true, texto: 'Sofía, ¿alcanzas a ver los certificados de la VPN hoy? Los usuarios de la sede norte siguen sin conexión.', hora: 'Hoy, 10:35' },
      { mio: false, texto: 'Sí, en la tarde actualizo los certificados.', hora: 'Hoy, 10:52' },
    ],
  },
  {
    id: 'roberto',
    nombre: 'Roberto Salinas',
    iniciales: 'RS',
    detalle: 'Administrador · Coordinación',
    admin: true,
    noLeidos: false,
    mensajes: [
      { mio: false, texto: 'Carlos, ¿cómo va el ticket de la VPN de la sede norte?', hora: 'Hoy, 10:12' },
      { mio: true, texto: 'Reinicié el servicio y quedó estable por ahora. Sigo monitoreando la conexión.', hora: 'Hoy, 10:20' },
      { mio: true, texto: '¿Te subo el log de la VPN al trabajo o te lo mando por acá?', hora: 'Hoy, 10:31' },
    ],
  },
  {
    id: 'maria',
    nombre: 'María García',
    iniciales: 'MG',
    detalle: 'Soporte',
    noLeidos: false,
    mensajes: [
      { mio: false, texto: 'Carlos, el respaldo de Acme ya está listo. Avísame cuando tengas lista la conexión para validar.', hora: 'Ayer, 16:40' },
    ],
  },
  {
    id: 'tomas',
    nombre: 'Tomás Vera',
    iniciales: 'TV',
    detalle: 'Soporte',
    noLeidos: false,
    mensajes: [],
  },
  {
    id: 'ana',
    nombre: 'Ana Torres',
    iniciales: 'AT',
    detalle: 'Desarrollo',
    noLeidos: false,
    mensajes: [],
  },
]
