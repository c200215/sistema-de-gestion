import { createError } from 'h3'
export const GMAIL_SCOPE='https://www.googleapis.com/auth/gmail.readonly'
export function gmailConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI && /^[a-fA-F0-9]{64}$/.test(process.env.GMAIL_TOKEN_KEY||''))
}
export function gmailConfig() {
  if(!gmailConfigured()) throw createError({statusCode:503,statusMessage:'Falta configurar la conexión con Google en el servidor.'})
  const redirect=new URL(process.env.GOOGLE_REDIRECT_URI!)
  if(redirect.protocol!=='https:' && !(redirect.protocol==='http:' && ['localhost','127.0.0.1'].includes(redirect.hostname))) throw createError({statusCode:503,statusMessage:'La dirección de retorno de Google no es válida.'})
  return {clientId:process.env.GOOGLE_CLIENT_ID!,clientSecret:process.env.GOOGLE_CLIENT_SECRET!,redirectUri:redirect.href,key:process.env.GMAIL_TOKEN_KEY!}
}
