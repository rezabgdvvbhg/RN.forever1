/* ساخت نسخهٔ ایستای قابل انتشار در dist/ (HTML پیش‌رندرشدهٔ هر مسیر + sitemap + robots).
   برای استفاده از هوش مصنوعی/فرم تماس همچنان باید server.js اجرا شود؛ بقیهٔ سایت روی هر هاست ایستا کار می‌کند. */
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),DIST=path.join(ROOT,'dist');
try{fs.readFileSync(path.join(ROOT,'.env'),'utf8').split(/\r?\n/).forEach(l=>{const m=/^\s*(SITE_URL)\s*=\s*(.*?)\s*$/.exec(l);if(m&&!process.env.SITE_URL)process.env.SITE_URL=m[2]})}catch(e){}
const site=require('../lib/site.js');
if(!process.env.SITE_URL)console.warn('⚠ SITE_URL تنظیم نشده؛ canonical حذف و sitemap با نشانی نمونه ساخته می‌شود. پیش از انتشار SITE_URL=https://دامنه-شما را بدهید.');
fs.rmSync(DIST,{recursive:true,force:true});fs.mkdirSync(DIST,{recursive:true});
const cp=(s,d)=>fs.cpSync(path.join(ROOT,s),path.join(DIST,d||s),{recursive:true});
['assets','css','js','data','files'].forEach(d=>cp(d));
['js/core.test.js','js/pptx-build.js.map'].forEach(f=>fs.rmSync(path.join(DIST,f),{force:true}));
const tpl=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');let n=0;
site.allRoutes().forEach(r=>{const dir=r.path==='/'?DIST:path.join(DIST,...r.path.split('/').filter(Boolean));fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),site.render(r,tpl));n++});
fs.writeFileSync(path.join(DIST,'404.html'),site.render({path:'/404',title:'صفحه پیدا نشد | رادیکال RN',desc:'این نشانی وجود ندارد.',h1:'صفحه پیدا نشد',kind:'page'},tpl).replace('<head>','<head><meta name="robots" content="noindex">'));
fs.writeFileSync(path.join(DIST,'sitemap.xml'),site.sitemap());fs.writeFileSync(path.join(DIST,'robots.txt'),site.robots());
console.log(`dist/ ساخته شد: ${n} صفحه + 404 + sitemap.xml + robots.txt`);
