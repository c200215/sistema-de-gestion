import { convert } from 'html-to-text'
export const MAX_GMAIL_FILE=5*1024*1024
export const fileAllowed=(name:string,bytes:number)=>bytes<=MAX_GMAIL_FILE && /\.(pdf|docx?|xlsx?|png|jpe?g)$/i.test(name)
const decode=(s:string)=>Buffer.from(s,'base64url').toString('utf8')
function headerWords(value:string){
  return value.replace(/\?=\s+=\?/g,'?==?').replace(/=\?([^?]+)\?([bq])\?([^?]*)\?=/gi,(_,charset,encoding,encoded)=>{
    try{
      const bytes=encoding.toLowerCase()==='b'?Buffer.from(encoded,'base64'):Buffer.from(encoded.replace(/_/g,' ').replace(/=([0-9a-f]{2})/gi,(_:string,h:string)=>String.fromCharCode(parseInt(h,16))),'latin1')
      return new TextDecoder(charset).decode(bytes)
    }catch{return encoded}
  })
}
export function parseGmailMessage(message:any){
  const headers=message.payload?.headers||[]
  const header=(name:string)=>headerWords(String(headers.find((h:any)=>h.name.toLowerCase()===name)?.value||''))
  const from=header('from'),match=from.match(/^(.*?)\s*<([^>]+)>/)
  const correo=(match?.[2]||from).trim().slice(0,254)
  const remitente=(match?.[1]?.replace(/^"|"$/g,'').trim()||correo||'Sin remitente').slice(0,160)
  const plain:string[]=[],html:string[]=[],adjuntos:any[]=[]
  function visit(part:any,path:string){
    const nombre=String(part.filename||'').split(/[\\/]/).pop()!.replace(/[\r\n\x00-\x1f]/g,'').slice(0,255)
    if(nombre){
      const bytes=Number(part.body?.size||0)
      adjuntos.push({parteId:String(part.partId||path).slice(0,100),nombre,mimeType:String(part.mimeType||'application/octet-stream').slice(0,150),bytes,googleAdjuntoId:part.body?.attachmentId||null,contenido:part.body?.data&&fileAllowed(nombre,bytes)?Buffer.from(part.body.data,'base64url'):null})
    }else if(part.body?.data){
      if(part.mimeType==='text/plain')plain.push(decode(part.body.data))
      if(part.mimeType==='text/html')html.push(convert(decode(part.body.data),{wordwrap:false,selectors:[{selector:'img',format:'skip'},{selector:'a',options:{ignoreHref:true}}]}))
    }
    for(const [index,child] of (part.parts||[]).entries())visit(child,path+'.'+index)
  }
  if(message.payload)visit(message.payload,'0')
  const cuerpo=(plain.length?plain.join('\n'):html.join('\n')||message.snippet||'').slice(0,500000)
  const ms=Number(message.internalDate)
  return {remitente,correo,cliente:remitente,asunto:(header('subject')||'(Sin asunto)').slice(0,255),cuerpo,recibido:new Date(Number.isFinite(ms)&&ms>0?ms:Date.now()),adjuntos}
}
