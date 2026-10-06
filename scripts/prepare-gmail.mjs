import { readFileSync,writeFileSync,existsSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
const path=new URL('../.env',import.meta.url)
let content=existsSync(path)?readFileSync(path,'utf8'):readFileSync(new URL('../.env.example',import.meta.url),'utf8')
for(const [name,value] of Object.entries({GOOGLE_CLIENT_ID:'',GOOGLE_CLIENT_SECRET:'',GOOGLE_REDIRECT_URI:'http://localhost:3000/api/gmail/callback',GOOGLE_GMAIL_ADDRESS:'test.trabajo.integracion@gmail.com',GMAIL_TOKEN_KEY:randomBytes(32).toString('hex')})){
  const line=new RegExp('^'+name+'=(.*)$','m'),match=content.match(line)
  if(!match)content+='\n'+name+'='+value
  else if(name==='GMAIL_TOKEN_KEY'&&!match[1].trim())content=content.replace(line,name+'='+value)
}
writeFileSync(path,content.trimEnd()+'\n')
console.log('Configuración de Gmail preparada en .env. Añade las credenciales de Google Cloud; la clave de cifrado no se muestra.')
