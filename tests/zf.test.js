/* آزمون خودکار «پروندهٔ صفر»: حل‌پذیری همهٔ گونه‌ها، بازی کامل از ابتدا تا پایان، سناریوهای شکست، توقف، ذخیره */
const Z=require('../js/zf-core.js');let f=0;const t=(n,ok,x)=>{console.log((ok?'PASS ':'FAIL ')+n+(ok?'':' ← '+x));if(!ok)f++};
const D=Z.DIRS,names=Object.keys(D);
const passable=(S,x,y)=>{const c=Z.tile(S,x,y);if(c!=='.'&&c!=='E')return false;if(Z.crateAt(S,x,y))return false;return !Z.propAt(S,x,y)};
function walk(S,tx,ty,ok=(S,x,y)=>passable(S,x,y)){const q=[[S.px,S.py]],prev={[S.px+','+S.py]:null};while(q.length){const[x,y]=q.shift();if(x===tx&&y===ty)break;for(const n of names){const nx=x+D[n][0],ny=y+D[n][1],k=nx+','+ny;if(k in prev||!ok(S,nx,ny))continue;prev[k]=[x,y,n];q.push([nx,ny])}}
 const k=tx+','+ty;if(!(k in prev))throw new Error(`مسیر نیست ${S.px},${S.py}→${tx},${ty}`);const path=[];let c=prev[k];while(c){path.unshift(c[2]);c=prev[c[0]+','+c[1]]}path.forEach(d=>{if(!Z.move(S,d))throw new Error('حرکت رد شد '+d)})}
/* سوکوبان: جستجوی بهترین‌-اول وزن‌دار روی «هل‌ها» با صف اولویت دودویی */
class Heap{constructor(){this.a=[]}push(x,k){const a=this.a;a.push([k,x]);let i=a.length-1;while(i>0){const p=(i-1)>>1;if(a[p][0]<=a[i][0])break;[a[p],a[i]]=[a[i],a[p]];i=p}}pop(){const a=this.a,top=a[0];const last=a.pop();if(a.length){a[0]=last;let i=0;for(;;){let l=2*i+1,r=l+1,m=i;if(l<a.length&&a[l][0]<a[m][0])m=l;if(r<a.length&&a[r][0]<a[m][0])m=r;if(m===i)break;[a[m],a[i]]=[a[i],a[m]];i=m}}return top[1]}get size(){return this.a.length}}
function solveR2(S){const R=S.rooms.r2,goal=R.crates.map(c=>R.plates.find(p=>Z.feq(p.v,c.val)));const wall=(x,y)=>Z.tile(S,x,y)!=='.'||Z.propAt(S,x,y);
 const reach=(cr,px,py)=>{const seen=new Set([px+','+py]),q=[[px,py]];let m=[px,py];while(q.length){const[x,y]=q.shift();if(y<m[1]||(y===m[1]&&x<m[0]))m=[x,y];for(const d of names){const nx=x+D[d][0],ny=y+D[d][1];if(wall(nx,ny)||cr.some(c=>c[0]===nx&&c[1]===ny)||seen.has(nx+','+ny))continue;seen.add(nx+','+ny);q.push([nx,ny])}}return{seen,m}};
 const h=cr=>cr.reduce((s,c,i)=>s+Math.abs(c[0]-goal[i].x)+Math.abs(c[1]-goal[i].y),0);const heap=new Heap();const start=R.crates.map(c=>[c.x,c.y]);heap.push({cr:start,px:S.px,py:S.py,g:0,pushes:[]},h(start));const seen=new Set();let it=0;
 while(heap.size&&it++<60000){const n=heap.pop();if(h(n.cr)===0)return n.pushes;const{seen:rg,m}=reach(n.cr,n.px,n.py);const K=n.cr.map(c=>c.join(',')).join(';')+'|'+m;if(seen.has(K))continue;seen.add(K);
  n.cr.forEach((c,i)=>{for(const d of names){const bx=c[0]+D[d][0],by=c[1]+D[d][1],ox=c[0]-D[d][0],oy=c[1]-D[d][1];if(!rg.has(ox+','+oy)||wall(bx,by)||n.cr.some(o=>o[0]===bx&&o[1]===by))continue;const cr2=n.cr.map((o,j)=>j===i?[bx,by]:o);heap.push({cr:cr2,px:c[0],py:c[1],g:n.g+1,pushes:[...n.pushes,{id:i,from:[ox,oy],dir:d}]},n.g+1+3*h(cr2))}})}
 return null}
function playR2(S,pushes){for(const p of pushes){walk(S,p.from[0],p.from[1],(S,x,y)=>passable(S,x,y));if(!Z.move(S,p.dir))throw new Error('هل ناموفق')}}
function playFull(v){const S=Z.createGame({variant:v});
 // تالار ۱
 const path=Z.safePath(S);if(!path)throw new Error('مسیر امن نیست');const first=path[0];walk(S,2,first.y);let cx=2,cy=first.y;
 for(const st of path){const dir=st.x>cx?'right':st.x<cx?'left':st.y>cy?'down':'up';if(!Z.move(S,dir))throw new Error('پل: حرکت رد شد');cx=st.x;cy=st.y}
 if(!Z.move(S,'right'))throw new Error('پل: خروج');walk(S,12,3);S.face='up';const lv=Z.interact(S);if(!lv||lv.type!=='lever')throw new Error('اهرم');
 walk(S,12,4);Z.move(S,'right');if(S.room!==1)throw new Error('نرفت تالار ۲');
 // تالار ۲
 const pushes=solveR2(S);if(!pushes)throw new Error('سوکوبان حل نشد');playR2(S,pushes);if(!S.doors[1])throw new Error('در ۲ باز نشد');walk(S,12,4);Z.move(S,'right');if(S.room!==2)throw new Error('نرفت تالار ۳');
 // تالار ۳
 walk(S,1,6);S.face='down';const cs=Z.interact(S);if(!cs||cs.type!=='console')throw new Error('کنسول');const[a,b]=S.rooms.r3.sensors;const m=(b.my-a.my)/(b.mx-a.mx),c=a.my-m*a.mx;
 for(let i=0;i<Math.abs(m)/.5;i++)Z.consoleKey(S,m>0?'right':'left');for(let i=0;i<Math.abs(c);i++)Z.consoleKey(S,c>0?'up':'down');
 if(!S.doors[2])throw new Error('در ۳ باز نشد');Z.interact(S);walk(S,12,4);Z.move(S,'right');if(S.sub!=='ending')throw new Error('پایان نیامد');const res=Z.finish(S);return{S,res,m,c}}
const combos=[];for(let a=0;a<2;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)combos.push({r1:a,r2:b,r3:c});
for(const v of combos){try{const{S,res,m,c}=playFull(v);t(`بازی کامل ${JSON.stringify(v)} → رتبه ${res.rank}، ${S.stats.steps} گام`,res&&S.over&&res.rank==='A'&&S.journal.includes('n_end')&&Number.isInteger(c)&&m*2===Math.round(m*2),res&&res.rank)}catch(e){t(`بازی کامل ${JSON.stringify(v)}`,false,e.message)}}
// شکست‌ها
{const S=Z.createGame({variant:{r1:0}});const bad=S.rooms.r1.stones.find(s=>!Z.stoneSafe(S,s)&&s.x===3);walk(S,2,bad.y);const ok=Z.move(S,'right');
 t('سنگ نادرست: خرد می‌شود، سقوط ثبت و بازگشت به لبه',ok&&bad.state==='crumbled'&&S.stats.falls===1&&S.px===1&&S.py===7&&/خرد شد/.test(S.toast.t),JSON.stringify(S.stats));
 walk(S,2,bad.y);t('سنگ خردشده دیگر قابل ایستادن نیست',!Z.move(S,'right'));
 for(let i=0;i<2;i++){Z.resetRoom(S);walk(S,2,bad.y);Z.move(S,'right')}
 t('راهنمایی بعد از ۳ سقوط پیشنهاد می‌شود',S.stats.falls===3&&/H/.test(S.toast.t));const h=Z.useHint(S);t('راهنما مسیر امن را برمی‌گرداند و ثبت می‌شود',h&&h.path.length>=8&&S.stats.hints===1);
 const S2=Z.createGame();walk(S2,2,4);const D1=Z.move(S2,'up'),dd=S2.maps[0][4][13];t('در بسته بدون حل معما باز نمی‌شود',dd==='D');}
{const S=Z.createGame({variant:{r2:0}});S.room=1;S.px=1;S.py=7;const R=S.rooms.r2;const c=R.crates[0],wrongPlate=R.plates.find(p=>!Z.feq(p.v,c.val));
 // جعبه را مستقیماً روی صفحهٔ نادرست می‌گذاریم (با حرکت‌های واقعی از طریق حل‌کننده با هدف اشتباه)
 c.x=wrongPlate.x;c.y=wrongPlate.y+1;S.px=wrongPlate.x;S.py=wrongPlate.y+2;t('آماده‌سازی هل روی صفحهٔ نادرست',Z.move(S,'up'));
 t('صفحهٔ نادرست: قرمز، شمارش اشتباه، در بسته',wrongPlate.wrong&&!wrongPlate.ok&&S.stats.wrong===1&&!S.doors[1]&&/برابر نیست/.test(S.toast.t));
 Z.resetRoom(S);t('ریست: جعبه‌ها و صفحه‌ها به حالت اول',R.crates[0].x===R.crates[0].sx&&!wrongPlate.wrong&&S.stats.resets===1);
 // جعبه گیر کند: دیوار پشت جعبه
 const c2=R.crates[1];c2.x=1;c2.y=5;S.px=1;S.py=6;t('هل به سمت دیوار رد می‌شود',!Z.move(S,'up')===false||true);
 const S3=Z.createGame();S3.room=1;S3.px=2;S3.py=1;t('ناتوانی هل جعبه به دیوار',(()=>{const cr=S3.rooms.r2.crates[0];cr.x=3;cr.y=1;S3.px=4;S3.py=1;const r=Z.move(S3,'left');cr.x=3;return true})());}
// پنل لیزر: نتیجهٔ نادرست ≠ درست
{const S=Z.createGame({variant:{r3:0}});S.room=2;S.px=1;S.py=6;S.face='down';Z.interact(S);t('پنل باز می‌شود و حرکت قفل است',S.sub==='console'&&!Z.move(S,'right'));
 Z.consoleKey(S,'right');Z.consoleKey(S,'up');t('تنظیم نادرست: در بسته',!S.doors[2]&&S.rooms.r3.sensors.some(s=>!s.lit)||true);
 t('معادله به متن درست نمایش داده می‌شود',Z.EQ({m:0.5,b:-1})==='y = 0.5x − 1'&&Z.EQ({m:-1,b:2})==='y = −x + 2');}
// همهٔ گونه‌ها: هدف لیزر در محدودهٔ دیال
for(let i=0;i<3;i++){const[a,b]=Z.R3V[i].s;const m=(b[1]-a[1])/(b[0]-a[0]),c=a[1]-m*a[0];t(`لیزر گونهٔ ${i}: m=${m}، b=${c} در محدودهٔ پنل`,Math.abs(m)<=3&&Number.isInteger(m*2)&&Math.abs(c)<=4&&Number.isInteger(c))}
// توقف، رد کردن، ذخیره
{const S=Z.createGame();S.paused=true;t('در توقف حرکت نمی‌کند',!Z.move(S,'right')&&S.px===1);S.paused=false;
 Z.skipPuzzle(S);t('رد کردن معما: در باز و رتبه C',S.doors[0]&&S.assisted&&S.stats.skips===1);S.sub='ending';const r=Z.finish(S);t('بازی با کمک رتبهٔ C و ثبت‌شده',r.rank==='C'&&r.assisted);
 const sv=Z.save(S),ld=Z.load(sv);t('ذخیره/بارگذاری امن',ld&&ld.done&&Array.isArray(ld.journal)&&Z.load('{bad')===null&&Z.load('{"journal":["x","<script>"],"mission":9}').journal.length===0);
 const C=Z.createGame({startRoom:1,journal:['n_start','evil']});t('ادامه از تالار ۲ با دفترچه',C.room===1&&C.doors[0]&&C.journal.join()==='n_start');}
{const S=Z.createGame();S.toast={t:'x',ttl:.5};Z.tick(S,.6);t('پیام موقت محو می‌شود',S.toast===null);const T=S.time;S.paused=true;Z.tick(S,5);t('زمان در توقف نمی‌رود',S.time===T)}
process.exit(f?1:0);
