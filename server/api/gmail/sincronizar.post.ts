import { admin, requireUser, sameOrigin } from '../../lib/security'
import { gmailService } from '../../lib/gmail/service'
export default defineEventHandler(async event=>{
  sameOrigin(event);admin(await requireUser(event))
  return gmailService.sync()
})
