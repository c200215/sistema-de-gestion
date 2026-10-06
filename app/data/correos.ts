import type { TipoTrabajo } from './trabajos'

export interface AdjuntoCorreo {
  id?: string
  permitido?: boolean
  nombre: string
  peso: string
}

export interface Correo {
  cuentaGoogle?: string | null
  id: number
  remitente: string
  correo: string
  cliente: string
  asunto: string
  cuerpo: string
  fecha: string
  hora: string
  tipo: TipoTrabajo
  adjuntos: AdjuntoCorreo[]
  trabajo: string | null
  descartado: boolean
  leido: boolean
}

export const correosIniciales: Correo[] = [
  {
    id: 1,
    remitente: 'Andrea Muñoz',
    correo: 'contacto@empresaacme.cl',
    cliente: 'Empresa Acme',
    asunto: 'Consulta por renovación de licencias',
    cuerpo: 'Hola Roberto,\n\nNecesitamos renovar las licencias de Office del equipo administrativo antes de fin de mes. Somos 25 usuarios y adjunto el detalle de las licencias actuales.\n\n¿Nos pueden enviar una propuesta con los costos?\n\nSaludos,\nAndrea Muñoz\nEmpresa Acme',
    fecha: 'Hoy, 09:48',
    hora: '09:48',
    tipo: 'Consulta',
    adjuntos: [{ nombre: 'licencias_actuales.xlsx', peso: '48 KB' }],
    trabajo: null,
    descartado: false,
    leido: false,
  },
  {
    id: 2,
    remitente: 'Jorge Paredes',
    correo: 'jefatura.ti@empresabeta.cl',
    cliente: 'Empresa Beta',
    asunto: 'Cotización cambio de switches piso 3',
    cuerpo: 'Estimados,\n\nQueremos reemplazar los switches del piso 3 porque están fallando seguido. Adjunto el plano de la red y fotos del rack.\n\nNecesitamos la cotización idealmente la próxima semana.\n\nGracias,\nJorge Paredes\nJefatura TI, Empresa Beta',
    fecha: 'Hoy, 08:15',
    hora: '08:15',
    tipo: 'Proyecto',
    adjuntos: [
      { nombre: 'plano_red_piso3.pdf', peso: '1,2 MB' },
      { nombre: 'fotos_rack.jpg', peso: '860 KB' },
    ],
    trabajo: null,
    descartado: false,
    leido: false,
  },
  {
    id: 3,
    remitente: 'Camila Soto',
    correo: 'recepcion@sedenorte.cl',
    cliente: 'Sede Norte',
    asunto: 'La impresora de recepción no imprime',
    cuerpo: 'Hola,\n\nDesde ayer en la tarde la impresora de recepción no imprime. Aparece como "sin conexión" en todos los computadores y ya la reiniciamos.\n\nQuedo atenta,\nCamila Soto\nRecepción, Sede Norte',
    fecha: 'Ayer, 16:22',
    hora: 'Ayer',
    tipo: 'Soporte técnico',
    adjuntos: [],
    trabajo: null,
    descartado: false,
    leido: true,
  },
  {
    id: 4,
    remitente: 'Andrea Muñoz',
    correo: 'contacto@empresaacme.cl',
    cliente: 'Empresa Acme',
    asunto: 'Re: Migración base de datos',
    cuerpo: 'Roberto,\n\nConfirmamos que el viernes después de las 19:00 pueden detener el sistema para la migración. Avísennos cuando el respaldo esté listo.\n\nSaludos,\nAndrea Muñoz',
    fecha: 'Ayer, 11:05',
    hora: 'Ayer',
    tipo: 'Proyecto',
    adjuntos: [],
    trabajo: 'TR-001',
    descartado: false,
    leido: true,
  },
  {
    id: 5,
    remitente: 'Mesa de ayuda Sede Norte',
    correo: 'mesa.ayuda@sedenorte.cl',
    cliente: 'Sede Norte',
    asunto: 'VPN sin conexión desde las 9:00',
    cuerpo: 'Buenos días,\n\nDesde las 9:00 ningún usuario de la sede norte puede conectarse a la VPN. Adjuntamos una captura del error que aparece al intentar conectarse.\n\nEs urgente porque el equipo contable no puede trabajar.\n\nMesa de ayuda, Sede Norte',
    fecha: '26 sept, 09:14',
    hora: '26 sept',
    tipo: 'Soporte técnico',
    adjuntos: [{ nombre: 'captura_error_vpn.png', peso: '312 KB' }],
    trabajo: 'TR-002',
    descartado: false,
    leido: true,
  },
  {
    id: 6,
    remitente: 'Ventas SoftPlus',
    correo: 'ofertas@softplus-latam.com',
    cliente: 'SoftPlus',
    asunto: 'Oferta especial en licencias de antivirus',
    cuerpo: 'Estimado cliente,\n\nSolo por este mes, obtén un 30% de descuento en licencias corporativas de antivirus. Responde este correo para recibir una cotización.\n\nEquipo de ventas SoftPlus',
    fecha: '25 sept, 12:40',
    hora: '25 sept',
    tipo: 'Consulta',
    adjuntos: [],
    trabajo: null,
    descartado: true,
    leido: true,
  },
];
