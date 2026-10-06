export function useSesion() {
  return useState<any>('sesion',()=>null)
}
export async function cargarDatos() {
  const request=useRequestFetch()
  const usuario=useSesion()
  const trabajos=useState('trabajos')
  const equipo=useState('equipo')
  const correos=useState('correos')
  const chats={admin:useState('conversaciones-admin'),trabajador:useState('conversaciones-trabajador')}
  const avisos={admin:useState('notificaciones-admin'),trabajador:useState('notificaciones-trabajador')}
  const data=await request<any>('/api/datos')
  usuario.value=data.usuario
  trabajos.value=data.trabajos
  equipo.value=data.equipo
  correos.value=data.correos
  const rol=data.usuario.rol as 'admin'|'trabajador'
  chats[rol].value=data.conversaciones
  avisos[rol].value=data.notificaciones
}
export function useAcciones() {
  const nuxt=useNuxtApp()
  const pendiente=useState('guardando',()=>false)
  const { mostrar }=useAviso()
  async function ejecutar(accion:string,datos:any={},codigo?:string,tareaId?:number):Promise<any> {
    if(pendiente.value) { mostrar('Espera a que termine el guardado'); return null }
    pendiente.value=true
    const version=codigo ? (useTrabajos().trabajos.value[codigo] as any)?.version : undefined
    try {
      const result=await $fetch('/api/acciones',{method:'POST',body:{accion,datos,codigo,tareaId,version}})
      await nuxt.runWithContext(()=>cargarDatos())
      return result
    } catch(error:any) {
      mostrar(error.data?.statusMessage || 'No se pudo guardar. Revisa la conexión e intenta nuevamente.')
      if(error.statusCode===409) await nuxt.runWithContext(()=>cargarDatos())
      return null
    } finally { pendiente.value=false }
  }
  return { ejecutar,pendiente }
}
export function useAdjuntos() {
  const { ejecutar }=useAcciones()
  const { mostrar }=useAviso()
  async function subir(files:File[],codigo?:string,tareaId?:number) {
    const uploaded:any[]=[]
    try {
      for(const file of files) {
        const body=new FormData(); body.append('archivo',file)
        uploaded.push(await $fetch('/api/documentos',{method:'POST',body}))
      }
      if(codigo && uploaded.length) {
        const ok=await ejecutar('adjuntar',{ids:uploaded.map(d=>d.id)},codigo,tareaId)
        if(!ok) return []
        mostrar('Documentos guardados')
      }
      return uploaded
    } catch(error:any) { mostrar(error.data?.statusMessage || 'No se pudo subir el archivo'); return [] }
  }
  return {subir}
}
