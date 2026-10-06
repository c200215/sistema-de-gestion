export const codigo=(id:number)=>`TR-${String(id).padStart(3,'0')}`
export const idCodigo=(value:string)=>/^TR-\d+$/.test(value)?Number(value.slice(3)):0
export const dateText=(d:Date|null)=>d?d.toISOString().slice(0,10):'Sin fecha'
export const stateText=(v:string)=>v==='EnCurso'?'En curso':v
export const typeText=(v:string)=>v==='SoporteTecnico'?'Soporte técnico':v
const late=(d:Date|null,state:string)=>!!d && state!=='Terminado' && dateText(d)<new Date().toLocaleDateString('en-CA',{timeZone:'America/Santiago'})
const entry=(c:any)=>({autor:c.autor.nombre,texto:c.texto,fecha:c.fecha.toISOString()})
export const fileSelect={id:true,nombre:true,bytes:true,fecha:true,autor:{select:{nombre:true}}} as const
export const workInclude={responsable:true,tareas:{orderBy:{id:'asc'},include:{asignado:true,avances:{include:{autor:true},orderBy:{id:'desc'}},documentos:{select:fileSelect},historial:{orderBy:{id:'desc'}}}},comentarios:{where:{tareaId:null},include:{autor:true},orderBy:{id:'desc'}},documentos:{where:{tareaId:null},select:fileSelect},historial:{orderBy:{id:'desc'}}} as const
export const visibleWhere=(user:any)=>user.perfil==='Administrador'?{}:{OR:[{responsableId:user.id},{tareas:{some:{asignadoId:user.id}}}]}
const file=(d:any)=>({id:d.id,nombre:d.nombre,peso:`${Math.ceil(d.bytes/1024)} KB`,autor:d.autor.nombre,fecha:d.fecha.toISOString()})
export function serializeWork(w:any) {
  return {codigo:codigo(w.id),titulo:w.titulo,descripcion:w.descripcion,tipo:typeText(w.tipo),cliente:w.cliente,contacto:w.contacto,canal:w.canal,responsable:w.responsable?.nombre||'Sin asignar',prioridad:w.prioridad,estado:stateText(w.estado),fecha:dateText(w.fecha),vencido:late(w.fecha,w.estado),version:w.version,
    comentarios:w.comentarios.map(entry),documentos:w.documentos.map(file),historial:w.historial.map((h:any)=>({texto:h.texto,fecha:h.fecha.toISOString()})),
    tareas:w.tareas.map((t:any)=>({id:t.id,titulo:t.titulo,descripcion:t.descripcion,asignado:t.asignado.nombre,estado:stateText(t.estado),fecha:dateText(t.fecha),vencida:late(t.fecha,t.estado),creada:t.creada.toISOString(),actualizada:t.actualizada.toISOString(),terminada:t.terminada?.toISOString()||null,orden:t.orden,documentos:t.documentos.map(file),avances:t.avances.map(entry),historial:t.historial.map((h:any)=>({texto:h.texto,fecha:h.fecha.toISOString()}))})),
  }
}
