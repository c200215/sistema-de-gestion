export type Estado = 'Pendiente' | 'En curso' | 'Terminado'
export type Prioridad = 'Urgente' | 'Alta' | 'Media' | 'Baja'
export type TipoTrabajo = 'Proyecto' | 'Consulta' | 'Soporte técnico'

export interface Documento {
  id?: string
  nombre: string
  peso: string
  autor: string
  fecha: string
}

export interface Entrada {
  autor: string
  texto: string
  fecha: string
}

export interface EventoHistorial {
  texto: string
  fecha: string
}

export interface Tarea {
  terminada?: string | null
  id: number
  titulo: string
  descripcion: string
  asignado: string
  estado: Estado
  fecha: string
  vencida: boolean
  creada: string
  actualizada: string
  documentos: Documento[]
  avances: Entrada[]
  historial: EventoHistorial[]
  orden?: number
}

export interface Trabajo {
  version?: number
  codigo: string
  titulo: string
  tipo: TipoTrabajo
  cliente: string
  contacto: string
  canal: string
  responsable: string
  prioridad: Prioridad
  estado: Estado
  fecha: string
  vencido: boolean
  descripcion: string
  tareas: Tarea[]
  comentarios: Entrada[]
  documentos: Documento[]
  historial: EventoHistorial[]
}

export const trabajosIniciales: Record<string, Trabajo> = {
  'TR-001': {
    codigo: 'TR-001',
    titulo: 'Migración base de datos cliente Acme',
    tipo: 'Proyecto',
    cliente: 'Empresa Acme',
    contacto: 'contacto@empresaacme.cl',
    canal: 'Correo',
    responsable: 'María García',
    prioridad: 'Alta',
    estado: 'En curso',
    fecha: '04 oct 2026',
    vencido: false,
    descripcion: 'Migrar la base de datos de facturación de Empresa Acme a un servidor nuevo, sin pérdida de información. El cliente autorizó detener el sistema el viernes desde las 19:00.',
    tareas: [
      {
        id: 1,
        titulo: 'Respaldar base de datos actual',
        descripcion: 'Respaldo completo de la base de facturación y verificación de su integridad.',
        asignado: 'María García',
        estado: 'Terminado',
        fecha: '30 sept 2026',
        vencida: false,
        creada: '26 sept 2026, 10:05',
        actualizada: 'Hoy, 09:35',
        documentos: [{ nombre: 'verificacion_respaldo_acme.pdf', peso: '210 KB', autor: 'María García', fecha: 'Hoy, 09:34' }],
        avances: [{ autor: 'María García', texto: 'Respaldo completo generado y restaurado en un ambiente de prueba para verificarlo.', fecha: 'Hoy, 09:33' }],
        historial: [
          { texto: 'María García cambió el estado de En curso a Terminado', fecha: 'Hoy, 09:35' },
          { texto: 'María García adjuntó "verificacion_respaldo_acme.pdf"', fecha: 'Hoy, 09:34' },
          { texto: 'Roberto Salinas creó la tarea y la asignó a María García', fecha: '26 sept, 10:05' },
        ],
      },
      {
        id: 2,
        titulo: 'Configurar conexión con el nuevo servidor',
        descripcion: 'Abrir los puertos necesarios en el firewall y validar la conexión entre el servidor actual y el nuevo. Dejar respaldo de las reglas aplicadas y de la prueba de conexión.',
        asignado: 'Carlos Rojas',
        estado: 'En curso',
        fecha: '02 oct 2026',
        vencida: false,
        creada: '26 sept 2026, 10:06',
        actualizada: 'Ayer, 14:25',
        documentos: [{ nombre: 'reglas_firewall_migracion.xlsx', peso: '24 KB', autor: 'Carlos Rojas', fecha: 'Ayer, 14:25' }],
        avances: [{ autor: 'Carlos Rojas', texto: 'Puertos abiertos en el firewall. Falta probar la conexión desde el servidor nuevo.', fecha: 'Ayer, 14:22' }],
        historial: [
          { texto: 'Carlos Rojas adjuntó "reglas_firewall_migracion.xlsx"', fecha: 'Ayer, 14:25' },
          { texto: 'Carlos Rojas cambió el estado de Pendiente a En curso', fecha: 'Ayer, 14:10' },
          { texto: 'Roberto Salinas creó la tarea y la asignó a Carlos Rojas', fecha: '26 sept, 10:06' },
        ],
      },
      {
        id: 3,
        titulo: 'Validar datos migrados',
        descripcion: 'Comparar la cantidad de registros y los totales de facturación antes y después de la migración.',
        asignado: 'Ana Torres',
        estado: 'Pendiente',
        fecha: '04 oct 2026',
        vencida: false,
        creada: '26 sept 2026, 10:07',
        actualizada: '26 sept, 10:07',
        documentos: [],
        avances: [],
        historial: [{ texto: 'Roberto Salinas creó la tarea y la asignó a Ana Torres', fecha: '26 sept, 10:07' }],
      },
    ],
    comentarios: [
      { autor: 'María García', texto: 'Respaldo completo terminado y verificado. Quedó en el servidor de respaldos.', fecha: 'Hoy, 09:38' },
      { autor: 'Roberto Salinas', texto: 'El cliente confirmó la ventana del viernes desde las 19:00.', fecha: 'Ayer, 11:20' },
    ],
    documentos: [
      { nombre: 'plan_migracion_acme.pdf', peso: '640 KB', autor: 'María García', fecha: '27 sept' },
    ],
    historial: [
      { texto: 'María García cambió la tarea "Respaldar base de datos actual" a Terminado', fecha: 'Hoy, 09:35' },
      { texto: 'Carlos Rojas cambió la tarea "Configurar conexión con el nuevo servidor" a En curso', fecha: 'Ayer, 14:10' },
      { texto: 'Roberto Salinas vinculó el correo "Re: Migración base de datos"', fecha: 'Ayer, 11:08' },
      { texto: 'Roberto Salinas designó a María García como responsable principal', fecha: '26 sept, 10:02' },
      { texto: 'Roberto Salinas registró el trabajo', fecha: '26 sept, 10:00' },
    ],
  },
  'TR-002': {
    codigo: 'TR-002',
    titulo: 'Ticket #4821: fallo de conexión VPN',
    tipo: 'Soporte técnico',
    cliente: 'Sede Norte',
    contacto: 'mesa.ayuda@sedenorte.cl',
    canal: 'Correo',
    responsable: 'María García',
    prioridad: 'Urgente',
    estado: 'Pendiente',
    fecha: '28 sept 2026',
    vencido: true,
    descripcion: 'Desde las 9:00 del 26 de septiembre ningún usuario de la sede norte puede conectarse a la VPN. El equipo contable no puede trabajar.',
    tareas: [
      {
        id: 4,
        titulo: 'Revisar logs del servidor VPN',
        descripcion: 'Identificar la causa de las desconexiones revisando los registros desde el 26 de septiembre. Adjuntar el extracto de los logs con los errores encontrados.',
        asignado: 'Carlos Rojas',
        estado: 'En curso',
        fecha: '28 sept 2026',
        vencida: true,
        creada: '26 sept 2026, 09:35',
        actualizada: 'Hoy, 10:20',
        documentos: [],
        avances: [{ autor: 'Carlos Rojas', texto: 'Reinicié el servicio VPN y quedó estable por ahora. Sigo revisando los logs para encontrar la causa.', fecha: 'Hoy, 10:20' }],
        historial: [
          { texto: 'Carlos Rojas registró un avance', fecha: 'Hoy, 10:20' },
          { texto: 'Carlos Rojas cambió el estado de Pendiente a En curso', fecha: '27 sept, 09:15' },
          { texto: 'Roberto Salinas creó la tarea y la asignó a Carlos Rojas', fecha: '26 sept, 09:35' },
        ],
      },
      {
        id: 5,
        titulo: 'Actualizar certificados de acceso',
        descripcion: 'Renovar los certificados vencidos de los usuarios de la sede norte.',
        asignado: 'Sofía Ríos',
        estado: 'Pendiente',
        fecha: '02 oct 2026',
        vencida: false,
        creada: '26 sept 2026, 09:40',
        actualizada: '26 sept, 09:40',
        documentos: [],
        avances: [],
        historial: [{ texto: 'Roberto Salinas creó la tarea y la asignó a Sofía Ríos', fecha: '26 sept, 09:40' }],
      },
    ],
    comentarios: [
      { autor: 'Carlos Rojas', texto: 'Se reinició el servicio VPN en la sede norte, quedo monitoreando la conexión.', fecha: 'Hoy, 10:20' },
    ],
    documentos: [
      { nombre: 'captura_error_vpn.png', peso: '312 KB', autor: 'Roberto Salinas', fecha: '26 sept' },
    ],
    historial: [
      { texto: 'Carlos Rojas registró un avance', fecha: 'Hoy, 10:20' },
      { texto: 'Carlos Rojas cambió la tarea "Revisar logs del servidor VPN" a En curso', fecha: '27 sept, 09:15' },
      { texto: 'Roberto Salinas asignó "Actualizar certificados de acceso" a Sofía Ríos', fecha: '26 sept, 09:40' },
      { texto: 'Roberto Salinas designó a María García como responsable principal', fecha: '26 sept, 09:32' },
      { texto: 'Roberto Salinas registró el trabajo desde un correo', fecha: '26 sept, 09:30' },
    ],
  },
  'TR-003': {
    codigo: 'TR-003',
    titulo: 'Auditoría de red sede norte',
    tipo: 'Proyecto',
    cliente: 'Sede Norte',
    contacto: 'soporte@sedenorte.cl',
    canal: 'Reunión',
    responsable: 'Sofía Ríos',
    prioridad: 'Media',
    estado: 'En curso',
    fecha: '07 oct 2026',
    vencido: false,
    descripcion: 'Revisar la red de la sede norte para detectar equipos obsoletos, puntos de falla y configuraciones inseguras, y entregar un informe con recomendaciones.',
    tareas: [
      {
        id: 6,
        titulo: 'Levantar inventario de equipos de red',
        descripcion: 'Registrar modelo, ubicación y versión de firmware de switches, routers y puntos de acceso.',
        asignado: 'Sofía Ríos',
        estado: 'Pendiente',
        fecha: '05 oct 2026',
        vencida: false,
        creada: '24 sept 2026, 15:00',
        actualizada: '24 sept, 15:00',
        documentos: [],
        avances: [],
        historial: [{ texto: 'Roberto Salinas creó la tarea y la asignó a Sofía Ríos', fecha: '24 sept, 15:00' }],
      },
    ],
    comentarios: [
      { autor: 'Sofía Ríos', texto: 'Coordiné con la sede para hacer la visita el jueves en la mañana.', fecha: '29 sept, 12:10' },
    ],
    documentos: [
      { nombre: 'alcance_auditoria_sede_norte.docx', peso: '85 KB', autor: 'Roberto Salinas', fecha: '24 sept' },
    ],
    historial: [
      { texto: 'Sofía Ríos registró un avance', fecha: '29 sept, 12:10' },
      { texto: 'Roberto Salinas cambió el estado del trabajo de Pendiente a En curso', fecha: '25 sept, 09:00' },
      { texto: 'Roberto Salinas designó a Sofía Ríos como responsable principal', fecha: '24 sept, 14:58' },
      { texto: 'Roberto Salinas registró el trabajo', fecha: '24 sept, 14:55' },
    ],
  },
  'TR-004': {
    codigo: 'TR-004',
    titulo: 'Preparar presupuesto para renovación de red',
    tipo: 'Proyecto',
    cliente: 'Sede Central',
    contacto: 'administracion@sedecentral.cl',
    canal: 'Correo',
    responsable: 'Sofía Ríos',
    prioridad: 'Media',
    estado: 'Pendiente',
    fecha: '15 oct 2026',
    vencido: false,
    descripcion: 'Preparar el presupuesto para renovar los switches y puntos de acceso de la sede central, con al menos dos alternativas de proveedor.',
    tareas: [
      {
        id: 7,
        titulo: 'Cotizar equipos con proveedores',
        descripcion: 'Pedir cotizaciones a dos proveedores y consolidar el presupuesto final.',
        asignado: 'Sofía Ríos',
        estado: 'En curso',
        fecha: '10 oct 2026',
        vencida: false,
        creada: '27 sept 2026, 11:00',
        actualizada: 'Hoy, 06:50',
        documentos: [
          { nombre: 'Presupuesto_renovacion_red_v2.pdf', peso: '1,4 MB', autor: 'Sofía Ríos', fecha: 'Hoy, 06:50' },
          { nombre: 'cotizacion_proveedor_a.pdf', peso: '380 KB', autor: 'Sofía Ríos', fecha: '29 sept, 16:20' },
        ],
        avances: [
          { autor: 'Sofía Ríos', texto: 'Subí la versión 2 del presupuesto con los precios actualizados del proveedor A. Espero la cotización del proveedor B para cerrar.', fecha: 'Hoy, 06:52' },
        ],
        historial: [
          { texto: 'Sofía Ríos registró un avance', fecha: 'Hoy, 06:52' },
          { texto: 'Sofía Ríos adjuntó "Presupuesto_renovacion_red_v2.pdf"', fecha: 'Hoy, 06:50' },
          { texto: 'Sofía Ríos adjuntó "cotizacion_proveedor_a.pdf"', fecha: '29 sept, 16:20' },
          { texto: 'Sofía Ríos cambió el estado de Pendiente a En curso', fecha: '28 sept, 10:00' },
          { texto: 'Roberto Salinas creó la tarea y la asignó a Sofía Ríos', fecha: '27 sept, 11:00' },
        ],
      },
    ],
    comentarios: [],
    documentos: [],
    historial: [
      { texto: 'Sofía Ríos adjuntó "Presupuesto_renovacion_red_v2.pdf" en una tarea', fecha: 'Hoy, 06:50' },
      { texto: 'Roberto Salinas designó a Sofía Ríos como responsable principal', fecha: '27 sept, 10:58' },
      { texto: 'Roberto Salinas registró el trabajo desde un correo', fecha: '27 sept, 10:55' },
    ],
  },
  'TR-005': {
    codigo: 'TR-005',
    titulo: 'Migrar correos del área comercial',
    tipo: 'Soporte técnico',
    cliente: 'Área Comercial',
    contacto: 'comercial@ignitelatam.com',
    canal: 'Teléfono',
    responsable: 'María García',
    prioridad: 'Baja',
    estado: 'Pendiente',
    fecha: '20 oct 2026',
    vencido: false,
    descripcion: 'Trasladar los buzones del área comercial al nuevo dominio sin perder correos históricos.',
    tareas: [
      {
        id: 8,
        titulo: 'Crear cuentas en el nuevo dominio',
        descripcion: 'Crear las cuentas de los 8 integrantes del área comercial.',
        asignado: 'María García',
        estado: 'Terminado',
        fecha: '25 sept 2026',
        vencida: false,
        creada: '22 sept 2026, 09:00',
        actualizada: '24 sept, 17:30',
        documentos: [{ nombre: 'listado_cuentas_comercial.xlsx', peso: '18 KB', autor: 'María García', fecha: '24 sept, 17:28' }],
        avances: [{ autor: 'María García', texto: 'Cuentas creadas y probadas con cada usuario.', fecha: '24 sept, 17:25' }],
        historial: [
          { texto: 'María García cambió el estado de En curso a Terminado', fecha: '24 sept, 17:30' },
          { texto: 'María García adjuntó "listado_cuentas_comercial.xlsx"', fecha: '24 sept, 17:28' },
          { texto: 'Roberto Salinas creó la tarea y la asignó a María García', fecha: '22 sept, 09:00' },
        ],
      },
      {
        id: 9,
        titulo: 'Exportar buzones antiguos',
        descripcion: 'Exportar los buzones del dominio anterior en formato compatible.',
        asignado: 'Tomás Vera',
        estado: 'Terminado',
        fecha: '28 sept 2026',
        vencida: false,
        creada: '22 sept 2026, 09:02',
        actualizada: '27 sept, 12:00',
        documentos: [{ nombre: 'resumen_exportacion_buzones.pdf', peso: '96 KB', autor: 'Tomás Vera', fecha: '27 sept, 11:58' }],
        avances: [],
        historial: [
          { texto: 'Tomás Vera cambió el estado de En curso a Terminado', fecha: '27 sept, 12:00' },
          { texto: 'Tomás Vera adjuntó "resumen_exportacion_buzones.pdf"', fecha: '27 sept, 11:58' },
          { texto: 'Roberto Salinas creó la tarea y la asignó a Tomás Vera', fecha: '22 sept, 09:02' },
        ],
      },
      {
        id: 10,
        titulo: 'Importar correos a las cuentas nuevas',
        descripcion: 'Importar los buzones exportados y validar con cada usuario.',
        asignado: 'María García',
        estado: 'Pendiente',
        fecha: '20 oct 2026',
        vencida: false,
        creada: '22 sept 2026, 09:04',
        actualizada: '22 sept, 09:04',
        documentos: [],
        avances: [],
        historial: [{ texto: 'Roberto Salinas creó la tarea y la asignó a María García', fecha: '22 sept, 09:04' }],
      },
    ],
    comentarios: [],
    documentos: [],
    historial: [
      { texto: 'Tomás Vera terminó la tarea "Exportar buzones antiguos"', fecha: '27 sept, 12:00' },
      { texto: 'María García terminó la tarea "Crear cuentas en el nuevo dominio"', fecha: '24 sept, 17:30' },
      { texto: 'Roberto Salinas registró el trabajo', fecha: '22 sept, 08:55' },
    ],
  },
  'TR-006': {
    codigo: 'TR-006',
    titulo: 'Actualizar inventario de equipos',
    tipo: 'Proyecto',
    cliente: 'Sede Central',
    contacto: 'administracion@sedecentral.cl',
    canal: 'Manual',
    responsable: 'Tomás Vera',
    prioridad: 'Media',
    estado: 'Terminado',
    fecha: '25 sept 2026',
    vencido: false,
    descripcion: 'Actualizar el inventario de computadores, periféricos y equipos de la sala de servidores, con etiquetas en cada equipo.',
    tareas: [
      {
        id: 11,
        titulo: 'Registrar equipos de oficina',
        descripcion: 'Registrar computadores y periféricos de todas las oficinas.',
        asignado: 'Tomás Vera',
        estado: 'Terminado',
        fecha: '20 sept 2026',
        vencida: false,
        creada: '15 sept 2026, 09:00',
        actualizada: '19 sept, 18:00',
        documentos: [{ nombre: 'inventario_oficinas.xlsx', peso: '64 KB', autor: 'Tomás Vera', fecha: '19 sept, 17:55' }],
        avances: [],
        historial: [
          { texto: 'Tomás Vera cambió el estado de En curso a Terminado', fecha: '19 sept, 18:00' },
          { texto: 'Tomás Vera adjuntó "inventario_oficinas.xlsx"', fecha: '19 sept, 17:55' },
          { texto: 'Roberto Salinas creó la tarea y la asignó a Tomás Vera', fecha: '15 sept, 09:00' },
        ],
      },
      {
        id: 12,
        titulo: 'Registrar equipos de la sala de servidores',
        descripcion: 'Registrar servidores, switches y UPS con número de serie.',
        asignado: 'Tomás Vera',
        estado: 'Terminado',
        fecha: '24 sept 2026',
        vencida: false,
        creada: '15 sept 2026, 09:02',
        actualizada: '23 sept, 16:40',
        documentos: [
          { nombre: 'inventario_servidores.xlsx', peso: '31 KB', autor: 'Tomás Vera', fecha: '23 sept, 16:35' },
          { nombre: 'fotos_rack_servidores.jpg', peso: '2,1 MB', autor: 'Tomás Vera', fecha: '23 sept, 16:38' },
        ],
        avances: [{ autor: 'Tomás Vera', texto: 'Dos UPS tienen la batería por vencer, lo dejé anotado en la planilla.', fecha: '23 sept, 16:39' }],
        historial: [
          { texto: 'Tomás Vera cambió el estado de En curso a Terminado', fecha: '23 sept, 16:40' },
          { texto: 'Tomás Vera adjuntó "fotos_rack_servidores.jpg"', fecha: '23 sept, 16:38' },
          { texto: 'Roberto Salinas creó la tarea y la asignó a Tomás Vera', fecha: '15 sept, 09:02' },
        ],
      },
      {
        id: 13,
        titulo: 'Etiquetar equipos',
        descripcion: 'Pegar etiquetas con código de inventario en todos los equipos registrados.',
        asignado: 'Tomás Vera',
        estado: 'Terminado',
        fecha: '25 sept 2026',
        vencida: false,
        creada: '15 sept 2026, 09:04',
        actualizada: 'Ayer, 15:20',
        documentos: [{ nombre: 'evidencia_etiquetado.jpg', peso: '1,8 MB', autor: 'Tomás Vera', fecha: 'Ayer, 15:18' }],
        avances: [],
        historial: [
          { texto: 'Tomás Vera cambió el estado de En curso a Terminado', fecha: 'Ayer, 15:20' },
          { texto: 'Tomás Vera adjuntó "evidencia_etiquetado.jpg"', fecha: 'Ayer, 15:18' },
          { texto: 'Roberto Salinas creó la tarea y la asignó a Tomás Vera', fecha: '15 sept, 09:04' },
        ],
      },
    ],
    comentarios: [
      { autor: 'Roberto Salinas', texto: 'Revisé los respaldos. Trabajo cerrado, gracias Tomás.', fecha: 'Ayer, 17:05' },
    ],
    documentos: [],
    historial: [
      { texto: 'Roberto Salinas cambió el estado del trabajo de En curso a Terminado', fecha: 'Ayer, 17:06' },
      { texto: 'Tomás Vera terminó la tarea "Etiquetar equipos"', fecha: 'Ayer, 15:20' },
      { texto: 'Roberto Salinas designó a Tomás Vera como responsable principal', fecha: '15 sept, 08:58' },
      { texto: 'Roberto Salinas registró el trabajo', fecha: '15 sept, 08:55' },
    ],
  },
};
