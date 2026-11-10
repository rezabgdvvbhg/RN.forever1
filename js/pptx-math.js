/* تبدیل زیرمجموعهٔ LaTeX کتاب نهم به «ران‌های متنی ویرایش‌پذیر» PowerPoint:
   توان/اندیس با superscript/subscript واقعی، کسر ساده با ⁄، رادیکال با √ و خط کسری (overline)، و کسر انباشته برای اسلاید فرمول. */
(function(root,f){const m=f();if(typeof module==='object'&&module.exports)module.exports=m;else root.RNPptxMath=m})(this,function(){
const SYM={cup:'∪',cap:'∩',in:'∈',notin:'∉',subseteq:'⊆',subset:'⊂',varnothing:'∅',emptyset:'∅',cdot:'·',times:'×',div:'÷',pm:'±',leq:'≤',le:'≤',geq:'≥',ge:'≥',neq:'≠',ne:'≠',approx:'≈',pi:'π',infty:'∞',Rightarrow:'⇒',rightarrow:'→',Leftrightarrow:'⇔',triangle:'△',angle:'∠',cong:'≅',sim:'∼',parallel:'∥',perp:'⊥',circ:'°',mid:'|',dots:'…',ldots:'…',cdots:'⋯',quad:'  ',qquad:'    ',';':' ',',':' ','!':'','{':'{','}':'}','|':'‖',left:'',right:'',displaystyle:'',alpha:'α',beta:'β',gamma:'γ',theta:'θ',hat:''};
const BB={R:'ℝ',Q:'ℚ',Z:'ℤ',N:'ℕ'};const OV='\u0305';
function grp(s,i){while(s[i]===' ')i++;if(s[i]!=='{')return[s[i]||'',i+1];let d=0;for(let j=i;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'&&--d===0)return[s.slice(i+1,j),j+1]}return[s.slice(i+1),s.length]}
const simple=t=>/^[\w.\u0600-\u06FF]{1,4}$/.test(t);
/* parse → [{t,k}] k: ''|'sup'|'sub' */
function parse(s,out){out=out||[];let buf='',i=0;const flush=()=>{if(buf){out.push({t:buf,k:''});buf=''}};const raw=x=>{const sub=parse(x,[]);return sub};
 while(i<s.length){const c=s[i];
  if(c==='\\'){const m=/^\\([A-Za-z]+|.)/.exec(s.slice(i));const cmd=m[1];i+=m[0].length;
   if(cmd==='frac'||cmd==='dfrac'){const[a,i1]=grp(s,i);const[b,i2]=grp(s,i1);i=i2;const A=flat(a),B=flat(b);flush();
     if(simple(A)&&simple(B)){out.push({t:A,k:'sup'},{t:'⁄',k:''},{t:B,k:'sub'})}else{out.push({t:'(',k:''});parse(a,out);out.push({t:')⁄(',k:''});parse(b,out);out.push({t:')',k:''})}}
   else if(cmd==='sqrt'){let idx='';if(s[i]==='['){const e=s.indexOf(']',i);idx=s.slice(i+1,e);i=e+1}const[a,i1]=grp(s,i);i=i1;const A=flat(a);flush();
     if(idx)out.push({t:idx,k:'sup'});if(/^[\w.]{1,4}$/.test(A))out.push({t:'√'+A,k:''});else{out.push({t:'√(',k:''});parse(a,out);out.push({t:')',k:''})}}
   else if(cmd==='text'||cmd==='mathrm'||cmd==='operatorname'){const[a,i1]=grp(s,i);i=i1;buf+=a}
   else if(cmd==='mathbb'){const[a,i1]=grp(s,i);i=i1;buf+=BB[a]||a}
   else if(cmd==='overline'){const[a,i1]=grp(s,i);i=i1;buf+=flat(a)}
   else if(cmd==='begin'||cmd==='end'){const[a,i1]=grp(s,i);i=i1}
   else if(cmd==='\\'||cmd==='cr'){buf+=' ; '}
   else if(Object.prototype.hasOwnProperty.call(SYM,cmd))buf+=SYM[cmd];
   else buf+=cmd.length>1?'':cmd}
  else if(c==='^'||c==='_'){const[a,i1]=grp(s,i+1);i=i1;flush();out.push({t:flat(a),k:c==='^'?'sup':'sub'})}
  else if(c==='{'||c==='}'||c===' '){i++}
  else if(c==='&'){buf+=' ';i++}
  else{buf+=c;i++}}
 flush();return out}
const flat=s=>parse(s,[]).map(r=>r.k==='sup'?'^'+(r.t.length>1?'('+r.t+')':r.t):r.k==='sub'?'_'+r.t:r.t).join('').replace(/\s+/g,' ');
const minus=t=>t.replace(/-/g,'−');
/* رشته‌ای با بخش‌های \( \) → ران‌ها. متن فارسی راست‌چین و ریاضی LTR با فونت ریاضی */
function runs(str,base,force,noIso){base=base||{};const out=[];const parts=String(str).split(/(\\\(.+?\\\))/gs);
 for(const p of parts){if(!p)continue;const isM=p.startsWith('\\(')&&p.endsWith('\\)');
  if(force||isM||/\\[A-Za-z]|\^|_\{/.test(p)){const src=isM?p.slice(2,-2):p;const seg=[];parse(src,[]).forEach(r=>{if(!r.t)return;seg.push({text:minus(r.t),options:{...base,fontFace:'Cambria Math',...(r.k==='sup'?{superscript:true}:r.k==='sub'?{subscript:true}:{})}})});seg.forEach((q,k)=>{if(k>0&&!q.options.superscript&&!q.options.subscript)q.text='\u200E'+q.text});if(seg.length&&!noIso){seg[0].text='\u202A'+seg[0].text;seg[seg.length-1].text+='\u202C'}out.push(...seg)}
  else out.push({text:p,options:{...base}})}
 return out}
const plain=str=>runs(str).map(r=>r.text).join('').replace(/[\u200E\u202A\u202C]/g,'');
/* اسلاید فرمول: بخش‌های سطح بالا؛ کسر ← انباشته */
function segments(tex){const segs=[];let i=0,buf='';const s=tex.replace(/\\displaystyle|\\,|\\;/g,'');
 while(i<s.length){if(s.startsWith('\\frac',i)||s.startsWith('\\dfrac',i)){const j=s.indexOf('{',i);const[a,i1]=grp(s,j);const[b,i2]=grp(s,i1);if(buf){segs.push({t:'txt',v:buf});buf=''}segs.push({t:'frac',n:a,d:b});i=i2}else{buf+=s[i];i++}}
 if(buf)segs.push({t:'txt',v:buf});return segs}
const wEst=(tex,size)=>{const t=flat(tex);return Math.max(.12,[...t].length*size*0.0078)};
return{parse,flat,runs,plain,segments,wEst,minus}});
