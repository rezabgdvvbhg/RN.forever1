/* اعتبارسنجی خروجی هوش مصنوعی + ابزارهای متن — مشترک بین سرور و مرورگر */
(function(root,f){const m=f();if(typeof module==='object'&&module.exports)module.exports=m;else root.RNShared=m})(this,function(){
const clip=(s,n)=>String(s==null?'':s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,n);
const QTYPES={descriptive:'تشریحی',mcq:'چهارگزینه‌ای',truefalse:'درست/نادرست',fill:'جای‌خالی',short:'کوتاه‌پاسخ'};
const LEVELS={easy:'آسان',medium:'متوسط',hard:'دشوار',mixed:'ترکیبی'};
/* آزمون */
function validateExam(raw,opt){opt=opt||{};let o=raw;if(typeof o==='string'){try{o=JSON.parse(o)}catch(e){throw new Error('خروجی مدل JSON معتبر نبود')}}
 if(!o||typeof o!=='object'||!Array.isArray(o.questions)||!o.questions.length)throw new Error('ساختار آزمون نامعتبر است (آرایهٔ questions یافت نشد)');
 const max=opt.maxQuestions||40;const qs=o.questions.slice(0,max).map((q,i)=>{
  if(!q||typeof q!=='object')throw new Error('سؤال '+(i+1)+' نامعتبر است');
  const type=Object.prototype.hasOwnProperty.call(QTYPES,q.type)?q.type:'descriptive';const text=clip(q.text,1500);if(!text)throw new Error('متن سؤال '+(i+1)+' خالی است');
  const r={type,text,score:Math.max(0,Math.min(100,Number(q.score)||0)),level:Object.prototype.hasOwnProperty.call(LEVELS,q.level)&&q.level!=='mixed'?q.level:'medium'};
  if(type==='mcq'){const op=Array.isArray(q.options)?q.options.slice(0,4).map(x=>clip(x,300)):[];if(op.length!==4||op.some(x=>!x))throw new Error('سؤال '+(i+1)+': چهارگزینه‌ای باید دقیقاً چهار گزینهٔ پر داشته باشد');r.options=op;}
  r.answer=clip(q.answer,1500);
  if(opt.barem){r.barem=(Array.isArray(q.barem)?q.barem:[]).slice(0,8).map(b=>({step:clip(b&&b.step,300),score:Math.max(0,Math.min(100,Number(b&&b.score)||0))})).filter(b=>b.step)}
  return r});
 return {title:clip(o.title,150)||'آزمون ریاضی نهم',questions:qs}}
/* تقسیم نمرهٔ کل به‌صورت مساوی (در صورت نبود نمره)، با مجموع دقیق */
function distributeScores(qs,total){const n=qs.length;if(!n)return qs;const base=Math.floor(total/n*4)/4;let sum=0;qs.forEach(q=>{q.score=base;sum+=base});qs[n-1].score=Math.round((qs[n-1].score+total-sum)*100)/100;return qs}
/* اسلاید */
const STYPES=['title','content','concept','example','steps','formula','compare','diagram','practice','summary'];
const DKINDS=['venn','numberline','rtriangle'];
function cleanDiagram(d){if(!d||typeof d!=='object'||!DKINDS.includes(d.kind))return undefined;const c=x=>clip(x,40);
 if(d.kind==='venn')return{kind:'venn',a:c(d.a)||'A',b:c(d.b)||'B',onlyA:c(d.onlyA),both:c(d.both),onlyB:c(d.onlyB),outside:c(d.outside)};
 if(d.kind==='rtriangle')return{kind:'rtriangle',a:clip(d.a,12),b:clip(d.b,12),c:clip(d.c,12)};
 let mn=Number(d.min),mx=Number(d.max);if(!isFinite(mn)||!isFinite(mx)||mx<=mn||mx-mn>24){mn=-5;mx=5}
 return{kind:'numberline',min:Math.round(mn),max:Math.round(mx),points:(Array.isArray(d.points)?d.points:[]).slice(0,6).map(p=>({v:Number(p&&p.v),label:clip(p&&p.label,16)})).filter(p=>isFinite(p.v)&&p.v>=mn&&p.v<=mx)}}
function validateDeck(raw,opt){opt=opt||{};let o=raw;if(typeof o==='string'){try{o=JSON.parse(o)}catch(e){throw new Error('خروجی مدل JSON معتبر نبود')}}
 if(!o||typeof o!=='object'||!Array.isArray(o.slides)||!o.slides.length)throw new Error('ساختار ارائه نامعتبر است (آرایهٔ slides یافت نشد)');
 const side=x=>x&&typeof x==='object'?{title:clip(x.title,60),bullets:(Array.isArray(x.bullets)?x.bullets:[]).slice(0,5).map(b=>clip(b,160)).filter(Boolean)}:undefined;
 const slides=o.slides.slice(0,opt.maxSlides||25).map((s,i)=>{if(!s||typeof s!=='object')throw new Error('اسلاید '+(i+1)+' نامعتبر است');
  const type=STYPES.includes(s.type)?s.type:'content';const title=clip(s.title,120);if(!title)throw new Error('عنوان اسلاید '+(i+1)+' خالی است');
  const r={type,title,bullets:(Array.isArray(s.bullets)?s.bullets:[]).slice(0,type==='steps'||type==='practice'?8:7).map(b=>clip(b,220)).filter(Boolean)};
  if(s.formula)r.formula=clip(s.formula,200);if(s.problem)r.problem=clip(s.problem,400);if(s.solution)r.solution=clip(s.solution,700);if(s.note)r.note=clip(s.note,200);
  if(type==='compare'){r.left=side(s.left)||{title:'',bullets:[]};r.right=side(s.right)||{title:'',bullets:[]}}
  if(type==='diagram'){r.diagram=cleanDiagram(s.diagram);if(!r.diagram)r.type='content'}
  return r});
 return {title:clip(o.title,120)||'ارائهٔ ریاضی',subtitle:clip(o.subtitle,160),chapter:clip(o.chapter,80),slides}}
/* LaTeX → متن یونیکد خوانا (برای PPTX و خروجی متنی) */
const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','n':'ⁿ','-':'⁻','+':'⁺'},SUB={'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'};
const SYM={'\\cup':'∪','\\cap':'∩','\\in':'∈','\\notin':'∉','\\subseteq':'⊆','\\subset':'⊂','\\varnothing':'∅','\\emptyset':'∅','\\mid':'|','\\cdot':'·','\\times':'×','\\div':'÷','\\pm':'±','\\leq':'≤','\\le':'≤','\\geq':'≥','\\ge':'≥','\\neq':'≠','\\ne':'≠','\\approx':'≈','\\pi':'π','\\infty':'∞','\\Rightarrow':'⇒','\\rightarrow':'→','\\Leftrightarrow':'⇔','\\mathbb{R}':'ℝ','\\mathbb{Q}':'ℚ','\\mathbb{Z}':'ℤ','\\mathbb{N}':'ℕ','\\triangle':'△','\\angle':'∠','\\cong':'≅','\\sim':'∼','\\parallel':'∥','\\perp':'⊥','\\quad':' ','\\,':' ','\\ ':' ','\\{':'{','\\}':'}','\\left':'','\\right':'','\\overline':''};
function texToPlain(t){let s=String(t||'');
 const grp=(str,i)=>{if(str[i]!=='{')return null;let d=0;for(let j=i;j<str.length;j++){if(str[j]==='{')d++;else if(str[j]==='}'&&--d===0)return[str.slice(i+1,j),j+1]}return null};
 for(let g=0;g<8;g++){let ch=false;
  for(let k=0;k<20;k++){const m=/\\d?frac\s*/.exec(s);if(!m)break;const A=grp(s,m.index+m[0].length),B=A&&grp(s,A[1]);if(!B)break;ch=true;const w=x=>/^[\w.²³]+$/.test(x)?x:'('+x+')';s=s.slice(0,m.index)+w(A[0])+'/'+w(B[0])+s.slice(B[1])}
  s=s.replace(/\\sqrt\[(\d+)\]\{([^{}]*)\}/g,(m,k,x)=>{ch=true;return (SUP[k]||'^'+k)+'√('+x+')'}).replace(/\\sqrt\{([^{}]*)\}/g,(m,x)=>{ch=true;return '√('+x+')'}).replace(/\\text\{([^{}]*)\}/g,(m,x)=>{ch=true;return x});
  if(!ch)break}
 s=s.replace(/\\mathbb\{[RQZN]\}/g,m=>SYM[m]).replace(/\\[A-Za-z]+ ?|\\[{}, ]/g,m=>SYM[m.trim()]!==undefined?SYM[m.trim()]:m.replace(/^\\/,''));
 s=s.replace(/\^\{([^{}]*)\}/g,(m,x)=>[...x].every(c=>SUP[c])?[...x].map(c=>SUP[c]).join(''):'^('+x+')').replace(/\^([0-9n])/g,(m,x)=>SUP[x]).replace(/_\{([^{}]*)\}/g,(m,x)=>[...x].every(c=>SUB[c])?[...x].map(c=>SUB[c]).join(''):'_('+x+')').replace(/_([0-9])/g,(m,x)=>SUB[x]);
 return s.replace(/[{}]/g,'').replace(/\s+/g,' ').trim()}
return{QTYPES,LEVELS,STYPES,validateExam,validateDeck,distributeScores,texToPlain,clip}});
