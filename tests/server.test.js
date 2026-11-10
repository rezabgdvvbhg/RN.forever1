/* آزمون سرور با «سرور DeepSeek ساختگی» محلی — هیچ درخواستی به API واقعی ارسال نمی‌شود */
const http=require('http');let f=0,seen=[];const t=(n,ok,x)=>{console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  ← '+x));if(!ok)f++};
let mode='ok';
const mock=http.createServer((req,res)=>{let b='';req.on('data',d=>b+=d);req.on('end',()=>{seen.push({url:req.url,auth:req.headers.authorization,body:JSON.parse(b||'{}')});
 if(mode==='401'){res.writeHead(401);return res.end('{"error":"secret detail"}')}
 const isSlides=/slide deck/.test(b);const content=mode==='badjson'?'not json':JSON.stringify(isSlides?{title:'T',subtitle:'S',slides:[{type:'content',title:'a',bullets:['x']},{type:'summary',title:'sum',bullets:['y']}]}:{title:'آزمون',questions:[{type:'descriptive',level:'easy',text:'q1',score:3,answer:'a1'},{type:'mcq',level:'medium',text:'q2',options:['1','2','3','4'],score:3,answer:'2'}]});
 res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({choices:[{message:{content},finish_reason:'stop'}]}))})});
const call=(port,method,path,body,headers)=>new Promise(ok=>{const d=body===undefined?null:(typeof body==='string'?body:JSON.stringify(body));const r=http.request({port,host:'127.0.0.1',method,path,headers:{...(d?{'Content-Type':'application/json','Content-Length':Buffer.byteLength(d)}:{}),...headers}},res=>{let x='';res.on('data',c=>x+=c);res.on('end',()=>ok({s:res.statusCode,h:res.headers,b:x}))});r.on('error',e=>ok({s:0,b:String(e),h:{}}));d&&r.write(d);r.end()});
const EXAM={chapters:['sets'],count:2,total:20,types:['descriptive','mcq'],level:'mixed',answers:true,barem:false};
mock.listen(0,'127.0.0.1',async()=>{
 Object.assign(process.env,{DEEPSEEK_API_KEY:'test-fake-key-123',DEEPSEEK_BASE_URL:'http://127.0.0.1:'+mock.address().port,DEEPSEEK_MODEL:'test-model',AI_RATE_PER_HOUR:'1000',TEACHER_ACCESS_CODE:'',SITE_URL:'https://example.test',CONTACT_WEBHOOK_URL:''});
 const srv=require('../server.js');srv.listen(0,'127.0.0.1',async()=>{const P=srv.address().port;let r;
 r=await call(P,'GET','/');t('صفحهٔ اصلی',r.s===200&&r.b.includes('<h1>')&&r.b.includes('rel="canonical" href="https://example.test/"'),r.s);
 t('هدر CSP و nosniff',/default-src 'self'/.test(r.h['content-security-policy']||'')&&r.h['x-content-type-options']==='nosniff');
 for(const p of ['/academy','/videos','/notes','/math-lab','/teachers','/contact','/chapters/sets','/chapters/real-numbers','/chapters/sets/tool','/chapters/volume-area/notes']){r=await call(P,'GET',p);t('مسیر '+p,r.s===200&&r.b.includes('<title>'),r.s)}
 r=await call(P,'GET','/chapters/real-numbers/notes');t('جزوه در HTML خزنده',r.b.includes('<article>')&&r.b.includes('عدد'));
 r=await call(P,'GET','/chapters/nope');t('404 برای فصل ناموجود',r.s===404&&r.b.includes('noindex'));
 r=await call(P,'GET','/robots.txt');t('robots.txt',r.s===200&&r.b.includes('Sitemap: https://example.test/sitemap.xml')&&!/Disallow: \/\s*$/m.test(r.b));
 r=await call(P,'GET','/sitemap.xml');t('sitemap.xml',r.s===200&&(r.b.match(/<loc>/g)||[]).length>=70);
 for(const p of ['/.env','/server.js','/lib/ai.js','/package.json','/tests/server.test.js','/data/../server.js','/%2e%2e/server.js','/assets/../.env','/files/..%2f..%2f.env','/js/%00']){r=await call(P,'GET',p);t('عدم افشا: '+p,r.s!==200||!/DEEPSEEK|require\(/.test(r.b),r.s)}
 for(const [u,ty] of [['/assets/fonts/Hamrah.woff2','font/woff2'],['/assets/fonts/Digi_Craft_Ultra_Black.woff2','font/woff2'],['/assets/fonts/Fedra_arabic.woff2','font/woff2'],['/assets/fonts/Hamrah.ttf','font/ttf'],['/assets/history/m4.webp','image/webp'],['/assets/history/m44.webp','image/webp'],['/files/exams/final.pdf','application/pdf']]){r=await call(P,'GET',u);t('فایل '+u,r.s===200&&r.h['content-type']===ty,r.s+' '+r.h['content-type'])}
 for(const u of ['/data/jarvis/identity.json','/data/jarvis/navigation.json','/data/jarvis/website.json','/data/jarvis/math.json','/js/jarvis.js','/js/jarvis-engine.js','/js/zf-core.js','/js/zf-ui.js','/js/rn3d.js','/js/intro.js','/css/intro.css']){r=await call(P,'GET',u);t('فایل '+u,r.s===200,r.s)}
 r=await call(P,'GET','/');t('مقدمه: دکمهٔ رد شدن و نقش dialog در HTML',/id="intro-skip"/.test(r.b)&&/role="dialog"/.test(r.b)&&/intro-gate\.js/.test(r.b));t('CSP اسکریپت درون‌خطی را مجاز نمی‌کند',!/script-src[^;]*unsafe-inline/.test(r.h['content-security-policy']||''));
 r=await call(P,'GET','/css/fonts.css');t('fonts.css هر سه خانوادهٔ فونت را تعریف می‌کند',/font-family:Hamrah/.test(r.b)&&/font-family:DigiCraft/.test(r.b)&&/font-family:Fedra/.test(r.b));
 for(const p2 of ['/history','/history/euclid','/games','/games/venn-sorter','/games/zero-file','/exams','/exams/final']){r=await call(P,'GET',p2);t('مسیر '+p2,r.s===200&&r.b.includes('<title>'),r.s)}
 r=await call(P,'GET','/history/noether');t('پیش‌رندر زندگی‌نامه برای خزنده',r.b.includes('نوتر')&&r.b.includes('<ul>'));
 r=await call(P,'GET','/data/notes/sets.html');t('جزوه به‌صورت ایستا',r.s===200&&r.b.includes('<h2'));
 r=await call(P,'GET','/api/status');const st=JSON.parse(r.b);t('وضعیت API بدون افشای کلید',r.s===200&&st.ai.configured===true&&!r.b.includes('test-fake-key'));
 // اعتبارسنجی ورودی
 for(const [n,b] of [['تعداد صفر',{...EXAM,count:0}],['فصل نامعتبر',{...EXAM,chapters:['zzz']}],['بدون نوع',{...EXAM,types:[]}],['نمرهٔ منفی',{...EXAM,total:-1}],['فصل‌های زیاد',{...EXAM,chapters:['sets','real-numbers','power-root','volume-area','geometry-reasoning']}]]){r=await call(P,'POST','/api/ai/exam',b);t('ورودی نامعتبر: '+n,r.s===400,r.s+r.b)}
 t('هیچ درخواستی برای ورودی نامعتبر به مدل نرفت',seen.length===0);
 r=await call(P,'POST','/api/ai/exam',EXAM);let j=JSON.parse(r.b);t('تولید آزمون',r.s===200&&j.exam.questions.length===2&&Math.abs(j.exam.questions.reduce((a,q)=>a+q.score,0)-20)<1e-9&&j.warnings.length>=1,r.b.slice(0,200));
 t('کلید و مدل از env به مدل رسید',seen[0]&&seen[0].auth==='Bearer test-fake-key-123'&&seen[0].body.model==='test-model'&&seen[0].url==='/chat/completions'&&seen[0].body.response_format.type==='json_object');
 t('محتوای فصل در درخواست مدل',JSON.stringify(seen[0].body.messages).includes('مجموعه'));
 r=await call(P,'POST','/api/ai/slides',{chapter:'sets',topic:'اجتماع',count:5,style:'simple'});j=JSON.parse(r.b);t('تولید اسلاید',r.s===200&&j.deck.slides.length===2&&j.deck.chapter.includes('مجموعه'),r.b.slice(0,200));
 r=await call(P,'POST','/api/ai/slides',{chapter:'sets',topic:'',count:5});t('اسلاید بدون موضوع رد شد',r.s===400);
 mode='badjson';r=await call(P,'POST','/api/ai/exam',EXAM);t('خروجی غیر JSON مدل → 502',r.s===502&&!r.b.includes('test-fake-key'),r.s);
 mode='401';r=await call(P,'POST','/api/ai/exam',EXAM);t('خطای 401 سرویس بدون افشای جزئیات',r.s===502&&!r.b.includes('secret detail')&&!r.b.includes('test-fake-key'),r.b);mode='ok';
 r=await call(P,'POST','/api/ai/exam','{bad',{});t('JSON خراب → 400',r.s===400,r.s);
 r=await call(P,'POST','/api/ai/exam',{...EXAM,note:'x'.repeat(40000)});t('حجم زیاد → 413',r.s===413,r.s);
 r=await call(P,'POST','/api/ai/exam',EXAM,{Origin:'https://evil.example'});t('مبدأ بیگانه → 403',r.s===403,r.s);
 r=await call(P,'POST','/api/ai/exam','x=1',{'Content-Type':'text/plain'});t('نوع محتوای نادرست → 415',r.s===415||r.s===400,r.s);
 // کد دسترسی
 process.env.TEACHER_ACCESS_CODE='s3cret';r=await call(P,'POST','/api/ai/exam',EXAM);t('بدون کد دسترسی → 401',r.s===401,r.s);
 r=await call(P,'POST','/api/ai/exam',EXAM,{'x-access-code':'wrong'});t('کد غلط → 401',r.s===401);r=await call(P,'POST','/api/ai/exam',EXAM,{'x-access-code':'s3cret'});t('کد درست → 200',r.s===200,r.s);process.env.TEACHER_ACCESS_CODE='';
 // محدودیت نرخ
 process.env.AI_RATE_PER_HOUR='2';const hdr={};let codes=[];for(let i=0;i<4;i++){codes.push((await call(P,'POST','/api/ai/exam',EXAM)).s)}t('محدودیت نرخ → 429',codes.includes(429),codes.join(','));
 process.env.AI_RATE_PER_HOUR='1000';
 // بدون کلید
 const k=process.env.DEEPSEEK_API_KEY;process.env.DEEPSEEK_API_KEY='';r=await call(P,'GET','/api/status');t('بدون کلید: سایت بالا و وضعیت غیرفعال',r.s===200&&JSON.parse(r.b).ai.configured===false);r=await call(P,'POST','/api/ai/exam',EXAM);t('بدون کلید: پیام تنظیمات (503)',r.s===503&&r.b.includes('پیکربندی'));process.env.DEEPSEEK_API_KEY=k;
 r=await call(P,'POST','/api/contact',{name:'ali',message:'سلام دوست من'});t('فرم تماس بدون webhook → 503 صادقانه',r.s===503);
 srv.close();mock.close();console.log(f?`\n${f} آزمون ناموفق`:'\nهمهٔ آزمون‌های سرور موفق بود');process.exit(f?1:0)})});
