/* ===== RN.math : pure functions, no DOM ===== */
const RN={};
RN.norm=s=>String(s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٫.]/g,'.').replace(/[،؛;]/g,',').replace(/[−–—]/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/\u200c/g,'').trim();
RN.num=s=>{s=RN.norm(s);if(/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s))return Number(s);const m=s.match(/^([+-]?\d+\.?\d*)\/(\d+\.?\d*)$/);if(m&&Number(m[2])!==0)return Number(m[1])/Number(m[2]);return NaN};
RN.fmt=x=>{if(!isFinite(x))return String(x);if(Math.abs(x-Math.round(x))<1e-9)return String(Math.round(x));for(let q=2;q<=1000;q++){const p=Math.round(x*q);if(Math.abs(p/q-x)<1e-9)return p+'/'+q}return String(+x.toFixed(6))};
RN.splitTop=s=>{const o=[];let d=0,c='';for(const ch of s){if(ch=='{')d++;if(ch=='}')d--;if(ch==','&&d==0){o.push(c);c=''}else c+=ch}if(d!==0)throw new Error('آکولادها متوازن نیستند');o.push(c);return o.map(x=>x.trim()).filter(x=>x!=='')};
RN.elem=s=>{s=RN.norm(s);if(s[0]=='{'){if(s.slice(-1)!='}')throw new Error('آکولاد بسته‌نشده: '+s);return RN.canon(RN.splitTop(s.slice(1,-1)).map(RN.elem))}if(/[{}]/.test(s))throw new Error('عنصر نامعتبر: '+s);if(s=='∅')return '∅';return /^-?\d+(\.\d+)?$/.test(s)?String(Number(s)):s};
RN.cmp=(a,b)=>{const x=Number(a),y=Number(b);return (!isNaN(x)&&!isNaN(y))?x-y:(a<b?-1:a>b?1:0)};
RN.canon=arr=>{const u=[...new Set(arr)].sort(RN.cmp);return '{'+u.join(',')+'}'};
RN.parseSet=t=>{t=RN.norm(t);if(t==''||t=='∅')return {els:[],dups:0};let b=t;if(b[0]=='{'&&b.slice(-1)=='}'){const p=RN.splitTop(b);if(p.length==1)b=b.slice(1,-1)}const raw=RN.splitTop(b).map(RN.elem).filter(x=>x!='∅'||true);const els=[...new Set(raw)].sort(RN.cmp);return {els,dups:raw.length-els.length}};
RN.show=els=>els.length?'{'+els.join('، ')+'}':'∅';
RN.union=(a,b)=>[...new Set([...a,...b])].sort(RN.cmp);RN.inter=(a,b)=>a.filter(x=>b.includes(x));RN.diff=(a,b)=>a.filter(x=>!b.includes(x));
RN.sym=(a,b)=>RN.union(RN.diff(a,b),RN.diff(b,a));RN.subset=(a,b)=>a.every(x=>b.includes(x));
RN.powerset=a=>{const n=a.length,o=[];for(let m=0;m<(1<<n);m++)o.push(a.filter((_,i)=>m>>i&1));return o};
RN.stirling=n=>{const S=[[1n]];for(let i=1;i<=n;i++){S.push([0n]);for(let k=1;k<=i;k++)S[i][k]=BigInt(k)*(S[i-1][k]??0n)+(S[i-1][k-1]??0n)}return S[n]}; // S(n,k)
RN.bell=n=>RN.stirling(n).reduce((a,b)=>a+b,0n);
RN.partitions=a=>{const out=[];const rec=(i,bl)=>{if(i==a.length){out.push(bl.map(b=>b.slice()));return}for(const b of bl){b.push(a[i]);rec(i+1,bl);b.pop()}bl.push([a[i]]);rec(i+1,bl);bl.pop()};rec(0,[]);return out};
RN.boolPoset=n=>{const N=1<<n,lt=(x,y)=>x!==y&&(x&y)===x;const comp=(x,y)=>lt(x,y)||lt(y,x);
 const ch=new Array(N).fill(0);const ord=[...Array(N).keys()].sort((x,y)=>pc(x)-pc(y));function pc(v){let c=0;while(v){c+=v&1;v>>=1}return c}
 for(const x of ord){ch[x]=1;for(let y=0;y<N;y++)if(lt(y,x))ch[x]+=ch[y]}
 const chains=ch.reduce((a,b)=>a+b,0);let anti=0,maxAnti=0,maxSize=0;
 for(let m=0;m<(1<<N);m++){const e=[];for(let i=0;i<N;i++)if(m>>i&1)e.push(i);let ok=true;for(let i=0;i<e.length&&ok;i++)for(let j=i+1;j<e.length;j++)if(comp(e[i],e[j])){ok=false;break}
  if(!ok)continue;anti++;maxSize=Math.max(maxSize,e.length);let ext=false;for(let z=0;z<N&&!ext;z++){if(m>>z&1)continue;if(e.every(y=>!comp(y,z)))ext=true}if(!ext)maxAnti++}
 let f=1;for(let i=2;i<=n;i++)f*=i;return {chains,antichains:anti,maximalAntichains:maxAnti,maxAntichainSize:maxSize,maximalChains:f,maxChainSize:n+1}};
RN.isChain=f=>f.every((a,i)=>f.every((b,j)=>i==j||RN.subset(a,b)||RN.subset(b,a)));
RN.isAnti=f=>f.every((a,i)=>f.every((b,j)=>i==j||(!RN.subset(a,b)&&!RN.subset(b,a))));
RN.setsOf=s=>RN.splitTop(RN.norm(s)).map(x=>RN.parseSet(x).els);
/* radicals */
RN.simplifyRoot=(n,k)=>{let out=1,rem=n;for(let p=2;Math.pow(p,k)<=rem;p++){const pk=Math.pow(p,k);while(rem%pk===0){rem/=pk;out*=p}}return {out,rem}};
/* polynomials (single variable x), coeff index = degree */
RN.polyParse=src=>{const s=RN.norm(src).replace(/\s+/g,'').replace(/\^/g,'^').replace(/X/g,'x');if(!s)throw new Error('عبارت خالی است');const t=[];let i=0;
 while(i<s.length){const c=s[i];if(/[\d.]/.test(c)){let j=i;while(j<s.length&&/[\d.]/.test(s[j]))j++;const v=Number(s.slice(i,j));if(isNaN(v))throw new Error('عدد نامعتبر');t.push(['n',v]);i=j}else if(c=='x'){t.push(['x']);i++}else if('+-*/^()'.includes(c)){t.push([c]);i++}else throw new Error('نماد نامعتبر: «'+c+'»')}
 let p=0;const pk=()=>t[p]&&t[p][0];
 const add=(a,b,sg=1)=>{const r=[];for(let i=0;i<Math.max(a.length,b.length);i++)r[i]=(a[i]||0)+sg*(b[i]||0);return RN.trim(r)};
 const mul=(a,b)=>{const r=new Array(a.length+b.length-1).fill(0);a.forEach((x,i)=>b.forEach((y,j)=>r[i+j]+=x*y));return RN.trim(r)};
 function expr(){let a=term();while(pk()=='+'||pk()=='-'){const o=t[p++][0];a=add(a,term(),o=='+'?1:-1)}return a}
 function term(){let a=unary();while(pk()=='*'||pk()=='/'||pk()=='n'||pk()=='x'||pk()=='('){if(pk()=='/'){p++;const d=unary();if(d.length!=1||d[0]==0)throw new Error('تقسیم فقط بر عدد ناصفر مجاز است');a=a.map(v=>v/d[0])}else{if(pk()=='*')p++;a=mul(a,unary())}}return a}
 function unary(){if(pk()=='-'){p++;return unary().map(v=>-v)}if(pk()=='+'){p++;return unary()}return pow()}
 function pow(){let b=atom();if(pk()=='^'){p++;let neg=1;if(pk()=='-'){p++;neg=-1}if(pk()!='n')throw new Error('توان باید عدد صحیح نامنفی باشد');const e=t[p++][1]*neg;if(!Number.isInteger(e)||e<0||e>30)throw new Error('توان باید عدد صحیح بین ۰ و ۳۰ باشد');let r=[1];for(let k=0;k<e;k++)r=mul(r,b);b=r}return b}
 function atom(){const k=pk();if(k=='n')return [t[p++][1]];if(k=='x'){p++;return [0,1]}if(k=='('){p++;const v=expr();if(pk()!=')')throw new Error('پرانتز بسته نشده');p++;return v}throw new Error('عبارت ناقص یا نامعتبر است')}
 const r=expr();if(p<t.length)throw new Error('عبارت نامعتبر است');return r};
RN.trim=a=>{a=a.map(v=>Math.abs(v)<1e-12?0:v);while(a.length>1&&a[a.length-1]==0)a.pop();return a.length?a:[0]};
RN.polyStr=a=>{const ts=[];for(let d=a.length-1;d>=0;d--){const c=a[d];if(c==0)continue;const ab=Math.abs(c);let body=(d==0||Math.abs(ab-1)>1e-9)?RN.fmt(ab):'';if(d>0)body+=d>1?'x^'+d:'x';ts.push((c<0?'-':'+')+body)}if(!ts.length)return '0';let s=ts.join('');return s[0]=='+'?s.slice(1):s.replace(/^-/,'-')};
RN.polyEval=(a,x)=>a.reduceRight((s,c)=>s*x+c,0);
RN.polyDivmod=(a,b)=>{a=a.slice();const q=new Array(Math.max(a.length-b.length+1,1)).fill(0);for(let i=a.length-b.length;i>=0;i--){const c=a[i+b.length-1]/b[b.length-1];q[i]=c;for(let j=0;j<b.length;j++)a[i+j]-=c*b[j]}return {q:RN.trim(q),r:RN.trim(a.slice(0,Math.max(b.length-1,1)))}};
RN.polyGcd=(a,b)=>{while(!(b.length==1&&Math.abs(b[0])<1e-9)){const r=RN.polyDivmod(a,b).r;a=b;b=r}return a.map(v=>v/a[a.length-1])};
RN.realRoots=a=>{a=RN.trim(a);if(a.length==2)return [-a[0]/a[1]];if(a.length==3){const D=a[1]*a[1]-4*a[2]*a[0];if(D<-1e-12)return [];if(Math.abs(D)<1e-12)return [-a[1]/(2*a[2])];const s=Math.sqrt(D);return [(-a[1]-s)/(2*a[2]),(-a[1]+s)/(2*a[2])].sort((x,y)=>x-y)}return null};
RN.line=(x1,y1,x2,y2)=>{if(x1==x2&&y1==y2)return {err:'دو نقطه یکسان‌اند و خط یکتا نیست'};if(x1==x2)return {vertical:true,x:x1};const m=(y2-y1)/(x2-x1);return {m,b:y1-m*x1}};
RN.solveLinear=(a,b,c,d)=>{const A=a-c,B=d-b;if(A==0)return B==0?{type:'inf'}:{type:'none'};return {type:'one',x:B/A}};
RN.tri=(a,b,c)=>{if([a,b,c].some(v=>!(v>0)))return {err:'اضلاع باید مثبت باشند'};const s=[a,b,c].sort((x,y)=>x-y);if(s[0]+s[1]<=s[2])return {err:'نامساوی مثلث برقرار نیست'};const ang=(x,y,z)=>Math.acos((y*y+z*z-x*x)/(2*y*z))*180/Math.PI;const p=(a+b+c)/2;return {sides:s,angles:[ang(s[0],s[1],s[2]),ang(s[1],s[0],s[2]),ang(s[2],s[0],s[1])],area:Math.sqrt(p*(p-a)*(p-b)*(p-c)),perim:a+b+c}};
RN.solids={
 sphere:{n:'کره',f:['r'],V:r=>4/3*Math.PI*r**3,S:r=>4*Math.PI*r*r},
 cone:{n:'مخروط',f:['r','h'],V:(r,h)=>Math.PI*r*r*h/3,S:(r,h)=>Math.PI*r*(r+Math.hypot(r,h))},
 cylinder:{n:'استوانه',f:['r','h'],V:(r,h)=>Math.PI*r*r*h,S:(r,h)=>2*Math.PI*r*(r+h)},
 pyramid:{n:'هرم با قاعدهٔ مربع',f:['a','h'],V:(a,h)=>a*a*h/3,S:(a,h)=>a*a+2*a*Math.hypot(h,a/2)},
 cuboid:{n:'مکعب‌مستطیل',f:['a','b','c'],V:(a,b,c)=>a*b*c,S:(a,b,c)=>2*(a*b+b*c+a*c)}};
if(typeof module!=='undefined')module.exports=RN;
