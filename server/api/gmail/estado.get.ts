import { db } from '../../lib/database'
import { admin, requireUser } from '../../lib/security'
import { gmailConfigured } from '../../lib/gmail/config'
export default defineEventHandler(async event=>{
  admin(await requireUser(event))
  setHeader(event,'Cache-Control','no-store')
  const account=await db.gmailCuenta.findUnique({where:{id:1},select:{correo:true,tokensCifrados:true,requiereConexion:true,ultimaSync:true,syncModo:true,operacionHasta:true,ultimoError:true}})
  return {configurado:gmailConfigured(),conectado:!!account?.tokensCifrados&&!account.requiereConexion,correo:account?.correo||null,requiereConexion:account?.requiereConexion||false,ultimaSync:account?.ultimaSync||null,pendiente:!!account?.syncModo,ocupado:!!account?.operacionHasta&&account.operacionHasta>new Date(),error:account?.ultimoError||null}
})
