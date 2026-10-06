import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto'
export function seal(value:unknown,key:string) {
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',Buffer.from(key,'hex'),iv)
  cipher.setAAD(Buffer.from('mesa-gmail-v1'))
  const encrypted=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()])
  return ['v1',iv.toString('base64url'),cipher.getAuthTag().toString('base64url'),encrypted.toString('base64url')].join('.')
}
export function unseal<T=any>(value:string,key:string):T {
  const [version,iv,tag,encrypted]=value.split('.')
  if(version!=='v1'||!iv||!tag||!encrypted)throw Error('Formato de credencial no válido')
  const decipher=createDecipheriv('aes-256-gcm',Buffer.from(key,'hex'),Buffer.from(iv,'base64url'))
  decipher.setAAD(Buffer.from('mesa-gmail-v1'));decipher.setAuthTag(Buffer.from(tag,'base64url'))
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(encrypted,'base64url')),decipher.final()]).toString('utf8'))
}
