import { db } from '../../lib/database'
import { requireUser } from '../../lib/security'
import { visibleWhere } from '../../lib/serialize'
export default defineEventHandler(async event=>{
  const user=await requireUser(event)
  const file=await db.documento.findFirst({where:{id:getRouterParam(event,'id'),OR:[{autorId:user.id},{trabajo:{is:visibleWhere(user)}}]}})
  if(!file)throw createError({statusCode:404,statusMessage:'Archivo no encontrado o sin acceso'})
  setHeader(event,'Content-Type','application/octet-stream')
  setHeader(event,'X-Content-Type-Options','nosniff')
  setHeader(event,'Content-Disposition',"attachment; filename*=UTF-8''"+encodeURIComponent(file.nombre))
  return Buffer.from(file.contenido)
})
