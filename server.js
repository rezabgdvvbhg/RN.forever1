/* سرور رادیکال RN — بدون وابستگی خارجی: فایل‌های ایستا + مسیرهای تمیز + API امن هوش مصنوعی */
const http=require('http'),fs=require('fs'),path=require('path'),zlib=require('zlib'),crypto=require('crypto');
const ROOT=__dirname;
(function loadEnv(){try{fs.readFileSync(path.join(ROOT,'.env'),'utf8').split(/\r?\n/).forEach(l=>{const m=/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(l);if(m&&!l.trim().startsWith('#')&&process.env[m[1]]===undefined)process.env[m[1]]=m[2].replace(/^["']|["']$/g,'')})}catch(e){}})();
const site=require('./lib/site.js'),ai=require('./lib/ai.js');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation','.mp3':'audio/mpeg','.ogg':'audio/ogg','.mp4':'video/mp4','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
const PUBLIC_DIRS=['assets','css','js','data','files'];
const CSP="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; media-src 'self' https:; frame-src https://www.youtube-nocookie.com https://www.aparat.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
const SEC={'Content-Security-Policy':CSP,'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Cross-Origin-Opener-Policy':'same-origin'};
const TEMPLATE=()=>fs.readFileSync(path.join(ROOT,'index.html'),'utf8');

/* --- محدودسازی مصرف --- */
const hits=new Map();let day={d:new Date().toDateString(),n:0};
const num=(v,d)=>Number.isFinite(+v)&&+v>0?+v:d;
function allowAI(ip){const now=Date.now(),lim=num(process.env.AI_RATE_PER_HOUR,20),dl=num(process.env.AI_DAILY_LIMIT,300);
 if(day.d!==new Date().toDateString())day={d:new Date().toDateString(),n:0};if(day.n>=dl)return'سقف مصرف روزانهٔ سرویس هوش مصنوعی پر شده است؛ فردا دوباره تلاش کنید.';
 const a=(hits.get(ip)||[]).filter(t=>now-t<3600e3);if(a.length>=lim)return'تعداد درخواست‌های شما در یک ساعت از حد مجاز گذشته است.';a.push(now);hits.set(ip,a);day.n++;
 if(hits.size>5000)for(const[k,v]of hits)if(!v.some(t=>now-t<3600e3))hits.delete(k);return null}
const clientIp=req=>process.env.TRUST_PROXY==='1'&&req.headers['x-forwarded-for']?String(req.headers['x-forwarded-for']).split(',')[0].trim():req.socket.remoteAddress||'?';
const safeEq=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)};

function send(req,res,status,body,type,extra){const h={...SEC,'Content-Type':type,...extra};let buf=Buffer.isBuffer(body)?body:Buffer.from(body);
 if(/^(text|application\/(json|xml|javascript))|svg/.test(type)&&buf.length>1024&&/gzip/.test(req.headers['accept-encoding']||'')){buf=zlib.gzipSync(buf);h['Content-Encoding']='gzip';h['Vary']='Accept-Encoding'}
 h['Content-Length']=buf.length;res.writeHead(status,h);res.end(req.method==='HEAD'?undefined:buf)}
const jsonRes=(req,res,s,o)=>send(req,res,s,JSON.stringify(o),'application/json; charset=utf-8',{'Cache-Control':'no-store'});

function readBody(req,max){return new Promise((ok,no)=>{let n=0,over=false;const c=[];req.on('data',d=>{n+=d.length;if(over)return;if(n>max){over=true;c.length=0;no(Object.assign(new Error('big'),{status:413}))}else c.push(d)});req.on('end',()=>{if(over)return;try{ok(JSON.parse(Buffer.concat(c).toString('utf8')||'{}'))}catch(e){no(Object.assign(new Error('bad'),{status:400}))}});req.on('error',no)})}

async function api(req,res,p){
 if(p==='/api/status'&&req.method==='GET')return jsonRes(req,res,200,{ai:{configured:ai.configured(),accessCodeRequired:!!process.env.TEACHER_ACCESS_CODE},contact:{configured:!!process.env.CONTACT_WEBHOOK_URL},contactInfo:site.siteInfo().contact});
 if(req.method!=='POST')return jsonRes(req,res,404,{error:'یافت نشد'});
 const origin=req.headers.origin;if(origin){try{if(new URL(origin).host!==req.headers.host)return jsonRes(req,res,403,{error:'درخواست از مبدأ نامعتبر'})}catch(e){return jsonRes(req,res,403,{error:'مبدأ نامعتبر'})}}
 if(!/application\/json/.test(req.headers['content-type']||''))return jsonRes(req,res,415,{error:'قالب درخواست باید JSON باشد'});
 let body;try{body=await readBody(req,p==='/api/contact'?8192:16384)}catch(e){return jsonRes(req,res,e.status||400,{error:e.status===413?'حجم درخواست زیاد است':'JSON نامعتبر'})}
 if(p==='/api/contact'){const url=process.env.CONTACT_WEBHOOK_URL;if(!url)return jsonRes(req,res,503,{error:'ارسال پیام هنوز پیکربندی نشده است.'});
  const m={name:String(body.name||'').trim().slice(0,100),email:String(body.email||'').trim().slice(0,150),message:String(body.message||'').trim().slice(0,3000)};
  if(!m.name||m.message.length<5||(m.email&&!/^\S+@\S+\.\S+$/.test(m.email)))return jsonRes(req,res,400,{error:'نام و پیام (حداقل ۵ نویسه) لازم است و ایمیل باید معتبر باشد.'});
  const lim=allowAI('c:'+clientIp(req));if(lim)return jsonRes(req,res,429,{error:lim});
  try{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...m,at:new Date().toISOString()}),signal:AbortSignal.timeout(15000)});if(!r.ok)throw 0;return jsonRes(req,res,200,{ok:true})}catch(e){return jsonRes(req,res,502,{error:'ارسال پیام ناموفق بود؛ بعداً تلاش کنید.'})}}
 if(p==='/api/ai/exam'||p==='/api/ai/slides'){
  if(!ai.configured())return jsonRes(req,res,503,{error:'سرویس هوش مصنوعی هنوز پیکربندی نشده است (کلید API روی سرور تنظیم نشده).',code:'not_configured'});
  const code=process.env.TEACHER_ACCESS_CODE;if(code&&!safeEq(req.headers['x-access-code']||'',code))return jsonRes(req,res,401,{error:'کد دسترسی معلم نادرست یا وارد‌نشده است.',code:'access'});
  const lim=allowAI(clientIp(req));if(lim)return jsonRes(req,res,429,{error:lim});
  try{return jsonRes(req,res,200,await(p.endsWith('exam')?ai.genExam(body):ai.genSlides(body)))}
  catch(e){if(!(e instanceof ai.AIError))console.error('[ai] unexpected:',e&&e.message);return jsonRes(req,res,e instanceof ai.AIError?e.status:500,{error:e instanceof ai.AIError?e.message:'خطای داخلی سرور'})}}
 return jsonRes(req,res,404,{error:'یافت نشد'})}

function serveStatic(req,res,p){let rel;try{rel=decodeURIComponent(p)}catch(e){return false}
 if(rel.includes('\0')||rel.includes('\\'))return false;const parts=rel.split('/').filter(Boolean);if(!parts.length||!PUBLIC_DIRS.includes(parts[0])||parts.some(s=>s.startsWith('.')||s==='..'))return false;
 const f=path.join(ROOT,...parts);if(!f.startsWith(ROOT+path.sep))return false;let st;try{st=fs.statSync(f)}catch(e){return false}if(!st.isFile())return false;
 const ext=path.extname(f).toLowerCase(),type=MIME[ext]||'application/octet-stream';const cache=parts[0]==='data'?'no-cache':'public, max-age=86400';
 const extra={'Cache-Control':cache,'Last-Modified':st.mtime.toUTCString()};
 if(['.mp4','.mp3','.ogg'].includes(ext)){res.writeHead(200,{...SEC,'Content-Type':type,'Content-Length':st.size,'Accept-Ranges':'bytes',...extra});if(req.method==='HEAD')return res.end(),true;fs.createReadStream(f).pipe(res);return true}
 if(ext==='.docx'||ext==='.pptx'||ext==='.pdf')extra['Content-Disposition']='attachment; filename*=UTF-8\'\''+encodeURIComponent(path.basename(f));
 send(req,res,200,fs.readFileSync(f),type,extra);return true}

const server=http.createServer(async(req,res)=>{try{
 if(!['GET','HEAD','POST'].includes(req.method))return send(req,res,405,'Method Not Allowed','text/plain');
 const u=new URL(req.url,'http://x');let p=u.pathname;
 if(p.startsWith('/api/'))return await api(req,res,p);
 if(p==='/robots.txt')return send(req,res,200,site.robots(),'text/plain; charset=utf-8');
 if(p==='/sitemap.xml')return send(req,res,200,site.sitemap(),'application/xml; charset=utf-8');
 if(serveStatic(req,res,p))return;
 if(p.length>1&&p.endsWith('/')){res.writeHead(301,{Location:p.replace(/\/+$/,'')+u.search});return res.end()}
 const r=site.match(p);const tpl=TEMPLATE();
 if(r)return send(req,res,200,site.render(r,tpl),'text/html; charset=utf-8',{'Cache-Control':'no-cache'});
 send(req,res,404,site.render({path:p,title:'صفحه پیدا نشد | رادیکال RN',desc:'این نشانی وجود ندارد.',h1:'صفحه پیدا نشد',kind:'page'},tpl).replace('<head>','<head><meta name="robots" content="noindex">'),'text/html; charset=utf-8')
}catch(e){console.error('[server]',e&&e.message);if(!res.headersSent)send(req,res,500,'Internal Server Error','text/plain')}});
if(require.main===module){const port=+process.env.PORT||8080,host=process.env.HOST||'127.0.0.1';server.listen(port,host,()=>console.log(`رادیکال RN → http://${host==='0.0.0.0'?'localhost':host}:${port}  |  هوش مصنوعی: ${ai.configured()?'فعال ('+ai.cfg().model+')':'غیرفعال (کلید تنظیم نشده)'}`))}
module.exports=server;
