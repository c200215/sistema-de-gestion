import { OAuth2Client, CodeChallengeMethod, type Credentials } from 'google-auth-library'
import { GMAIL_SCOPE, gmailConfig } from './config'

export class GmailError extends Error {
  constructor(public kind:'reauthorize'|'quota'|'unavailable'|'missing'|'scope',public status=502){super(kind)}
}
function classify(error:any):never {
  const status=Number(error.response?.status||error.status||0)
  const code=error.response?.data?.error
  if(code==='invalid_grant'||status===401)throw new GmailError('reauthorize',401)
  if(status===404)throw new GmailError('missing',404)
  if(status===429||code?.errors?.some((x:any)=>['rateLimitExceeded','userRateLimitExceeded'].includes(x.reason)))throw new GmailError('quota',429)
  if(status===403)throw new GmailError('scope',403)
  throw new GmailError('unavailable',status===400?400:502)
}
function client(){const c=gmailConfig();return new OAuth2Client(c.clientId,c.clientSecret,c.redirectUri)}
export const googleProvider={
  authUrl(state:string,challenge:string){return client().generateAuthUrl({access_type:'offline',prompt:'consent select_account',scope:[GMAIL_SCOPE],login_hint:process.env.GOOGLE_GMAIL_ADDRESS||undefined,state,code_challenge:challenge,code_challenge_method:CodeChallengeMethod.S256})},
  async exchange(code:string,verifier:string){try{return (await client().getToken({code,codeVerifier:verifier})).tokens}catch(e){return classify(e)}},
  async refresh(tokens:Credentials){try{const c=client();c.setCredentials(tokens);return (await c.refreshAccessToken()).credentials}catch(e){return classify(e)}},
  async revoke(tokens:Credentials){try{await client().revokeToken(tokens.refresh_token||tokens.access_token!)}catch(e:any){if(e.response?.status!==400)classify(e)}},
  async get<T=any>(tokens:Credentials,path:string,params:Record<string,string>={}):Promise<T>{
    // Callers pass only known API paths and encoded Gmail IDs; no user-controlled URLs.
    try{
      const c=client();c.setCredentials({access_token:tokens.access_token,expiry_date:tokens.expiry_date})
      return (await c.request<T>({url:'https://gmail.googleapis.com/gmail/v1/users/me'+path,params,timeout:20000,retry:true,retryConfig:{retry:2}})).data
    }catch(e){return classify(e)}
  },
}
export type GmailProvider=typeof googleProvider
