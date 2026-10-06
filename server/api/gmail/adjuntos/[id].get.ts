import { z } from 'zod'
import { admin, requireUser } from '../../../lib/security'
import { gmailService } from '../../../lib/gmail/service'
export default defineEventHandler(async event=>{
  admin(await requireUser(event))
  const parsed=z.string().uuid().safeParse(getRouterParam(event,'id'))
  if(!parsed.success)throw createError({statusCode:404,statusMessage:'Adjunto no encontrado.'})
  const [file]=await gmailService.attachments([parsed.data])
  setHeader(event,'Content-Type','application/octet-stream')
  setHeader(event,'Cache-Control','no-store')
  setHeader(event,'X-Content-Type-Options','nosniff')
  setHeader(event,'Content-Disposition',"attachment; filename*=UTF-8''"+encodeURIComponent(file!.nombre))
  return file!.contenido
})
