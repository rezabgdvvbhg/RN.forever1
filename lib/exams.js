/* ساخت آزمون‌های بانک نمونه‌سؤال (قطعی: بذرهای ثابت → همیشه همان آزمون) */
const Q=require('./qgen2.js');const CH=require('../js/chapters.js');
const SC10=[1.5,1.5,1.5,1.5,2,2,2,2.5,2.5,3],SC12=[1,1,1,1,1.5,1.5,1.5,1.5,2,2,3,3],SC16=[...Array(8).fill(1),...Array(8).fill(1.5)],SC20=Array(20).fill(1);
const sum=a=>Math.round(a.reduce((x,y)=>x+y,0)*100)/100;
/* هر آزمون: لیست [فصل، اندیس مولد، سطح]؛ در یک آزمون دو سؤال هم‌مولد نمی‌آید */
function pickGens(slug,n,shift,rr){const total=Q.G[slug].length;const idx=Array.from({length:total},(_,i)=>(i+shift)%total);return Q.shuf(rr,idx).slice(0,Math.min(n,total))}
function make(id,seedBase,plan,scores){const qs=[];plan.forEach(([slug,gi,L],k)=>{const r=Q.rng(seedBase*1009+k*97+gi*13+1);let q=Q.G[slug][gi](r,L);let tries=0;while(!q.ok&&tries++<20)q=Q.G[slug][gi](Q.rng(seedBase*31+k+tries*7),L);qs.push({chapter:slug,gen:gi,kind:q.kind,text:q.t,opts:q.opts||null,answer:q.a,solution:q.s})});
 qs.sort((a,b)=>(a.answer.length+a.solution.length)-(b.answer.length+b.solution.length));qs.forEach((q,i)=>{q.score=scores[i];q.no=i+1});return qs}
function chapterExam(ci,v){const c=CH[ci-1],rr=Q.rng(ci*100+v);const gens=pickGens(c.slug,10,(v-1)*3,rr);const plan=gens.map(g=>[c.slug,g,v]);
 // سؤال‌های اثبات/طولانی (پاسخ بلند) در انتها با نمرهٔ بیشتر
 return{id:`ch${ci}-v${v}`,kind:'chapter',chapters:[c.slug],title:`فصل ${ci}: ${c.t} — نمونه ${['اول (مقدماتی)','دوم (متوسط)','سوم (چالشی)'][v-1]}`,level:['مقدماتی','متوسط','چالشی'][v-1],duration:45,seed:ci*100+v,questions:make(`ch${ci}-v${v}`,ci*100+v,plan,SC10)}}
function mixed(id,title,kind,slugs,per,scores,duration,seed,scope){const plan=[];slugs.forEach((s,si)=>{const rr=Q.rng(seed+si*17);const cnt=Array.isArray(per)?per[si]:per;pickGens(s,cnt,si*2,rr).forEach(g=>plan.push([s,g,2]))});
 const rr=Q.rng(seed);const sh=Q.shuf(rr,plan);return{id,kind,chapters:slugs,title,level:'ترکیبی',duration,seed,...scope,questions:make(id,seed,sh,scores)}}
function build(){const E=[];for(let ci=1;ci<=8;ci++)for(let v=1;v<=3;v++){const e=chapterExam(ci,v);e.scopeStatus='verified-notes';e.scopeNote='دامنه مطابق جزوهٔ همین پروژه برای همان فصل.';E.push(e)}
 const S=n=>CH.filter(c=>n.includes(c.id)).map(c=>c.slug);
 const rev={scopeStatus:'needs-review',scopeNote:'دامنهٔ ترکیبی انتخابی است و به برنامهٔ رسمی تکیه ندارد.'};
 E.push(mixed('mix-1','نمونه آزمون ترکیبی ۱: مجموعه‌ها، عددهای حقیقی، توان و ریشه','combined',S([1,2,4]),4,SC12,60,5101,rev));
 E.push(mixed('mix-2','نمونه آزمون ترکیبی ۲: عبارت‌های جبری، خط و معادله‌های خطی، عبارت‌های گویا','combined',S([5,6,7]),4,SC12,60,5102,rev));
 E.push(mixed('mix-3','نمونه آزمون ترکیبی ۳: استدلال و اثبات در هندسه، توان و ریشه، حجم و مساحت','combined',S([3,4,8]),4,SC12,60,5103,rev));
 E.push(mixed('term-1','نمونه آزمون نوبت اول (فصل‌های ۱ تا ۴)','term1',S([1,2,3,4]),4,SC16,90,6101,{scopeStatus:'needs-review',scopeNote:'دامنهٔ نوبت اول (فصل ۱ تا ۴) بر پایهٔ منابع ثانویهٔ آموزشی (مثلاً سری نمونه‌سؤال‌های «نوبت اول فصل ۱ تا ۴») ثبت شده و تأیید رسمی وزارت آموزش و پرورش نشده است؛ پیش از استفادهٔ رسمی با بودجه‌بندی ابلاغی مقایسه شود.'}));
 E.push(mixed('term-2','نمونه آزمون نوبت دوم (فصل‌های ۵ تا ۸)','term2',S([5,6,7,8]),4,SC16,90,6102,{scopeStatus:'needs-review',scopeNote:'در برخی منابع، نوبت دوم کل کتاب را شامل می‌شود؛ این نمونه فقط فصل‌های ۵ تا ۸ را پوشش می‌دهد. برای آزمون کل کتاب از «آزمون جامع پایانی» استفاده کنید. دامنهٔ رسمی تأیید نشده است.'}));
 E.push(mixed('final','نمونه آزمون جامع پایانی (فصل‌های ۱ تا ۸)','final',S([1,2,3,4,5,6,7,8]),[2,2,2,2,3,3,3,3],SC20,100,7101,{scopeStatus:'needs-review',scopeNote:'ساختار این آزمون (۲۰ سؤال، ۲۰ نمره، پوشش همهٔ فصل‌ها) الگویی تقریبی است؛ ساختار رسمی آزمون پایانی از منبع معتبر راستی‌آزمایی نشده و مدعی تأیید رسمی نیست.'}));
 E.forEach(e=>{e.total=sum(e.questions.map(q=>q.score));e.count=e.questions.length});return E}
module.exports={build,sum};
