import { z } from 'zod'
import { db } from '../lib/database'
import { admin, hashPassword, requireUser, sameOrigin } from '../lib/security'
import { allowed, estado, taskInput, text, workInput } from '../lib/work'
import { codigo, idCodigo, visibleWhere } from '../lib/serialize'
import { gmailService } from '../lib/gmail/service'
const date=(s:string)=>{
  if(!s||s==='Sin fecha')return null
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw createError({statusCode:400,statusMessage:'Fecha invalida'})
  return new Date(s+'T00:00:00.000Z')
}
export default defineEventHandler(async event=>{
  sameOrigin(event)
  const user=await requireUser(event)
  try {
    const body=z.object({accion:z.string().max(50),datos:z.any().optional(),codigo:z.string().max(30).optional(),version:z.number().int().optional(),tareaId:z.number().int().optional()}).parse(await readBody(event))
    const {accion,datos}=body
    const correoOrigen=accion==='crear-trabajo'&&datos?.correoId?z.number().int().positive().parse(datos.correoId):null
    let adjuntosOrigen:Awaited<ReturnType<typeof gmailService.attachments>>=[]
    if(correoOrigen){
      admin(user)
      // Fetch remote attachments before the transaction: a network failure never leaves a half-created job.
      const source=await db.correo.findUnique({where:{id:correoOrigen}})
      if(!source)throw createError({statusCode:404,statusMessage:'Correo no encontrado.'})
      if(source.trabajoId)throw createError({statusCode:409,statusMessage:'Este correo ya está vinculado a un trabajo.'})
      const ids=z.array(z.string().uuid()).max(20).parse(datos.adjuntosCorreoIds||[])
      adjuntosOrigen=await gmailService.attachments(ids,correoOrigen)
    }
    return await db.$transaction(async tx=>{
      if(accion==='eliminar-persona'){
        admin(user)
        const {id}=z.object({id:z.number().int().positive()}).parse(datos)
        if(id===user.id)throw createError({statusCode:403,statusMessage:'No puedes eliminar tu propia cuenta'})
        const removed=await tx.usuario.updateMany({where:{id,perfil:'Trabajador',eliminado:false},data:{activo:false,eliminado:true}})
        if(!removed.count)throw createError({statusCode:404,statusMessage:'Trabajador no encontrado o ya eliminado'})
        await tx.sesion.deleteMany({where:{usuarioId:id}})
        return {ok:true}
      }
      if(accion==='persona'){
        admin(user)
        const p=z.object({id:z.number().int().positive().optional(),nombre:text.max(160),correo:z.string().email().max(254),perfil:z.enum(['Administrador','Trabajador']),especialidad:text.max(100),clave:z.string().min(8).max(128).optional(),activo:z.boolean().optional()}).parse(datos)
        if(p.id===user.id)allowed(p.activo!==false&&p.perfil==='Administrador')
        const old=p.id?await tx.usuario.findUnique({where:{id:p.id}}):null
        if(p.id&&(!old||old.eliminado))throw createError({statusCode:404,statusMessage:'Persona no encontrada'})
        const data={nombre:p.nombre,correo:p.correo.toLowerCase(),perfil:p.perfil,especialidad:p.especialidad,activo:p.activo??old?.activo??true}
        if(old){
          await tx.usuario.update({where:{id:old.id},data:{...data,...(p.clave?{password_hash:hashPassword(p.clave)}:{})}})
          if(p.clave||p.activo===false||p.perfil!==old.perfil)await tx.sesion.deleteMany({where:{usuarioId:old.id}})
        }else{
          if(!p.clave)throw createError({statusCode:400,statusMessage:'Falta la clave inicial'})
          await tx.usuario.create({data:{...data,password_hash:hashPassword(p.clave)}})
        }
        return {ok:true}
      }
      if(accion==='mensaje'){
        const p=z.object({destino:z.string().max(30),texto:text}).parse(datos)
        const receptorId=p.destino==='general'?null:Number(p.destino)
        if(receptorId===null)admin(user)
        else allowed(Number.isInteger(receptorId)&&receptorId!==user.id&&!!await tx.usuario.findFirst({where:{id:receptorId,activo:true,eliminado:false}}))
        await tx.mensaje.create({data:{emisorId:user.id,receptorId,texto:p.texto}})
        return {ok:true}
      }
      if(accion==='leer-chat'){
        const id=z.string().max(30).parse(datos.id)
        const last=await tx.mensaje.aggregate({_max:{id:true},where:id==='general'?{receptorId:null}:{OR:[{emisorId:user.id,receptorId:Number(id)},{emisorId:Number(id),receptorId:user.id}]}})
        await tx.lectura.upsert({where:{usuarioId_conversacion:{usuarioId:user.id,conversacion:id}},create:{usuarioId:user.id,conversacion:id,ultimo:last._max.id||0},update:{ultimo:last._max.id||0}})
        return {ok:true}
      }
      if(accion==='leer-notificaciones'){await tx.notificacion.updateMany({where:{usuarioId:user.id},data:{leida:true}});return {ok:true}}
      if(accion==='correo'){
        admin(user)
        const p=z.object({id:z.number().int(),leido:z.boolean().optional(),descartado:z.boolean().optional(),trabajo:z.string().optional()}).parse(datos)
        await tx.correo.update({where:{id:p.id},data:{leido:p.leido,descartado:p.descartado,trabajoId:p.trabajo?idCodigo(p.trabajo):undefined}})
        return {ok:true}
      }
      const worker=async(name:string,nullable=false)=>{
        if(nullable&&name==='Sin asignar')return null
        const p=await tx.usuario.findFirst({where:{nombre:name,activo:true,eliminado:false,perfil:'Trabajador'}})
        allowed(!!p);return p!.id
      }
      const workData=async(input:any)=>{
        const p=workInput.parse(input)
        const {responsable,fecha,tipo,...rest}=p
        return {...rest,responsableId:await worker(responsable,true),fecha:date(fecha),tipo:tipo==='Soporte técnico'?'SoporteTecnico' as const:tipo}
      }
      let work:any
      if(accion==='crear-trabajo'){
        admin(user)
        work=await tx.trabajo.create({data:await workData(datos)})
        if(correoOrigen){
          const linked=await tx.correo.updateMany({where:{id:correoOrigen,trabajoId:null},data:{trabajoId:work.id,descartado:false}})
          if(linked.count!==1)throw createError({statusCode:409,statusMessage:'Este correo ya fue vinculado. Actualiza la bandeja.'})
          for(const file of adjuntosOrigen)await tx.documento.create({data:{trabajoId:work.id,autorId:user.id,nombre:file.nombre,contenido:file.contenido,bytes:file.contenido.length}})
        }
      }else{
        work=await tx.trabajo.findFirst({where:{id:idCodigo(body.codigo||''),...visibleWhere(user)},include:{tareas:true}})
        if(!work)throw createError({statusCode:404,statusMessage:'Trabajo no encontrado o sin acceso'})
        if(body.version===undefined)throw createError({statusCode:400,statusMessage:'Falta la version del trabajo'})
        const locked=await tx.trabajo.updateMany({where:{id:work.id,version:body.version},data:{version:{increment:1}}})
        if(!locked.count)throw createError({statusCode:409,statusMessage:'Otra persona actualizo este trabajo. Se recargaron los datos; vuelve a intentar.'})
      }
      const task=body.tareaId?await tx.tarea.findFirst({where:{id:body.tareaId,trabajoId:work.id}}):null
      let detail=accion.replaceAll('-',' ')
      switch(accion){
        case 'crear-trabajo':break
        case 'editar-trabajo':admin(user);await tx.trabajo.update({where:{id:work.id},data:await workData(datos)});break
        case 'estado-trabajo':{
          admin(user);const state=estado.parse(datos.estado)
          await tx.trabajo.update({where:{id:work.id},data:{estado:state==='En curso'?'EnCurso':state}});detail+=': '+state;break
        }
        case 'crear-tarea':{
          admin(user);const p=taskInput.parse(datos)
          await tx.tarea.create({data:{trabajoId:work.id,titulo:p.titulo,descripcion:p.descripcion,asignadoId:(await worker(p.asignado))!,fecha:date(p.fecha)}});detail+=': '+p.titulo;break
        }
        case 'estado-tarea':{
          allowed(!!task&&task.asignadoId===user.id);const state=estado.parse(datos.estado)
          await tx.tarea.update({where:{id:task!.id},data:{estado:state==='En curso'?'EnCurso':state,terminada:state==='Terminado'?(task!.terminada||new Date()):null}});detail+=': '+state;break
        }
        case 'avance':allowed(!!task&&(user.perfil==='Administrador'||task.asignadoId===user.id));
        case 'comentario':{
          await tx.comentario.create({data:{trabajoId:work.id,tareaId:accion==='avance'?task!.id:null,autorId:user.id,texto:text.parse(datos.texto)}});break
        }
        case 'adjuntar':{
          if(body.tareaId)allowed(!!task&&task.asignadoId===user.id)
          const ids=z.array(z.string().uuid()).min(1).max(20).parse(datos.ids)
          const count=await tx.documento.count({where:{id:{in:ids},autorId:user.id,trabajoId:null,tareaId:null}})
          allowed(count===new Set(ids).size)
          await tx.documento.updateMany({where:{id:{in:ids},autorId:user.id,trabajoId:null},data:{trabajoId:work.id,tareaId:task?.id??null}});break
        }
        case 'quitar-documento':{
          allowed(!!task&&task.asignadoId===user.id)
          await tx.documento.deleteMany({where:{id:z.string().uuid().parse(datos.id),tareaId:task!.id,trabajoId:work.id}});break
        }
        default:throw createError({statusCode:400,statusMessage:'Operacion desconocida'})
      }
      await tx.historial.create({data:{trabajoId:work.id,tareaId:task?.id??null,autorId:user.id,texto:user.nombre+': '+detail}})
      const recipients=await tx.usuario.findMany({where:{activo:true,eliminado:false,id:{not:user.id},OR:[{perfil:'Administrador'},{trabajos:{some:{id:work.id}}},{tareas:{some:{trabajoId:work.id}}}]}})
      if(recipients.length)await tx.notificacion.createMany({data:recipients.map(p=>({usuarioId:p.id,texto:user.nombre+' actualizó '+codigo(work.id)+': '+detail,enlace:'/'+(p.perfil==='Administrador'?'admin':'trabajador')+'/trabajos/'+codigo(work.id)}))})
      return {codigo:codigo(work.id)}
    })
  }catch(error:any){
    if(error instanceof z.ZodError)throw createError({statusCode:400,statusMessage:'Revisa los campos del formulario'})
    if(error.code==='P2002')throw createError({statusCode:409,statusMessage:'Ese nombre o correo ya existe'})
    if(error.code==='P2025')throw createError({statusCode:404,statusMessage:'Registro no encontrado'})
    throw error
  }
})
