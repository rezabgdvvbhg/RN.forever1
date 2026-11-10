/* موتور جارویس RN — کاملاً محلی و قطعی؛ بدون شبکه، بدون مدل زبانی. فقط با پایگاه دانش از پیش نوشته‌شده کار می‌کند.
   نرمال‌سازی فارسی/عربی ← توکن‌سازی ← امتیازدهی کلیدواژه/عبارت/مثال ← آستانهٔ اطمینان ← پاسخ یا بازگشت صادقانه. */
(function(root,f){const m=f();if(typeof module==='object'&&module.exports)module.exports=m;else root.JarvisEngine=m})(this,function(){
const DIG={'۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9','٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'};
/* نرمال‌سازی: یکسان‌سازی ی/ک/ه و همزه، حذف اعراب و کشیده، نیم‌فاصله ← فاصله، ارقام، نشانه‌گذاری */
function normalize(s){s=String(s==null?'':s);if(s.length>400)s=s.slice(0,400);
 s=s.normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g,'').replace(/[يىئ]/g,'ی').replace(/ك/g,'ک').replace(/[ةۀ]/g,'ه').replace(/[أإآٱ]/g,'ا').replace(/ؤ/g,'و').replace(/[\u200c\u200d\u200e\u200f]/g,' ')
  .replace(/[۰-۹٠-٩]/g,d=>DIG[d]).replace(/[«»"'`؟?!؛;,،:()\[\]{}<>…]/g,' ').replace(/[–—−]/g,'-').toLowerCase();
 return s.replace(/\s+/g,' ').trim()}
const STOP=new Set('و در به از که این آن را با برای یک است هست می چه چی هم تا یا من ما شما لطفا خب اگر بود شد بر بی ها های ای بود هستم هستید بشه میشه می‌شه میتونم میخوام میخواهم بگو بگید بده بدید رو توی تو'.split(' ').map(normalize));
function stem(w){if(w.length>4&&/ها$/.test(w))w=w.slice(0,-2);else if(w.length>5&&/های$/.test(w))w=w.slice(0,-3);if(w.length>3&&/[یه]$/.test(w)&&!/^(ریشه|مجموعه|معادله|فاصله|نقطه|زاویه|هندسه|فرمول|محاسبه|مسئله|مساله|رابطه)$/.test(w))w=w.slice(0,-1);return w}
const tokens=s=>normalize(s).split(' ').filter(Boolean);
const stems=s=>tokens(s).map(stem);
const content=s=>stems(s).filter(w=>!STOP.has(w));
const NAVCUE=new Set(['کجا','کجاست','کجاس','بروم','برم','رفتن','صفحه','لینک','پیدا','باز','دسترسی','منو','دانلود','ورود','وارد','پیداش','آدرس'].map(w=>stem(normalize(w))));
const HOWCUE=new Set(['چطور','چگونه','کنم','بسازم','درست','کردن'].map(w=>stem(normalize(w))));
const MATHCUE=new Set(['چیست','چیه','یعنی','تعریف','فرمول','حساب','محاسبه','حاصل','مثال','اشتباه','نکته','قانون','قاعده','روش','چطور حل','توضیح','معنی'].map(w=>stem(normalize(w))));
const CHAPTERS=[['sets','مجموعه‌ها',['مجموعه','مجموع','ون','اجتماع','اشتراک'],1],['real-numbers','عددهای حقیقی',['حقیقی','عدد حقیقی','اعداد حقیقی'],2],['geometry-reasoning','استدلال و اثبات در هندسه',['استدلال','اثبات','هندسه','هم‌نهشتی','تشابه'],3],['power-root','توان و ریشه',['توان','ریشه','رادیکال','جذر'],4],['algebraic-expressions','عبارت‌های جبری',['جبری','عبارت جبری','اتحاد','چندجمله‌ای'],5],['linear-equations','خط و معادله‌های خطی',['خط','معادله خطی','معادله‌های خطی','شیب'],6],['rational-expressions','عبارت‌های گویا',['عبارت گویا','عبارت‌های گویا','کسر جبری'],7],['volume-area','حجم و مساحت',['حجم','مساحت','کره','مخروط','هرم'],8]];
const ORD={'اول':1,'یکم':1,'دوم':2,'سوم':3,'چهارم':4,'پنجم':5,'ششم':6,'هفتم':7,'هشتم':8};
function detectChapter(q){const n=normalize(q);let m=n.match(/فصل\s*(\d)/);if(m&&m[1]>=1&&m[1]<=8)return CHAPTERS[m[1]-1][0];m=n.match(/فصل\s*(اول|یکم|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم)/);if(m)return CHAPTERS[ORD[m[1]]-1][0];
 const hits=[];for(const[slug,name,al]of CHAPTERS){for(const a of [name,...al]){const na=normalize(a);if(na&&(' '+n+' ').includes(' '+na+' ')||(na.length>3&&n.includes(na)))hits.push(slug)}}
 const u=[...new Set(hits)];return u.length===1?u[0]:null}
function prep(kb){const intents=kb.map(it=>({...it,_keys:(it.keys||[]).map(k=>stems(k).filter(w=>!STOP.has(w))).filter(a=>a.length),_ex:(it.examples||[]).map(e=>new Set(content(e)))}));
 const df={};intents.forEach(it=>{const seen=new Set();it._keys.forEach(a=>a.forEach(w=>seen.add(w)));seen.forEach(w=>df[w]=(df[w]||0)+1)});return{intents,df,N:intents.length}}
function hasPhrase(ts,ph){if(ph.length===1)return ts.includes(ph[0]);outer:for(let i=0;i+ph.length<=ts.length;i++){for(let j=0;j<ph.length;j++)if(ts[i+j]!==ph[j])continue outer;return true}return false}
function score(P,q){const chap=detectChapter(q);const ts=stems(q).filter(w=>!STOP.has(w)||NAVCUE.has(w)),set=new Set(ts);const nav=ts.some(w=>NAVCUE.has(w)),mth=ts.some(w=>MATHCUE.has(w)),how=ts.some(w=>HOWCUE.has(w));const out=[];
 for(const it of P.intents){let s=0;const hit=new Set();for(const ph of it._keys){if(hasPhrase(ts,ph)){const w=ph.length>1?3+ph.length:(ph[0].length<=2?1:P.df[ph[0]]===1?2.9:P.df[ph[0]]<=3?2.4:1.2);s+=w;ph.forEach(x=>hit.add(x))}}
  let best=0;for(const ex of it._ex){if(!ex.size)continue;let inter=0;ex.forEach(w=>{if(set.has(w))inter++});const un=ex.size+set.size-inter;const j=inter/un;if(j>best)best=j}if(best>=.5)s+=best*7;
  if(s>0){if(it.domain==='nav'&&nav)s+=2;if((it.domain==='nav'||it.domain==='site')&&how&&!nav)s+=1;if(it.domain==='math'&&mth)s+=1.5;if(it.chapterAware&&chap)s+=3;s+=it.priority||0;if(it.not&&it.not.some(k=>hasPhrase(ts,stems(k))))s-=4}
  out.push({it,s,hit})}
 return out.sort((a,b)=>b.s-a.s)}
/* ── حل‌کننده‌های محلی با «راهنمایی اول» ── */
const toN=s=>parseInt(s,10);const sq=n=>{let a=1,b=n;for(let k=Math.floor(Math.sqrt(n));k>1;k--)if(n%(k*k)===0){a=k;b=n/(k*k);break}return[a,b]};
const rad=(a,b)=>b===1?`${a}`:(a===1?`\\sqrt{${b}}`:`${a}\\sqrt{${b}}`);
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a};
const SOLVERS=[
 {id:'solve-radical',re:/(?:√|جذر|رادیکال)\s*(\d{1,6})(?!\s*[\/^])/,cue:/ساده|حاصل|حل|محاسبه|چند میشه|چنده|چی میشه/,run(m){const n=toN(m[1]);const[a,b]=sq(n);const sqr=Number.isInteger(Math.sqrt(n));return{hint:`بزرگ‌ترین مربع کامل را پیدا کن که \\(${n}\\) را بشمارد: ${[4,9,16,25,36,49,64,81,100].filter(k=>n%k===0).map(k=>`\\(${k}\\)`).join('، ')||'(هیچ‌کدام)'}. سپس \\(${n}=\\) (مربع کامل) × (باقی‌مانده) بنویس و جذر مربع کامل را بیرون بیاور.`,answer:sqr?`\\(\\sqrt{${n}}=${Math.sqrt(n)}\\) (مربع کامل است)`:(a===1?`\\(\\sqrt{${n}}\\) از قبل ساده‌ترین شکل است (عامل مربع کامل ندارد).`:`\\(\\sqrt{${n}}=\\sqrt{${a*a}\\times${b}}=${rad(a,b)}\\)`)}}},
 {id:'solve-subsets',re:/(\d{1,2})\s*عضو/,cue:/زیرمجموعه/,run(m){const n=toN(m[1]);if(n>20)return null;return{hint:`تعداد زیرمجموعه‌های مجموعه‌ای با \\(n\\) عضو را با توان \\(2\\) حساب کن؛ توان همان تعداد عضوهاست. برای زیرمجموعهٔ سره یکی کم کن.`,answer:`\\(2^{${n}}=${2**n}\\) زیرمجموعه و \\(${2**n-1}\\) زیرمجموعهٔ سره.`}}},
 {id:'solve-hyp',re:/(\d{1,4})\s+(?:و\s+)?(\d{1,4})/,cue:/وتر|فیثاغورس|قائم/,run(m){const a=toN(m[1]),b=toN(m[2]);const c2=a*a+b*b,c=Math.sqrt(c2);const[x,y]=sq(c2);return{hint:`قضیهٔ فیثاغورس: مربع وتر برابر مجموع مربع‌های دو ضلع قائم است. \\(a^2+b^2\\) را حساب کن و سپس جذر بگیر.`,answer:Number.isInteger(c)?`\\(\\sqrt{${a}^2+${b}^2}=\\sqrt{${c2}}=${c}\\)`:`\\(\\sqrt{${a}^2+${b}^2}=\\sqrt{${c2}}=${rad(x,y)}\\)`}}},
 {id:'solve-sphere',re:/شعاع\s*(\d{1,3})/,cue:/کره/,run(m){const r=toN(m[1]);const v=4*r**3,g=gcd(v,3);return{hint:`از فرمول‌ها استفاده کن: \\(V=\\frac43\\pi r^3\\) و \\(S=4\\pi r^2\\) و به‌جای \\(r\\) عدد ${r} را بگذار.`,answer:`\\(V=\\frac{${4*r**3}}{3}\\pi\\)${(4*r**3)%3===0?` \\(=${4*r**3/3}\\pi\\)`:''} و \\(S=${4*r*r}\\pi\\)`}}}
,
 {id:'solve-slope',re:/(-?\d{1,3})\s+(-?\d{1,3})\s+(?:و\s+)?(-?\d{1,3})\s+(-?\d{1,3})/,cue:/شیب/,run(m){const x1=+m[1],y1=+m[2],x2=+m[3],y2=+m[4];if(x1===x2)return{hint:'اگر \\(x\\) دو نقطه برابر باشد خط قائم است.',answer:'شیب تعریف‌نشده است (خط قائم: \\(x='+x1+'\\)).'};const n=y2-y1,d=x2-x1,g=gcd(n,d)||1,N=n/g*(d<0?-1:1),Dd=Math.abs(d/g);return{hint:`از فرمول شیب استفاده کن: \\(m=\\frac{y_2-y_1}{x_2-x_1}\\) و مختصات دو نقطه را جایگذاری کن (دقت کن علامت‌ها را).`,answer:`\\(m=\\frac{${y2}-(${y1})}{${x2}-(${x1})}=${Dd===1?N:`\\frac{${N}}{${Dd}}`}\\)`}}}];
function trySolver(q,mode){const n=normalize(q).replace(/√\s*/g,'√').replace(/(^|\s)(?:رادیکال|جذر)\s*(\d)/g,'$1√$2');for(const sv of SOLVERS){if(!sv.cue.test(n))continue;const m=n.match(sv.re);if(!m)continue;const r=sv.run(m);if(!r)continue;return{id:sv.id,hint:r.hint,answer:r.answer}}return null}
/* ── موتور ── */
function create(kb,opt){opt=opt||{};const P=prep(kb);const byId=Object.fromEntries(P.intents.map(i=>[i.id,i]));const TH=opt.threshold||3,LOW=opt.low||1.6;
 const ctx={last:null,chapter:null,pending:null,turns:0};
 const base=r=>Object.assign({text:'',links:[],chips:[],kind:'answer',id:null,confidence:0},r);
 const FALL=['این سؤال در پایگاه دانش محلی من نیست. من فقط به مسئله‌های ریاضی نهم و راهنمایی سایت پاسخ می‌دهم.','متوجه نشدم. می‌توانی سؤالت را با عبارت دیگری بنویسی؟'];
 function chips(it){return (it.follow||[]).slice(0,4)}
 function fromIntent(it,q,conf){const ch=detectChapter(q)||(it.useChapterCtx?ctx.chapter:null);let text=it.text,links=(it.links||[]).slice();
  if(it.chapterAware&&ch){const c=CHAPTERS.find(x=>x[0]===ch);const part=it.chapterAware;const href=`/chapters/${ch}${part==='main'?'':'/'+part}`;const lab=part==='notes'?'جزوهٔ':part==='tool'?'ابزار':'صفحهٔ';text=`${text.split('\n')[0]}\n${lab} فصل ${c[3]}: ${c[1]} اینجاست.`;links=[{t:`${lab} فصل ${c[3]}: ${c[1]}`,href}]}
  else if(it.chapterAware&&!ch){text=text+'\nاگر شمارهٔ فصل را بگویی لینک مستقیم می‌دهم.'}
  ctx.last=it.id;if(ch)ctx.chapter=ch;return base({id:it.id,text,links,chips:chips(it),confidence:conf,kind:'answer',domain:it.domain,example:it.example||null,more:it.more||null})}
 function answer(q,o){o=o||{};const raw=String(q==null?'':q);ctx.turns++;const n=normalize(raw);
  if(!n){return base({kind:'empty',text:'سؤالت را بنویس تا کمک کنم. مثلاً: «بازی‌ها کجاست؟» یا «اتحاد مزدوج چیست؟»',chips:['بازی‌ها کجاست؟','اتحاد مزدوج چیست؟','پروندهٔ صفر چیست؟']})}
  // ادامهٔ گفتگو: پاسخ «جواب/نشان بده» برای راهنمایی معلق
  if(ctx.pending&&/^(جواب|پاسخ|جواب رو|جوابش|حل کامل|نشان بده|نشونم بده|بگو)(?:\s|$)/.test(n)){const p=ctx.pending;ctx.pending=null;return base({id:p.id,kind:'answer',text:'پاسخ: '+p.answer,confidence:1,chips:['مثال دیگر','فرمول‌ها کجاست؟']})}
  if(ctx.last&&/^(مثال|یه مثال|نمونه|مثال بزن|مثال دیگه|یک مثال)(?:\s|$)/.test(n)){const it=byId[ctx.last];if(it&&it.example)return base({id:it.id,kind:'answer',text:it.example,confidence:1,chips:chips(it)})}
  if(ctx.last&&/^(بیشتر|بیشتر توضیح|توضیح بیشتر|ادامه|کامل تر|توضیح بده)(?:\s|$)/.test(n)){const it=byId[ctx.last];if(it&&it.more)return base({id:it.id,kind:'answer',text:it.more,confidence:1,chips:chips(it)})}
  const mode=o.learning!==false;const sv=trySolver(raw);if(sv){if(mode){ctx.pending=sv;ctx.last=sv.id;return base({id:sv.id,kind:'hint',text:'راهنمایی: '+sv.hint+'\nاگر خودت امتحان کردی و جواب را می‌خواهی، بنویس «جواب».',chips:['جواب'],confidence:1})}ctx.last=sv.id;return base({id:sv.id,kind:'answer',text:'پاسخ: '+sv.answer,confidence:1})}
  const sc=score(P,raw),a=sc[0],b=sc[1];
  if(!a||a.s<LOW){ctx.last=null;return base({kind:'fallback',text:FALL[0],chips:['بازی‌ها کجاست؟','فرمول حجم کره','چطور آزمون بسازم؟','جارویس چه کارهایی بلد است؟'],confidence:0})}
  if(a.s<TH){const alt=sc.filter(x=>x.s>=LOW).slice(0,3).map(x=>(x.it.examples||[])[0]).filter(Boolean);return base({kind:'low',text:FALL[1]+(alt.length?' شاید منظورت یکی از این‌ها بود:':''),chips:alt,confidence:a.s/TH})}
  if(b&&b.s>=TH&&b.s>=a.s*.88&&a.it.domain!==b.it.domain&&!a.it.id.startsWith('ident')&&!(a.it.priority>b.it.priority)){return base({kind:'clarify',text:'سؤالت می‌تواند دو معنا داشته باشد؛ منظورت کدام است؟',chips:[(a.it.examples||[a.it.id])[0],(b.it.examples||[b.it.id])[0]],confidence:a.s/(a.s+b.s)})}
  return fromIntent(a.it,raw,Math.min(1,a.s/(TH*3)))}
 return{answer,context:ctx,reset(){ctx.last=null;ctx.chapter=null;ctx.pending=null;ctx.turns=0},intents:P.intents,score:q=>score(P,q)}}
return{normalize,tokens,stems,content,detectChapter,create,trySolver,CHAPTERS,SOLVERS}});
