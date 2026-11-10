/* آزمون رابط «پروندهٔ صفر» در jsdom با بوم ساختگی: ورودی واقعی کیبورد، پنجره‌ها، HUD، شکست، توقف، پایان کامل. نیاز: npm i --no-save jsdom */
const {JSDOM,VirtualConsole}=require('jsdom');const path=require('path');const R=path.join(__dirname,'..');const srv=require(R+'/server.js');const {record}=require('./zf-solver.js');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let fails=0,errs=[];const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c?'':' ← '+x));if(!c)fails++};
async function open(P,p){const url='http://127.0.0.1:'+P+p;const html=await (await fetch(url)).text();const vc=new VirtualConsole();vc.on('jsdomError',e=>errs.push(p+' '+e.message));
 const dom=new JSDOM(html,{url,runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.fetch=(u,o)=>fetch(new URL(u,w.location.href),o);w.matchMedia=q=>({matches:true,addEventListener(){},removeEventListener(){},addListener(){}});w.scrollTo=()=>{};w.ResizeObserver=class{observe(){}disconnect(){}};w.HTMLElement.prototype.focus=function(){};
  const ctx=new Proxy({},{get:(t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):k==='measureText'?()=>({width:10}):k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true}});w.HTMLCanvasElement.prototype.getContext=()=>ctx}});await sleep(1700);return dom.window}
const CODE={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'};
const key=(w,code)=>w.document.dispatchEvent(new w.KeyboardEvent('keydown',{code,key:code,bubbles:true}));
const fx=s=>[...String(s)].map(c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).join('');
srv.listen(0,'127.0.0.1',async()=>{const P=srv.address().port;let w,d;
 w=await open(P,'/games');d=w.document;ok('مرکز بازی‌ها: کارت ویژهٔ پروندهٔ صفر',!!d.querySelector('a.zf-flag[href="/games/zero-file"]')&&d.querySelectorAll('.gcard').length===8);w.close();
 w=await open(P,'/games/zero-file');d=w.document;ok('صفحهٔ عنوان با سه قفل و کنترل‌ها',/پل سنگ‌ها/.test(d.getElementById('zft').textContent)&&/ترازو/.test(d.getElementById('zft').textContent)&&!!d.querySelector('#zfs'));
 d.getElementById('zfs').click();await sleep(100);const S=()=>w.__zf.state;ok('شروع بازی: HUD و هدف',!d.getElementById('zfg').hidden&&/گنگ|گویا/.test(d.getElementById('zfo').textContent)&&S().room===0,d.getElementById('zfo').textContent);
 // شکست: پا گذاشتن روی سنگ نادرست
 {const st=S().rooms.r1.stones.find(s=>s.x===3&&!w.ZF.stoneSafe(S(),s));const up=7-st.y;key(w,'ArrowRight');await sleep(110);for(let i=0;i<up;i++){key(w,'ArrowUp');await sleep(110)}ok('رسیدن به لبهٔ پل',S().px===2&&S().py===st.y,S().px+','+S().py);key(w,'ArrowRight');await sleep(120);
  ok('سنگ نادرست: سقوط، پیام توضیحی و بازگشت به لبه',S().stats.falls===1&&S().px===1&&S().py===7&&/خرد شد/.test(d.getElementById('zft2').textContent),d.getElementById('zft2').textContent+JSON.stringify(S().stats))}
 // توقف
 key(w,'KeyP');await sleep(50);ok('توقف: پنجره باز و حرکت قفل',!d.getElementById('zfov').hidden&&S().paused);const px=S().px;key(w,'ArrowUp');await sleep(110);ok('در توقف حرکت نمی‌کند',S().py===7);d.getElementById('zfx').click();await sleep(50);ok('ادامه از توقف',!S().paused&&d.getElementById('zfov').hidden);
 // دفترچه و راهنما و ریست
 key(w,'KeyJ');await sleep(50);ok('دفترچه باز می‌شود',!d.getElementById('zfov').hidden&&/دفترچه/.test(d.getElementById('zfov').textContent));key(w,'KeyJ');await sleep(50);ok('دفترچه با J بسته می‌شود',d.getElementById('zfov').hidden);
 key(w,'KeyH');await sleep(50);ok('راهنما: سنگ‌های روشن و ثبت در آمار',S().stats.hints===1&&!!S().rooms.r1.hintPath);key(w,'KeyR');await sleep(50);ok('ریست تالار',S().stats.resets===1&&S().rooms.r1.stones.every(s=>s.state==='ok'));
 // لمس
 d.querySelector('#zfpad [data-d=right]').dispatchEvent(new w.Event('pointerdown',{bubbles:true}));await sleep(120);ok('دکمهٔ لمسی حرکت می‌دهد',S().px===2,S().px);
 // خواندن پایانه با E
 {key(w,'ArrowLeft');await sleep(110);key(w,'ArrowUp');await sleep(110);key(w,'KeyE');await sleep(60);ok('خواندن پایانه: یادداشت در پنجره و در دفترچه',S().journal.includes('n_start')&&!d.getElementById('zfov').hidden&&/دفترچهٔ نگهبان/.test(d.getElementById('zfov').textContent));key(w,'KeyE');await sleep(60);ok('E یادداشت را می‌بندد',d.getElementById('zfov').hidden&&S().sub===null)}
 d.getElementById('zfp').click();await sleep(30);d.getElementById('zfn').click();await sleep(120);ok('شروع دوباره از توقف',S().stats.falls===0&&S().room===0);
 // بازی کامل با کیبورد
 const plan=record(S().v);let lastRoom=0;
 for(const a of plan){if(a.k==='move')key(w,CODE[a.d]);else key(w,'KeyE');await sleep(a.k==='e'?150:105);if(S().room!==lastRoom){lastRoom=S().room}if(S().sub==='note'){key(w,'KeyE')}}
 await sleep(200);ok('پایان: پنجرهٔ داستان پایانی',S().sub==='ending'&&/پروندهٔ صفر/.test(d.getElementById('zfov').textContent),S().sub+' room'+S().room+' '+S().px+','+S().py);
 d.getElementById('zfx').click();await sleep(100);const res=S().result;ok('تکمیل: رتبهٔ A و آمار',res&&res.rank==='A'&&S().over&&/رتبه: A/.test(d.getElementById('zfov').textContent),JSON.stringify(res));
 ok('پیشرفت ذخیره شد (localStorage)',/"done":1/.test(w.localStorage.getItem('rn-zf')||''));
 ok('دفترچه شامل همهٔ یادداشت‌های کلیدی',['n_laser','n_end'].every(n=>S().journal.includes(n)),S().journal.join());
 d.getElementById('zfa').click();await sleep(120);ok('بازی دوباره پس از پایان',S().room===0&&!S().over&&S().stats.steps===0&&d.getElementById('zfov').hidden);w.close();
 const real=errs.filter(e=>!/three|WebGL|Could not load|canvas|AudioContext|Not implemented|navigation/i.test(e));ok('بدون خطای کنسول',real.length===0,real.slice(0,4).join(' | '));srv.close();process.exit(fails?1:0)});
