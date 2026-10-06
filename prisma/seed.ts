import 'dotenv/config'
import { db } from '../server/lib/database'
import { hashPassword } from '../server/lib/security'
const password=process.env.ADMIN_PASSWORD
if(!password || password.length<12) throw Error('Define ADMIN_PASSWORD (minimo 12 caracteres) en .env')
try {
  await db.usuario.upsert({where:{correo:process.env.ADMIN_EMAIL||'admin@ignitelatam.com'},update:{},create:{nombre:process.env.ADMIN_NAME||'Administrador',correo:process.env.ADMIN_EMAIL||'admin@ignitelatam.com',perfil:'Administrador',especialidad:'Coordinación',password_hash:hashPassword(password)}})
  console.log('Administrador preparado. Se conservaron los datos existentes.')
} finally { await db.$disconnect() }
