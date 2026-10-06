import { PrismaClient } from '../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
const globalDb=globalThis as unknown as { mesaPrisma?: PrismaClient }
function createClient() {
  const url=new URL(process.env.DATABASE_URL || 'mysql://root@127.0.0.1:3306/mesa_gestion')
  const adapter=new PrismaMariaDb({host:url.hostname,port:Number(url.port||3306),user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),database:decodeURIComponent(url.pathname.slice(1)),connectionLimit:5})
  return new PrismaClient({adapter})
}
export const db=globalDb.mesaPrisma ?? createClient()
if(process.env.NODE_ENV!=='production') globalDb.mesaPrisma=db
