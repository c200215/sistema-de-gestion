import { db } from '../lib/database'
import { requireUser, publicUser } from '../lib/security'
import { visibleWhere, workInclude, serializeWork, codigo, typeText } from '../lib/serialize'
import { fileAllowed } from '../lib/gmail/mime'
export default defineEventHandler(async event=>{
  const user=await requireUser(event)
  const [team,works,messages,reads,notifications,emails]=await Promise.all([
    db.usuario.findMany({where:{eliminado:false},orderBy:{id:'asc'}}),
    db.trabajo.findMany({where:visibleWhere(user),include:workInclude,orderBy:{id:'asc'}}),
    db.mensaje.findMany({where:{OR:[{emisorId:user.id},{receptorId:user.id},{receptorId:null}]},orderBy:{id:'asc'}}),
    db.lectura.findMany({where:{usuarioId:user.id}}),
    db.notificacion.findMany({where:{usuarioId:user.id},orderBy:{id:'desc'},take:100}),
    user.perfil==='Administrador'?db.correo.findMany({orderBy:{recibido:'desc'},include:{adjuntos:{select:{id:true,nombre:true,bytes:true}}}}):Promise.resolve([]),
  ])
  const peers:any[]=[{id:'general',nombre:'Anuncios del equipo',especialidad:'Todo el equipo',general:true},...team.filter(p=>p.id!==user.id)]
  return {usuario:publicUser(user),trabajos:Object.fromEntries(works.map(w=>[codigo(w.id),serializeWork(w)])),equipo:team.map(p=>({...publicUser(p),yo:p.id===user.id})),
    conversaciones:peers.map(p=>{
      const msgs=messages.filter(m=>p.general?m.receptorId===null:m.receptorId!==null&&(m.emisorId===p.id||m.receptorId===p.id))
      const last=reads.find(r=>r.conversacion===String(p.id))?.ultimo||0
      return {id:String(p.id),nombre:p.nombre,iniciales:p.nombre.split(' ').slice(0,2).map((x:string)=>x[0]).join(''),detalle:p.especialidad,general:!!p.general,admin:p.perfil==='Administrador',noLeidos:msgs.some(m=>m.id>last&&m.emisorId!==user.id),mensajes:msgs.map(m=>({mio:m.emisorId===user.id,texto:m.texto,hora:m.creado.toISOString()}))}
    }),
    notificaciones:notifications.map(n=>({id:n.id,icono:'bandera',tono:'teal',titulo:[{texto:n.texto}],detalle:'',fecha:n.creado.toISOString(),enlace:n.enlace,leida:n.leida})),
    correos:emails.map(c=>({...c,fecha:c.recibido.toISOString(),hora:c.recibido.toLocaleTimeString('es-CL',{timeZone:'America/Santiago',hour:'2-digit',minute:'2-digit'}),tipo:typeText(c.tipo),trabajo:c.trabajoId?codigo(c.trabajoId):null,adjuntos:c.adjuntos.map(a=>({id:a.id,nombre:a.nombre,peso:`${Math.ceil(a.bytes/1024)} KB`,permitido:fileAllowed(a.nombre,a.bytes)}))})),
  }
})
