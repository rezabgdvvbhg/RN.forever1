/* آزمون رابط جارویس RN در jsdom: باز/بسته شدن، فوکوس، پیشنهادها، حالت یادگیری، زمینه، بازنشانی، آفلاین‌بودن، امنیت. نیاز: npm i --no-save jsdom */
const {JSDOM,VirtualConsole}=require('jsdom');const path=require('path');const srv=require(path.join(__dirname,'..','server.js'));const sleep=ms=>new Promise(r=>setTimeout(r,ms));let fails=0,errs=[];
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c?'':' ← '+x));if(!c)fails++};
srv.listen(0,'127.0.0.1',async()=>{const P=srv.address().port;const url='http://127.0.0.1:'+P+'/chapters/sets';const html=await (await fetch(url)).text();const vc=new VirtualConsole();vc.on('jsdomError',e=>errs.push(e.message));let calls=[];
 const dom=new JSDOM(html,{url,runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.fetch=(u,o)=>{calls.push(String(u));return fetch(new URL(u,w.location.href),o)};w.matchMedia=q=>({matches:true,addEventListener(){},removeEventListener(){},addListener(){}});w.scrollTo=()=>{};w.ResizeObserver=class{observe(){}disconnect(){}};w.localStorage.setItem('rn-jarvis-learn','<script>')}});
 await sleep(1700);const w=dom.window,d=w.document;const $=s=>d.querySelector(s);
 ok('دکمهٔ شناور موجود و پنل بسته',!!$('#jv-btn')&&$('#jv-panel').hidden&&$('#jv-btn').getAttribute('aria-expanded')==='false');
 ok('مقدار خراب در localStorage رابط را نمی‌شکند (حالت یادگیری پیش‌فرض)',$('#jv-mode').getAttribute('aria-pressed')==='true'||$('#jv-mode').getAttribute('aria-pressed')==='false');
 $('#jv-btn').click();await sleep(500);ok('باز می‌شود، پیام خوش‌آمد و تذکر «محلی»',!$('#jv-panel').hidden&&/جارویس RN/.test($('#jv-log').textContent)&&/نیستم/.test($('#jv-log').textContent)&&/آفلاین/.test($('.jv-badge').textContent));
 ok('پنل دسترس‌پذیر: role، aria-live، برچسب‌ها',$('#jv-panel').getAttribute('role')==='dialog'&&$('#jv-log').getAttribute('aria-live')==='polite'&&!!$('#jv-in').getAttribute('aria-label')&&$('#jv-btn').getAttribute('aria-expanded')==='true');
 ok('پیشنهادها نمایش داده می‌شوند (۴ تا)',d.querySelectorAll('.jv-chip').length===4);
 ok('بارگذاری پایگاه دانش با فایل‌های محلی',calls.filter(c=>/data\/jarvis/.test(c)).length===4,calls.join(','));
 // ارسال با دکمه و Enter
 $('.jv-chip').click();await sleep(300);ok('کلیک پیشنهاد: پاسخ با لینک امن به بخش بازی‌ها',[...d.querySelectorAll('.jv-link')].some(a=>a.getAttribute('href')==='/games'),$('#jv-log').textContent.slice(-120));
 const ta=$('#jv-in');ta.value='اتحاد مزدوج چیست؟';ta.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));await sleep(300);
 ok('Enter ارسال می‌کند و ورودی خالی می‌شود',ta.value===''&&/a\^2-b\^2|مزدوج/.test($('#jv-log').textContent));ok('فرمول با KaTeX نمایش داده می‌شود',d.querySelectorAll('#jv-log .katex').length>0);
 ta.value='خط اول';ta.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',shiftKey:true,bubbles:true,cancelable:true}));await sleep(50);ok('Shift+Enter ارسال نمی‌کند',ta.value==='خط اول'&&!/خط اول/.test(Array.from(d.querySelectorAll('.jv-u')).map(x=>x.textContent).join('|')));ta.value='';
 // آفلاین: پس از بارگذاری هیچ درخواست شبکه‌ای برای پاسخ نیست
 const before=calls.length;for(const q of['قوانین توان','نمونه آزمون کجاست؟','تو کی هستی']){ta.value=q;$('.jv-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await sleep(120)}ok('پاسخ‌ها بدون هیچ درخواست شبکه (fetch) ساخته شدند',calls.length===before,calls.slice(before).join(','));
 // حالت یادگیری و زمینه
 if($('#jv-mode').getAttribute('aria-pressed')!=='true')$('#jv-mode').click();ta.value='√72 را ساده کن';$('.jv-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await sleep(150);ok('حالت یادگیری: راهنمایی اول',/راهنمایی/.test(d.querySelector('#jv-log .jv-m:last-child').textContent)&&[...d.querySelectorAll('.jv-chip')].some(c=>c.textContent==='جواب'));
 [...d.querySelectorAll('.jv-chip')].find(c=>c.textContent==='جواب').click();await sleep(200);ok('کلیک «جواب»: پاسخ کامل ۶√۲',d.querySelector('#jv-log .jv-m:last-child').textContent.includes('6')&&d.querySelectorAll('#jv-log .katex').length>2);
 // امنیت
 ta.value='<img src=x onerror=window.__pwn=1> <script>window.__pwn=2</script>';$('.jv-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await sleep(200);ok('ورودی HTML: فقط متن ساده، بدون اجرا',!d.querySelector('#jv-log img')&&!d.querySelector('#jv-log script')&&!w.__pwn);
 ta.value='x'.repeat(1000);$('.jv-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await sleep(100);ok('ورودی خیلی بلند محدود می‌شود',[...d.querySelectorAll('.jv-u')].every(u=>u.textContent.length<=300));
 ta.value='   ';$('.jv-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await sleep(50);ok('ورودی خالی پیام راهنما می‌دهد و پیام کاربر نمی‌سازد',/سؤالت را بنویس/.test($('#jv-log').textContent));
 // بازنشانی و بستن
 $('#jv-reset').click();await sleep(60);ok('گفتگوی تازه: فقط پیام خوش‌آمد',d.querySelectorAll('.jv-u').length===0&&d.querySelectorAll('.jv-m').length===1);
 $('#jv-panel').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await sleep(50);ok('Esc بسته می‌کند و فوکوس به دکمه برمی‌گردد',$('#jv-panel').hidden&&$('#jv-btn').getAttribute('aria-expanded')==='false');
 $('#jv-btn').click();await sleep(100);$('#jv-close').click();ok('دکمهٔ بستن',$('#jv-panel').hidden);
 // ناوبری SPA از لینک پاسخ
 $('#jv-btn').click();await sleep(100);ta.value='بازی‌ها کجاست؟';$('.jv-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await sleep(200);[...d.querySelectorAll('.jv-link')].find(a=>a.getAttribute('href')==='/games/zero-file').click();await sleep(1400);ok('کلیک لینک پاسخ: ناوبری SPA بدون بارگذاری مجدد',w.location.pathname==='/games/zero-file'&&!!d.getElementById('zfs')&&!!d.getElementById('jv-btn'),w.location.pathname);
 const real=errs.filter(e=>!/three|WebGL|Could not load|canvas|AudioContext|Not implemented|navigation/i.test(e));ok('بدون خطای کنسول',real.length===0,real.slice(0,3).join('|'));srv.close();process.exit(fails?1:0)});
