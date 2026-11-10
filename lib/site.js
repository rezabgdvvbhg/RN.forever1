/* جدول مسیرها، متای SEO و پیش‌رندر HTML — مشترک بین server.js و scripts/build.js */
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const CH=require('../js/chapters.js');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const read=(f,d)=>{try{return fs.readFileSync(path.join(ROOT,f),'utf8')}catch(e){return d}};
const json=(f,d)=>{try{return JSON.parse(read(f,''))}catch(e){return d}};
const siteInfo=()=>json('data/site.json',{name:'رادیکال RN',creator:'رضا علیمحمدی'});
const videos=()=>{const v=json('data/videos.json',[]);return Array.isArray(v)?v.filter(x=>x&&/^[a-z0-9-]{1,80}$/.test(x.id||'')&&x.title):[]};
const history=()=>{const v=json('data/history.json',[]);return Array.isArray(v)?v.filter(x=>x&&/^[a-z]+$/.test(x.slug||'')).sort((a,b)=>a.order-b.order):[]};
const GAMES_META=[['zero-file','پروندهٔ صفر (ماجراجویی)','real-numbers'],['venn-sorter','دسته‌بند نمودار ون','sets'],['number-line','جای عدد روی محور','real-numbers'],['proof-puzzle','پازل برهان','geometry-reasoning'],['power-match','جفت‌یابی توان و رادیکال','power-root'],['identity-rush','مسابقهٔ اتحادها','algebraic-expressions'],['line-stars','خط از میان ستاره‌ها','linear-equations'],['forbidden-values','شکار مقدارهای ممنوع','rational-expressions'],['volume-tuner','تنظیم‌کنندهٔ حجم','volume-area']];
const exams=()=>{const v=json('data/exams.json',[]);return Array.isArray(v)?v.filter(x=>x&&/^[a-z0-9-]+$/.test(x.id||'')):[]};
const notesHtml=slug=>read('data/notes/'+slug+'.html','');
const siteUrl=()=>(process.env.SITE_URL||'').replace(/\/+$/,'');

const STATIC={
 '/':{title:'رادیکال RN — آموزش تعاملی ریاضی پایهٔ نهم',desc:'رادیکال RN: جزوهٔ کامل هشت فصل ریاضی نهم، ابزارهای محاسباتی تعاملی، فیلم‌های آموزشی و پنل معلمان.',h1:'رادیکال RN — ریاضی نهم را ببین، لمس کن'},
 '/academy':{title:'آکادمی — هشت فصل ریاضی نهم | رادیکال RN',desc:'فصل‌های ریاضی پایهٔ نهم از مجموعه‌ها تا حجم و مساحت؛ هر فصل با جزوهٔ درس و ابزار تعاملی.',h1:'آکادمی رادیکال RN'},
 '/history':{title:'تاریخ ریاضیات — هفت ریاضی‌دان | رادیکال RN',desc:'هفت ریاضی‌دان بزرگ: اقلیدس، ارشمیدس، خوارزمی، خیام، فیثاغورس، نیوتن و امی نوتر؛ زندگی‌نامه، دستاوردها و پیوند با درس‌های نهم.',h1:'تاریخ ریاضیات'},
 '/exams':{title:'بانک نمونه‌آزمون‌های ریاضی نهم | رادیکال RN',desc:'نمونه‌آزمون‌های فصلی، ترکیبی، نوبت اول، نوبت دوم و جامع ریاضی نهم با پاسخنامهٔ جدا و فایل PDF و Word.',h1:'بانک نمونه‌آزمون‌ها'},
 '/games':{title:'بازی‌های آموزشی ریاضی نهم | رادیکال RN',desc:'هشت بازی آموزشی برای هشت فصل ریاضی نهم: نمودار ون، محور اعداد، پازل برهان، جفت‌یابی توان و رادیکال، مسابقهٔ اتحادها، خط و ستاره‌ها، شکار مقدارهای ممنوع و تنظیم حجم.',h1:'بازی‌های آموزشی'},
 '/videos':{title:'فیلم‌های آموزشی ریاضی نهم | رادیکال RN',desc:'کتابخانهٔ انیمیشن‌ها و فیلم‌های آموزشی ریاضی نهم، دسته‌بندی‌شده بر اساس فصل.',h1:'فیلم‌های آموزشی'},
 '/notes':{title:'جزوه‌های ریاضی نهم | رادیکال RN',desc:'جزوهٔ کامل هشت فصل ریاضی نهم با فرمول‌های خوانا، مثال و تمرین همراه با پاسخ.',h1:'جزوه‌های ریاضی نهم'},
 '/math-lab':{title:'ابزارهای ریاضی نهم (آزمایشگاه ریاضی) | رادیکال RN',desc:'ابزارهای تعاملی ریاضی نهم: مجموعه‌ها، رادیکال‌ها، چندجمله‌ای‌ها، معادلهٔ خط، عبارت‌های گویا و حجم.',h1:'آزمایشگاه ریاضی'},
 '/teachers':{title:'پنل معلمان | رادیکال RN',desc:'منابع قابل دانلود، بانک نمونه‌سؤال، آزمون‌ساز و ساخت پاورپوینت برای معلمان ریاضی نهم.',h1:'پنل معلمان'},
 '/contact':{title:'ارتباط با ما | رادیکال RN',desc:'راه‌های ارتباط با تیم رادیکال RN.',h1:'ارتباط با ما'}};

function allRoutes(){const r=[];Object.keys(STATIC).forEach(p=>r.push({path:p,...STATIC[p],kind:'page'}));
 CH.forEach(c=>{const b='/chapters/'+c.slug;
  r.push({path:b,kind:'chapter',ch:c,title:`فصل ${fa(c.id)}: ${c.t} — ریاضی نهم | رادیکال RN`,desc:`${c.t}: ${c.d}. جزوه و ابزار تعاملی.`,h1:`فصل ${fa(c.id)}: ${c.t}`});
  r.push({path:b+'/tool',kind:'tool',ch:c,title:`ابزار ${c.t} — فصل ${fa(c.id)} ریاضی نهم | رادیکال RN`,desc:`ابزار تعاملی فصل ${c.t}: ${c.d}.`,h1:`${c.t} — ابزار کاربردی`});
  r.push({path:b+'/notes',kind:'notes',ch:c,title:`جزوهٔ ${c.t} — فصل ${fa(c.id)} ریاضی نهم | رادیکال RN`,desc:`جزوهٔ کامل فصل ${c.t} با مثال، فرمول و تمرین همراه با پاسخ.`,h1:`${c.t} — جزوهٔ درس`})});
 history().forEach(h=>r.push({path:'/history/'+h.slug,kind:'history',h,title:`${h.nameFa} (${h.nameEn}) — تاریخ ریاضیات | رادیکال RN`,desc:h.summary.slice(0,160),h1:h.nameFa}));
 GAMES_META.forEach(g=>{const c=CH.find(x=>x.slug===g[2]);r.push({path:'/games/'+g[0],kind:'game',title:`${g[1]} — بازی آموزشی فصل ${c.id} (${c.t}) | رادیکال RN`,desc:`بازی آموزشی «${g[1]}» برای فصل ${c.t} ریاضی نهم.`,h1:g[1],ch:c})});
 exams().forEach(e=>r.push({path:'/exams/'+e.id,kind:'exam',e,title:`${e.title} | نمونه آزمون ریاضی نهم`,desc:`${e.count} سؤال، ${e.total} نمره، ${e.duration} دقیقه؛ با پاسخنامه. نمونهٔ آموزشی و غیررسمی.`,h1:e.title}));
 videos().forEach(v=>{const c=CH.find(x=>x.slug===v.chapter);r.push({path:'/videos/'+v.id,kind:'video',v,ch:c,title:`${v.title} | فیلم آموزشی رادیکال RN`,desc:(v.description||v.title).slice(0,160),h1:v.title})});
 return r}
function match(p){p=p.replace(/\/+$/,'')||'/';return allRoutes().find(r=>r.path===p)||null}

function jsonld(route,base){const out=[];const url=p=>base?base+p:p;
 if(route.path==='/'){const s=siteInfo();out.push({'@context':'https://schema.org','@type':'WebSite',name:s.name,inLanguage:'fa-IR',url:url('/')},{'@context':'https://schema.org','@type':'Organization',name:s.name,url:url('/'),logo:url('/assets/logo.webp'),founder:{'@type':'Person',name:s.creator}})}
 if(route.ch&&route.kind!=='video'){const items=[['خانه','/'],['آکادمی','/academy'],[route.ch.t,'/chapters/'+route.ch.slug]];if(route.kind!=='chapter')items.push([route.kind==='tool'?'ابزار':'جزوه',route.path]);
  out.push({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((it,i)=>({'@type':'ListItem',position:i+1,name:it[0],item:url(it[1])}))})}
 if(route.kind==='video'&&route.v.thumbnail&&route.v.uploadDate){const v=route.v;out.push({'@context':'https://schema.org','@type':'VideoObject',name:v.title,description:v.description||v.title,thumbnailUrl:/^https?:/.test(v.thumbnail)?v.thumbnail:url('/'+v.thumbnail.replace(/^\//,'')),uploadDate:v.uploadDate,inLanguage:'fa-IR'})}
 return out}

function body(route){const nav=`<nav aria-label="پیوندهای اصلی"><a href="/academy">آکادمی</a> · <a href="/videos">فیلم‌ها</a> · <a href="/notes">جزوه‌ها</a> · <a href="/math-lab">ابزارها</a> · <a href="/teachers">معلمان</a> · <a href="/contact">ارتباط با ما</a></nav>`;
 let h=`<div class="prerender wrap"><h1>${esc(route.h1)}</h1><p>${esc(route.desc)}</p>`;
 if(route.path==='/'||route.path==='/academy'||route.path==='/notes'||route.path==='/math-lab')h+=`<ul>${CH.map(c=>`<li><a href="/chapters/${c.slug}">فصل ${fa(c.id)}: ${esc(c.t)}</a> — ${esc(c.d)}</li>`).join('')}</ul>`;
 if(route.path==='/videos')h+=videos().length?`<ul>${videos().map(v=>`<li><a href="/videos/${v.id}">${esc(v.title)}</a></li>`).join('')}</ul>`:'<p>هنوز ویدیویی منتشر نشده است.</p>';
 if(route.kind==='chapter')h+=`<p><a href="${route.path}/tool">ابزار کاربردی</a> · <a href="${route.path}/notes">جزوهٔ درس</a></p>`;
 if(route.kind==='notes')h+=`<article>${notesHtml(route.ch.slug)}</article>`;
 if(route.path==='/history')h+=`<ol>${history().map(x=>`<li><a href="/history/${x.slug}">${esc(x.nameFa)}</a> — ${esc(x.period)}</li>`).join('')}</ol>`;
 if(route.kind==='history'){const x=route.h;h+=`<p>${esc(x.period)} · ${esc(x.region)}</p><p>${esc(x.summary)}</p>${(x.biographySections||[]).map(b=>`<h2>${esc(b.title)}</h2><p>${esc(b.text)}</p>`).join('')}<ul>${x.contributions.map(c=>`<li>${esc(c.t)}</li>`).join('')}</ul><p>${esc(x.why)}</p><p>${esc(x.note)}</p>`}
 if(route.path==='/games')h+=`<ul>${GAMES_META.map(g=>`<li><a href="/games/${g[0]}">${esc(g[1])}</a></li>`).join('')}</ul>`;
 if(route.path==='/exams')h+=`<ul>${exams().map(x=>`<li><a href="/exams/${x.id}">${esc(x.title)}</a></li>`).join('')}</ul>`;
 if(route.kind==='exam')h+=`<p>${esc(route.e.scopeNote)}</p><p><a href="${route.e.files.examPdf}">دانلود آزمون (PDF)</a> · <a href="${route.e.files.keyPdf}">دانلود پاسخنامه (PDF)</a></p>`;
 if(route.kind==='video')h+=`<p>${esc(route.v.description||'')}</p>`;
 return h+nav+'</div>'}

function render(route,tpl){const base=siteUrl();const canon=base?base+(route.path==='/'?'/':route.path):'';
 const head=[`<title>${esc(route.title)}</title>`,`<meta name="description" content="${esc(route.desc)}">`,canon?`<link rel="canonical" href="${esc(canon)}">`:'',
  `<meta property="og:type" content="website"><meta property="og:locale" content="fa_IR"><meta property="og:site_name" content="رادیکال RN"><meta property="og:title" content="${esc(route.title)}"><meta property="og:description" content="${esc(route.desc)}">`,canon?`<meta property="og:url" content="${esc(canon)}"><meta property="og:image" content="${esc(base+'/assets/logo.webp')}">`:'',
  `<meta name="twitter:card" content="summary">`,...jsonld(route,base).map(j=>`<script type="application/ld+json">${JSON.stringify(j).replace(/</g,'\\u003c')}</script>`)].filter(Boolean).join('\n');
 return tpl.replace('<!--RN:HEAD-->',head).replace('<!--RN:BODY-->',body(route))}
function sitemap(){const base=siteUrl()||'https://YOUR-DOMAIN.example';const d=new Date().toISOString().slice(0,10);
 return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+allRoutes().map(r=>`<url><loc>${esc(base+(r.path==='/'?'/':r.path))}</loc><lastmod>${d}</lastmod></url>`).join('\n')+'\n</urlset>\n'}
function robots(){const base=siteUrl()||'https://YOUR-DOMAIN.example';return `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`}
module.exports={GAMES_META,exams,history,ROOT,CH,esc,fa,allRoutes,match,render,sitemap,robots,notesHtml,videos,siteInfo,siteUrl,read,json};
