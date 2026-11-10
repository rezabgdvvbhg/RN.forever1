/* «پروندهٔ صفر» — هستهٔ بازی (منطق خالص، بدون DOM)؛ قابل اجرا در Node برای آزمون خودکار.
   جهان: رصدخانهٔ متروک با سه تالار. هر معما بخشی از جهان است:
   ۱) پل سنگ‌ها (فصل ۲: گویا/گنگ)  ۲) ترازو و جعبه‌ها (فصل ۴: توان و ریشه، قدر مطلق)  ۳) پرتوی صفر (فصل ۶: خط و شیب). */
(function(root,f){const m=f();if(typeof module==='object'&&module.exports)module.exports=m;else root.ZF=m})(this,function(){
const W=14,H=9,DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const isSq=n=>Number.isInteger(Math.sqrt(n));
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a};
const frac=(n,d=1)=>{if(d<0){n=-n;d=-d}const g=gcd(n,d)||1;return{n:n/g,d:d/g}};
const feq=(a,b)=>a.n*b.d===b.n*a.d;
const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
const sup=s=>[...String(s)].map(c=>SUP[c]||c).join('');
/* ── اعداد: رده‌بندی ریاضیِ واقعی (نه برچسب دستی) ── */
function classify(it){switch(it.k){case'sqrt':case'nsqrt':return{rational:isSq(it.n)};case'mul':return{rational:isSq(it.n)};case'pi':return{rational:false};case'frac':case'dec':return{rational:true};default:throw new Error('نوع نامعتبر')}}
function stoneLabel(it){switch(it.k){case'sqrt':return'√'+it.n;case'nsqrt':return'−√'+it.n;case'mul':return it.c+'√'+it.n;case'pi':return'π';case'frac':return it.a+'/'+it.b;case'dec':return it.v}}
/* ── ارزش عبارت جعبه‌ها (کسر دقیق) ── */
function evalExpr(e){switch(e.k){case'sqrt':if(!isSq(e.n))throw new Error('جذر کامل نیست');return frac(Math.sqrt(e.n));case'pow':return e.e>=0?frac(Math.pow(e.b,e.e)):frac(1,Math.pow(e.b,-e.e));case'abs':return frac(Math.abs(e.v));case'sqrtfrac':return frac(Math.sqrt(e.a),Math.sqrt(e.b));default:throw new Error('نوع نامعتبر')}}
function exprLabel(e){switch(e.k){case'sqrt':return'√'+e.n;case'pow':return e.b+sup(e.e);case'abs':return'|'+(e.v<0?'−'+(-e.v):e.v)+'|';case'sqrtfrac':return'√('+e.a+'/'+e.b+')'}}
const valLabel=v=>v.d===1?String(v.n):v.n+'/'+v.d;
/* ── دادهٔ مرحله‌ها (چند گونه برای بازی دوباره) ── */
const SAFE_POOL=[{k:'sqrt',n:2},{k:'sqrt',n:3},{k:'sqrt',n:5},{k:'sqrt',n:6},{k:'sqrt',n:7},{k:'pi'},{k:'nsqrt',n:2},{k:'mul',c:2,n:3},{k:'sqrt',n:10},{k:'sqrt',n:11},{k:'nsqrt',n:5},{k:'mul',c:3,n:2},{k:'sqrt',n:13},{k:'sqrt',n:8}];
const RAT_POOL=[{k:'sqrt',n:4},{k:'sqrt',n:9},{k:'sqrt',n:16},{k:'frac',a:1,b:2},{k:'frac',a:3,b:4},{k:'dec',v:'0.25'},{k:'sqrt',n:25},{k:'frac',a:22,b:7},{k:'nsqrt',n:36},{k:'sqrt',n:49},{k:'frac',a:5,b:3},{k:'dec',v:'0.5'},{k:'sqrt',n:64},{k:'mul',c:2,n:9}];
const R1V=[{rule:'irrational',mask:['00111000','11101111','01000100']},{rule:'rational',mask:['00011000','01111111','11000100']}];
const R2V=[
 {crates:[{x:4,y:4,e:{k:'sqrt',n:36}},{x:7,y:5,e:{k:'pow',b:2,e:3}},{x:10,y:4,e:{k:'abs',v:-4}}],plates:[{x:3,y:1,v:frac(4)},{x:6,y:1,v:frac(8)},{x:9,y:1,v:frac(6)}]},
 {crates:[{x:3,y:4,e:{k:'pow',b:3,e:2}},{x:6,y:5,e:{k:'sqrt',n:16}},{x:9,y:4,e:{k:'abs',v:-5}}],plates:[{x:4,y:1,v:frac(4)},{x:7,y:1,v:frac(5)},{x:10,y:1,v:frac(9)}]},
 {crates:[{x:4,y:4,e:{k:'pow',b:2,e:-3}},{x:7,y:4,e:{k:'sqrtfrac',a:1,b:4}},{x:10,y:5,e:{k:'pow',b:5,e:0}}],plates:[{x:3,y:1,v:frac(1)},{x:6,y:1,v:frac(1,8)},{x:9,y:1,v:frac(1,2)}]}];
const R3V=[{s:[[-2,-1],[2,3]]},{s:[[-3,3],[1,-1]]},{s:[[-2,0],[2,2]]}];
const ORG={x:6,y:4}; // مبدأ مختصات روی کاشی
const NOTES={
 n_start:{t:'دفترچهٔ نگهبان — شب خاموشی',x:'«بایگانی صفر» بسته شد و برق رصدخانه رفت. کلید آن سه قفل ریاضی دارد: عددها، ترازو و پرتو. (داستان این بازی ساختگی است؛ ریاضیِ آن واقعی است.)'},
 n_irr:{t:'قفل اول: پل سنگ‌ها',x:'عددی گنگ است که نتوان آن را به‌صورت کسر نوشت؛ مثل √۲ و π. جذر عددی که مربع کامل نیست گنگ است (√۱۶=۴ گویاست). پل فقط عددهای مجاز را تحمل می‌کند.'},
 n_irr2:{t:'یادداشت پل',x:'از لبهٔ چپ شروع کن و فقط روی سنگ‌های مجاز قدم بگذار. سنگ نادرست خرد می‌شود و می‌افتی؛ دوباره از لبه شروع می‌کنی.'},
 n_scale:{t:'قفل دوم: ترازو',x:'هر جعبه یک عبارت دارد و هر صفحه یک عدد. جعبه را روی صفحه‌ای بگذار که ارزشش با آن برابر است: √۳۶=۶ ، ۲³=۸ ، |−۴|=۴ ، ۲⁻³=۱/۸. جعبه را فقط می‌شود هل داد؛ اگر گیر کرد، R را بزن.'},
 n_laser:{t:'قفل سوم: پرتوی صفر',x:'پرتو روی خط y=mx+b حرکت می‌کند. m شیب و b عرض از مبدأ است. دو حسگر را با یک خط بیدار کن. شیب = (y₂−y₁)/(x₂−x₁).'},
 n_end:{t:'پروندهٔ صفر',x:'درون پوشه فقط یک برگ بود: «هر عدد جایی دارد؛ هر قاعده‌ای دلیلی». تو سه قفل را با ریاضی باز کردی، نه با زور.'}};
const ROOMS=[{name:'تالار اول: پل سنگ‌ها',mission:'عبور از پرتگاه',chapter:'real-numbers'},{name:'تالار دوم: ترازو',mission:'جعبه‌ها و صفحه‌ها',chapter:'power-root'},{name:'تالار سوم: پرتوی صفر',mission:'خط از میان حسگرها',chapter:'linear-equations'}];
function roomMap(r){const g=[];for(let y=0;y<H;y++){g.push([]);for(let x=0;x<W;x++)g[y].push(x===0||y===0||x===W-1||y===H-1?'#':'.')}
 if(r===0)for(let y=1;y<H-1;y++)for(let x=3;x<=10;x++)g[y][x]='p';
 g[4][13]='D';return g}
/* ── ساخت بازی ── */
function createGame(opt){opt=opt||{};const v=Object.assign({r1:0,r2:0,r3:0},opt.variant||{});const S={v,room:0,mission:0,px:1,py:7,face:'right',time:0,over:false,paused:false,sub:null,toast:null,events:[],seen:{},journal:[],assisted:false,
  stats:{falls:0,wrong:0,resets:0,hints:0,steps:0,dials:0,skips:0},doors:[false,false,false],maps:[0,1,2].map(roomMap),props:[],rooms:{}};
 const r1=R1V[v.r1],pool=r1.rule==='irrational'?SAFE_POOL:RAT_POOL,other=r1.rule==='irrational'?RAT_POOL:SAFE_POOL;let a=0,b=0;S.rooms.r1={rule:r1.rule,stones:[],lever:false};
 r1.mask.forEach((row,ri)=>[...row].forEach((c,ci)=>{const safe=c==='1';const it=safe?pool[(a++*3+ri+v.r1)%pool.length]:other[(b++*5+ci+ri)%other.length];S.rooms.r1.stones.push({x:3+ci,y:3+ri,item:it,label:stoneLabel(it),state:'ok'})}));
 const r2=R2V[v.r2];S.rooms.r2={crates:r2.crates.map((c,i)=>({id:i,x:c.x,y:c.y,sx:c.x,sy:c.y,e:c.e,label:exprLabel(c.e),val:evalExpr(c.e)})),plates:r2.plates.map(p=>({x:p.x,y:p.y,v:p.v,label:valLabel(p.v),ok:false,wrong:false}))};
 const sens=R3V[v.r3].s;S.rooms.r3={m:0,b:0,sensors:sens.map(([x,y])=>({mx:x,my:y,x:ORG.x+x,y:ORG.y-y,lit:false})),solved:false};
 S.props=[[{x:1,y:6,type:'term',note:'n_start'},{x:1,y:2,type:'term',note:'n_irr'},{x:2,y:2,type:'term',note:'n_irr2'},{x:12,y:2,type:'lever'}],[{x:1,y:1,type:'term',note:'n_scale'}],[{x:1,y:7,type:'console'},{x:2,y:1,type:'term',note:'n_laser'}]];
 S.starts=[{x:1,y:7},{x:1,y:7},{x:1,y:4}];S.px=S.starts[0].x;S.py=S.starts[0].y;
 if(opt.startRoom>0&&opt.startRoom<=2){for(let r=0;r<opt.startRoom;r++){S.doors[r]=true;S.maps[r][4][13]='E'}S.room=S.mission=opt.startRoom;S.px=S.starts[S.room].x;S.py=S.starts[S.room].y;if(Array.isArray(opt.journal))S.journal=opt.journal.filter(x=>NOTES[x])}
 toast(S,S.room?`ادامه از «${ROOMS[S.room].name}».`:'به رصدخانه خوش آمدی. با جهت‌ها حرکت کن، با E بخوان و تعامل کن.');return S}
function toast(S,t,ttl=4){S.toast={t,ttl}}
function ev(S,type,d){S.events.push(Object.assign({type},d||{}))}
const stoneAt=(S,x,y)=>S.rooms.r1.stones.find(s=>s.x===x&&s.y===y);
const crateAt=(S,x,y)=>S.room===1?S.rooms.r2.crates.find(c=>c.x===x&&c.y===y):null;
const plateAt=(S,x,y)=>S.room===1?S.rooms.r2.plates.find(p=>p.x===x&&p.y===y):null;
const propAt=(S,x,y)=>S.props[S.room].find(p=>p.x===x&&p.y===y);
function stoneSafe(S,st){return classify(st.item).rational===(S.rooms.r1.rule==='rational')}
function tile(S,x,y){if(x<0||y<0||x>=W||y>=H)return'#';return S.maps[S.room][y][x]}
/* ── معما ۱: حل/راهنما ── */
function safePath(S){const st=S.rooms.r1.stones.filter(s=>s.state==='ok'&&stoneSafe(S,s)),key=(x,y)=>x+','+y,map=new Map(st.map(s=>[key(s.x,s.y),s]));const q=[],prev=new Map();st.filter(s=>s.x===3).forEach(s=>{q.push(s);prev.set(key(s.x,s.y),null)});
 while(q.length){const c=q.shift();if(c.x===10){const p=[];let k=c;while(k){p.unshift(k);k=prev.get(key(k.x,k.y))}return p}for(const[dx,dy]of Object.values(DIRS)){const n=map.get(key(c.x+dx,c.y+dy));if(n&&!prev.has(key(n.x,n.y))){prev.set(key(n.x,n.y),c);q.push(n)}}}return null}
/* ── معما ۲ ── */
function updatePlates(S){const R=S.rooms.r2;let all=true;R.plates.forEach(p=>{const c=R.crates.find(c=>c.x===p.x&&c.y===p.y);p.ok=!!c&&feq(c.val,p.v);const w=!!c&&!p.ok;if(w&&!p.wrong){S.stats.wrong++;ev(S,'wrong',{x:p.x,y:p.y});toast(S,`این جعبه ارزشش با صفحهٔ «${p.label}» برابر نیست.`)}p.wrong=w;if(!p.ok)all=false});
 if(all&&!S.doors[1]){S.doors[1]=true;S.maps[1][4][13]='E';ev(S,'door',{room:1});toast(S,'ترازو برقرار شد. در شرقی باز شد!');}}
/* ── معما ۳ ── */
function beamHits(R,s){return Math.abs(R.m*s.mx+R.b-s.my)<1e-9}
function updateBeam(S){const R=S.rooms.r3;R.sensors.forEach(s=>s.lit=beamHits(R,s));const all=R.sensors.every(s=>s.lit);if(all&&!R.solved){R.solved=true;S.doors[2]=true;S.maps[2][4][13]='E';ev(S,'door',{room:2});toast(S,'هر دو حسگر بیدار شدند. درِ گنجه باز شد!')}if(!all&&R.solved&&!S.assisted){R.solved=false;S.doors[2]=false;S.maps[2][4][13]='D'}}
/* ── حرکت ── */
function move(S,dir){if(S.over||S.paused||S.sub==='console'||S.sub==='ending')return false;const[dx,dy]=DIRS[dir];S.face=dir;const nx=S.px+dx,ny=S.py+dy;const t=tile(S,nx,ny);
 if(t==='#')return false;
 if(t==='D'){toast(S,'در بسته است؛ باید معمای این تالار را حل کنی.');return false}
 if(t==='E'){if(S.room<2){S.room++;S.px=S.starts[S.room].x;S.py=S.starts[S.room].y;S.mission=Math.max(S.mission,S.room);ev(S,'room',{room:S.room});toast(S,ROOMS[S.room].name);S.stats.steps++;return true}else{S.sub='ending';S.over=false;ev(S,'ending');return true}}
 if(S.room===0&&t==='p'){const st=stoneAt(S,nx,ny);if(!st||st.state==='crumbled'){toast(S,'پرتگاه! فقط روی سنگ‌ها می‌شود رفت.');return false}
  if(stoneSafe(S,st)){S.px=nx;S.py=ny;S.stats.steps++;ev(S,'step');return true}
  st.state='crumbled';S.stats.falls++;const rat=classify(st.item).rational;ev(S,'fall',{x:nx,y:ny,label:st.label});
  toast(S,`سنگ «${st.label}» خرد شد: این عدد ${rat?'گویاست':'گنگ است (جذر عددی که مربع کامل نیست گنگ است)'}. از لبه دوباره شروع کن.${S.stats.falls%3===0?' راهنمایی: کلید H.':''}`,8);S.px=S.starts[0].x;S.py=S.starts[0].y;
  return true}
 const c=crateAt(S,nx,ny);
 if(c){const bx=nx+dx,by=ny+dy;if(tile(S,bx,by)!=='.'||crateAt(S,bx,by)||propAt(S,bx,by)){toast(S,'جعبه تکان نمی‌خورد.',2);return false}c.x=bx;c.y=by;S.px=nx;S.py=ny;S.stats.steps++;ev(S,'push');updatePlates(S);return true}
 if(propAt(S,nx,ny)&&!(propAt(S,nx,ny).type==='term'&&false)){const p=propAt(S,nx,ny);if(p.type!=='plate'){toast(S,'با E با این شیء تعامل کن.',2);return false}}
 S.px=nx;S.py=ny;S.stats.steps++;ev(S,'step');
 if(S.room===0&&S.px>=11&&!S.rooms.r1.arrived){S.rooms.r1.arrived=true;toast(S,'به لبهٔ شرقی رسیدی. اهرم را پیدا کن.')}
 return true}
function adjacentProp(S){const[dx,dy]=DIRS[S.face];const order=[[S.px+dx,S.py+dy],...Object.values(DIRS).map(([a,b])=>[S.px+a,S.py+b])];for(const[x,y]of order){const p=propAt(S,x,y);if(p)return p}return null}
function addNote(S,id){if(!S.journal.includes(id)){S.journal.push(id);ev(S,'note',{id})}}
function interact(S){if(S.over||S.paused)return null;if(S.sub==='note'){closeNote(S);return{type:'note-close'}}if(S.sub==='console'){S.sub=null;return{type:'console-exit'}}if(S.sub==='ending')return null;const p=adjacentProp(S);if(!p){toast(S,'اینجا چیزی برای تعامل نیست.',2);return null}
 if(p.type==='term'){addNote(S,p.note);S.sub='note';S.noteOpen=p.note;return{type:'note',id:p.note}}
 if(p.type==='lever'){if(!S.rooms.r1.arrived&&S.px<11){toast(S,'اهرم از اینجا دور است.',2);return null}if(!S.doors[0]){S.doors[0]=true;S.rooms.r1.lever=true;S.maps[0][4][13]='E';ev(S,'door',{room:0});toast(S,'اهرم پایین آمد. در شرقی باز شد!')}return{type:'lever'}}
 if(p.type==='console'){S.sub='console';addNote(S,'n_laser');toast(S,'پنل پرتو: ← → شیب، ↑ ↓ عرض از مبدأ، E برای خروج.',6);return{type:'console'}}return null}
function closeNote(S){if(S.sub==='note'){S.sub=null;S.noteOpen=null}}
function consoleKey(S,k){if(S.sub!=='console')return false;const R=S.rooms.r3;S.stats.dials++;if(k==='left')R.m=Math.max(-3,R.m-.5);else if(k==='right')R.m=Math.min(3,R.m+.5);else if(k==='up')R.b=Math.min(4,R.b+1);else if(k==='down')R.b=Math.max(-4,R.b-1);else{S.stats.dials--;return false}updateBeam(S);ev(S,'dial');if(S.stats.dials===24)toast(S,'راهنما: شیب را از دو حسگر حساب کن: Δy÷Δx؛ سپس b را از یکی از آن‌ها.',9);return true}
function resetRoom(S){if(S.over||S.paused||S.sub==='ending')return false;S.stats.resets++;if(S.room===0){S.rooms.r1.stones.forEach(s=>s.state='ok');S.px=S.starts[0].x;S.py=S.starts[0].y}
 else if(S.room===1){S.rooms.r2.crates.forEach(c=>{c.x=c.sx;c.y=c.sy});S.rooms.r2.plates.forEach(p=>{p.ok=false;p.wrong=false});S.px=S.starts[1].x;S.py=S.starts[1].y;if(S.doors[1]){S.doors[1]=false;S.maps[1][4][13]='D'}}
 else{S.rooms.r3.m=0;S.rooms.r3.b=0;updateBeam(S);S.px=S.starts[2].x;S.py=S.starts[2].y;S.sub=null}toast(S,'تالار از نو چیده شد.',2);return true}
/* راهنما: بدون جریمهٔ امتیاز پنهان؛ فقط در آمار ثبت می‌شود */
function useHint(S){if(S.over||S.paused)return null;S.stats.hints++;
 if(S.room===0){const p=safePath(S);if(p){const next=p.find(s=>s.state==='ok'&&!s.hinted);if(next){next.hinted=true}toast(S,'سنگ‌های روشن‌شده مجازند. قاعدهٔ این تالار: '+(S.rooms.r1.rule==='irrational'?'فقط عددهای گنگ.':'فقط عددهای گویا.'),8);S.rooms.r1.hintPath=p.map(s=>[s.x,s.y]);return{type:'hint',path:S.rooms.r1.hintPath}}}
 if(S.room===1){const R=S.rooms.r2;const c=R.crates.find(c=>!R.plates.some(p=>p.x===c.x&&p.y===c.y&&p.ok));if(c){const p=R.plates.find(p=>feq(p.v,c.val));toast(S,`جعبهٔ «${c.label}» برابر ${valLabel(c.val)} است و باید روی صفحهٔ «${p.label}» برود.`,9);return{type:'hint',crate:c.id}}}
 if(S.room===2){const R=S.rooms.r3,[a,b]=R.sensors;const m=(b.my-a.my)/(b.mx-a.mx),c=a.my-m*a.mx;toast(S,`حسگرها: (${a.mx}, ${a.my}) و (${b.mx}, ${b.my}). شیب = (${b.my}−(${a.my}))÷(${b.mx}−(${a.mx})) = ${m}. حالا b را بیاب.`,10);return{type:'hint'}}return null}
/* دسترس‌پذیری: رد کردن معما (بدون امتیاز، ثبت‌شده) */
function skipPuzzle(S){if(S.over||S.paused)return false;S.assisted=true;S.stats.skips++;if(S.room===0&&!S.doors[0]){S.doors[0]=true;S.rooms.r1.lever=true;S.maps[0][4][13]='E'}
 if(S.room===1&&!S.doors[1]){S.doors[1]=true;S.maps[1][4][13]='E';S.rooms.r2.crates.forEach((c,i)=>{});}
 if(S.room===2&&!S.doors[2]){S.doors[2]=true;S.rooms.r3.solved=true;S.maps[2][4][13]='E'}toast(S,'معما رد شد (ثبت می‌شود).',3);return true}
function finish(S){if(S.sub!=='ending')return null;addNote(S,'n_end');S.over=true;S.sub=null;const e=S.stats.falls+S.stats.wrong+S.stats.resets+S.stats.hints*2+S.stats.skips*5;const rank=S.assisted?'C':e<=2?'A':e<=8?'B':'C';S.result={rank,mistakes:e,time:Math.round(S.time),stats:Object.assign({},S.stats),assisted:S.assisted};ev(S,'complete');return S.result}
function tick(S,dt){if(S.paused||S.over)return;S.time+=dt;if(S.toast){S.toast.ttl-=dt;if(S.toast.ttl<=0)S.toast=null}}
function objective(S){if(S.sub==='ending')return'درِ گنجه را رد کن و پوشه را بردار.';if(S.room===0)return S.doors[0]?'به در شرقی برو.':(S.rooms.r1.arrived||S.px>=11?'اهرم را با E پایین بیاور.':'از لبهٔ چپ فقط روی سنگ‌های «'+(S.rooms.r1.rule==='irrational'?'گنگ':'گویا')+'» قدم بگذار تا لبهٔ شرقی.');
 if(S.room===1)return S.doors[1]?'به در شرقی برو.':'هر جعبه را روی صفحه‌ای ببر که ارزشش برابر است.';return S.doors[2]?'به گنجه (در شرقی) برو.':'در پنل لیزر شیب و عرض از مبدأ را طوری تنظیم کن که هر دو حسگر روشن شوند.'}
function save(S){return JSON.stringify({v:S.v,room:S.room,mission:S.mission,journal:S.journal,doors:S.doors,time:Math.round(S.time),stats:S.stats,done:S.over?1:0})}
function load(str){try{const o=JSON.parse(str);if(!o||typeof o!=='object')return null;return{v:o.v,mission:Math.min(2,+o.mission||0),journal:Array.isArray(o.journal)?o.journal.filter(x=>NOTES[x]):[],done:!!o.done}}catch(e){return null}}
const num=v=>String(v).replace('-','−');
const EQ=R=>{const m=R.m,b=R.b,mx=m===0?'':(m===1?'x':m===-1?'−x':num(m)+'x');if(!mx)return 'y = '+num(b);return 'y = '+mx+(b===0?'':b>0?' + '+b:' − '+(-b))};
return{W,H,DIRS,ORG,NOTES,ROOMS,R1V,R2V,R3V,SAFE_POOL,RAT_POOL,classify,stoneLabel,evalExpr,exprLabel,valLabel,createGame,move,interact,closeNote,consoleKey,resetRoom,useHint,skipPuzzle,finish,tick,objective,save,load,safePath,stoneSafe,beamHits,updateBeam,updatePlates,EQ,feq,frac,crateAt,plateAt,propAt,stoneAt,tile}});
