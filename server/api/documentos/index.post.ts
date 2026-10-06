import { db } from '../../lib/database'
import { requireUser, sameOrigin } from '../../lib/security'
export default defineEventHandler(async event=>{
  sameOrigin(event)
  const user=await requireUser(event)
  if(Number(getHeader(event,'content-length')||0)>6*1024*1024)throw createError({statusCode:413,statusMessage:'Maximo 5 MB por archivo'})
  const parts=await readMultipartFormData(event)
  const file=parts?.find(p=>p.name==='archivo'&&p.filename)
  if(!file||file.data.length>5*1024*1024||!/\.(pdf|docx?|xlsx?|png|jpe?g)$/i.test(file.filename!))throw createError({statusCode:400,statusMessage:'Archivo no permitido (maximo 5 MB)'})
  const nombre=file.filename!.split(/[\\/]/).pop()!.replace(/[\r\n]/g,'').slice(0,255)
  const d=await db.documento.create({data:{autorId:user.id,nombre,contenido:file.data,bytes:file.data.length},select:{id:true,nombre:true,bytes:true,fecha:true}})
  return {id:d.id,nombre:d.nombre,peso:Math.ceil(d.bytes/1024)+' KB',autor:user.nombre,fecha:d.fecha.toISOString()}
})
