/* جارویس RN — رابط گفتگوی دستیار آفلاین. پاسخ‌ها فقط با textContent/عناصر ساخته‌شده نمایش داده می‌شوند (بدون innerHTML از ورودی). */
(function(){
const KB_FILES=['identity','navigation','website','math'];let eng=null,loading=null,open=false,learn=true,booted=false;
const LS='rn-jarvis-learn';try{learn=localStorage.getItem(LS)!=='0'}catch(e){}
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const SAFE=/^\/[a-z0-9\/#-]*$/;
function build(){if(booted)return;booted=true;
 const root=el('div','jv');root.id='jv';
 const btn=el('button','jv-btn');btn.id='jv-btn';btn.type='button';btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','jv-panel');btn.setAttribute('aria-label','باز کردن دستیار جارویس RN');btn.innerHTML='<svg viewBox="0 0 24 24" width="22" aria-hidden="true"><path d="M3 19l4 0 3-10 6 12 5-18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span>جارویس</span>';
 const panel=el('section','jv-panel');panel.id='jv-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','دستیار جارویس RN');
 const head=el('header','jv-head');const ttl=el('div','jv-title');ttl.append(el('b',null,'جارویس RN'),el('span','jv-badge','دانش محلی · آفلاین'));
 const tools=el('div','jv-tools');const mode=el('button','jv-t');mode.type='button';mode.id='jv-mode';mode.setAttribute('aria-pressed',String(learn));mode.title='حالت یادگیری: اول راهنمایی، بعد پاسخ';mode.textContent='حالت یادگیری';
 const reset=el('button','jv-t');reset.type='button';reset.id='jv-reset';reset.textContent='گفتگوی تازه';reset.setAttribute('aria-label','پاک‌کردن گفتگو');
 const close=el('button','jv-t jv-x');close.type='button';close.id='jv-close';close.textContent='✕';close.setAttribute('aria-label','بستن دستیار');tools.append(mode,reset,close);head.append(ttl,tools);
 const log=el('div','jv-log');log.id='jv-log';log.setAttribute('role','log');log.setAttribute('aria-live','polite');log.tabIndex=0;log.setAttribute('aria-label','گفتگو');
 const chips=el('div','jv-chips');chips.id='jv-chips';
 const form=el('form','jv-form');form.setAttribute('novalidate','');const ta=el('textarea');ta.id='jv-in';ta.rows=1;ta.maxLength=300;ta.placeholder='سؤالت را بنویس…';ta.setAttribute('aria-label','پیام به جارویس');const send=el('button','jv-send','ارسال');send.type='submit';form.append(ta,send);
 const note=el('p','jv-note','جارویس یک دستیار از پیش‌برنامه‌ریزی‌شده است، نه هوش مصنوعی عمومی؛ فقط از دانش محلی همین سایت پاسخ می‌دهد.');
 panel.append(head,log,chips,form,note);root.append(btn,panel);document.body.appendChild(root);
 const S={root,btn,panel,log,chips,ta,form,mode,reset,close};
 btn.onclick=()=>toggle(S);close.onclick=()=>toggle(S,false);
 mode.onclick=()=>{learn=!learn;mode.setAttribute('aria-pressed',String(learn));try{localStorage.setItem(LS,learn?'1':'0')}catch(e){}say(S,'a',learn?'حالت یادگیری روشن شد: برای مسئله‌های ساده اول راهنمایی می‌دهم.':'حالت یادگیری خاموش شد: برای مسئله‌های ساده مستقیم پاسخ می‌دهم.')};
 reset.onclick=()=>{if(eng)eng.reset();log.textContent='';welcome(S)};
 form.onsubmit=e=>{e.preventDefault();submit(S,ta.value)};
 ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submit(S,ta.value)}});
 ta.addEventListener('input',()=>{ta.style.height='auto';ta.style.height=Math.min(120,ta.scrollHeight)+'px'});
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();toggle(S,false)}});
 chips.onclick=e=>{const b=e.target.closest('button');if(b)submit(S,b.dataset.q)};
 window.__jv=S;return S}
function toggle(S,force){open=force===undefined?!open:force;S.panel.hidden=!open;S.btn.setAttribute('aria-expanded',String(open));S.btn.setAttribute('aria-label',open?'بستن دستیار جارویس RN':'باز کردن دستیار جارویس RN');
 if(open){if(!S.welcomed){S.welcomed=true;welcome(S)}loadKB().then(()=>{S.ta.focus()}).catch(()=>{});S.ta.focus()}else S.btn.focus()}
function loadKB(){if(eng)return Promise.resolve(eng);if(loading)return loading;loading=Promise.all(KB_FILES.map(f=>fetch('/data/jarvis/'+f+'.json').then(r=>{if(!r.ok)throw new Error(f);return r.json()}))).then(parts=>{eng=JarvisEngine.create(parts.flat());return eng}).catch(e=>{loading=null;throw e});return loading}
function say(S,who,text,extra){const m=el('div','jv-m jv-'+who);const body=el('div','jv-b');String(text).split('\n').forEach(p=>{if(p)body.appendChild(el('p',null,p))});m.appendChild(body);
 if(extra&&extra.links&&extra.links.length){const L=el('div','jv-links');extra.links.forEach(l=>{if(typeof l.href==='string'&&SAFE.test(l.href)&&l.t){const a=el('a','jv-link',l.t);a.href=l.href;L.appendChild(a)}});if(L.children.length)m.appendChild(L)}
 S.log.appendChild(m);if(who==='a'&&typeof typeset==='function')typeset(m);S.log.scrollTop=S.log.scrollHeight;return m}
function showChips(S,list){S.chips.textContent='';(list||[]).slice(0,4).forEach(q=>{if(!q)return;const b=el('button','jv-chip',q);b.type='button';b.dataset.q=q;S.chips.appendChild(b)})}
function welcome(S){say(S,'a','سلام! من جارویس RN هستم؛ دستیار آفلاین رادیکال RN. می‌توانم مسیر بخش‌های سایت را نشان بدهم، فرمول و تعریف‌های ریاضی نهم را یادآوری کنم و برای مسئله‌های ساده اول راهنمایی بدهم. توجه: من فقط از پایگاه دانش محلی پاسخ می‌دهم و هوش مصنوعی عمومی نیستم.');showChips(S,['بازی‌ها کجاست؟','فرمول حجم کره','چطور آزمون بسازم؟','پروندهٔ صفر چیست؟'])}
function submit(S,q){q=String(q==null?'':q).slice(0,300);S.ta.value='';S.ta.style.height='auto';
 if(!q.trim()){say(S,'a','سؤالت را بنویس تا کمک کنم.');return}
 say(S,'u',q);loadKB().then(e=>{const r=e.answer(q,{learning:learn});say(S,'a',r.text,r);showChips(S,r.chips)}).catch(()=>{say(S,'a','پایگاه دانش بارگذاری نشد (فایل‌ها در دسترس نیست). صفحه را دوباره بارگذاری کن.');showChips(S,[])})}
function init(){build()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.JARVIS={open:()=>{const S=build();if(!open)toggle(S,true)},close:()=>{if(window.__jv&&open)toggle(window.__jv,false)}};
})();
