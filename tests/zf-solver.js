/* حل‌کنندهٔ خودکار «پروندهٔ صفر» که فهرست کنش‌های واقعی را ضبط می‌کند (برای بازپخش با رویداد کیبورد در رابط) */
const Z=require('../js/zf-core.js');const D=Z.DIRS,names=Object.keys(D);
class Heap{constructor(){this.a=[]}push(x,k){const a=this.a;a.push([k,x]);let i=a.length-1;while(i>0){const p=(i-1)>>1;if(a[p][0]<=a[i][0])break;[a[p],a[i]]=[a[i],a[p]];i=p}}pop(){const a=this.a,top=a[0],last=a.pop();if(a.length){a[0]=last;let i=0;for(;;){let l=2*i+1,r=l+1,m=i;if(l<a.length&&a[l][0]<a[m][0])m=l;if(r<a.length&&a[r][0]<a[m][0])m=r;if(m===i)break;[a[m],a[i]]=[a[i],a[m]];i=m}}return top[1]}get size(){return this.a.length}}
const passable=(S,x,y)=>{const c=Z.tile(S,x,y);return(c==='.'||c==='E')&&!Z.crateAt(S,x,y)&&!Z.propAt(S,x,y)};
function solveR2(S){const R=S.rooms.r2,goal=R.crates.map(c=>R.plates.find(p=>Z.feq(p.v,c.val)));const wall=(x,y)=>Z.tile(S,x,y)!=='.'||Z.propAt(S,x,y);
 const reach=(cr,px,py)=>{const seen=new Set([px+','+py]),q=[[px,py]];let m=[px,py];while(q.length){const[x,y]=q.shift();if(y<m[1]||(y===m[1]&&x<m[0]))m=[x,y];for(const d of names){const nx=x+D[d][0],ny=y+D[d][1];if(wall(nx,ny)||cr.some(c=>c[0]===nx&&c[1]===ny)||seen.has(nx+','+ny))continue;seen.add(nx+','+ny);q.push([nx,ny])}}return{seen,m}};
 const h=cr=>cr.reduce((s,c,i)=>s+Math.abs(c[0]-goal[i].x)+Math.abs(c[1]-goal[i].y),0);const heap=new Heap(),start=R.crates.map(c=>[c.x,c.y]);heap.push({cr:start,px:S.px,py:S.py,g:0,pushes:[]},h(start));const seen=new Set();let it=0;
 while(heap.size&&it++<60000){const n=heap.pop();if(h(n.cr)===0)return n.pushes;const{seen:rg,m}=reach(n.cr,n.px,n.py);const K=n.cr.map(c=>c.join(',')).join(';')+'|'+m;if(seen.has(K))continue;seen.add(K);
  n.cr.forEach((c,i)=>{for(const d of names){const bx=c[0]+D[d][0],by=c[1]+D[d][1],ox=c[0]-D[d][0],oy=c[1]-D[d][1];if(!rg.has(ox+','+oy)||wall(bx,by)||n.cr.some(o=>o[0]===bx&&o[1]===by))continue;const cr2=n.cr.map((o,j)=>j===i?[bx,by]:o);heap.push({cr:cr2,px:c[0],py:c[1],g:n.g+1,pushes:[...n.pushes,{id:i,from:[ox,oy],dir:d}]},n.g+1+3*h(cr2))}})}return null}
function record(variant){const S=Z.createGame({variant}),acts=[];
 const mv=d=>{if(!Z.move(S,d))throw new Error('حرکت رد شد '+d);acts.push({k:'move',d})};
 const face=d=>{Z.move(S,d);acts.push({k:'move',d,blocked:true})};
 const walk=(tx,ty)=>{const q=[[S.px,S.py]],prev={[S.px+','+S.py]:null};while(q.length){const[x,y]=q.shift();if(x===tx&&y===ty)break;for(const n of names){const nx=x+D[n][0],ny=y+D[n][1],k=nx+','+ny;if(k in prev||!passable(S,nx,ny))continue;prev[k]=[x,y,n];q.push([nx,ny])}}const path=[];let c=prev[tx+','+ty];while(c){path.unshift(c[2]);c=prev[c[0]+','+c[1]]}path.forEach(mv)};
 const path=Z.safePath(S);walk(2,path[0].y);let cx=2,cy=path[0].y;for(const st of path){mv(st.x>cx?'right':st.x<cx?'left':st.y>cy?'down':'up');cx=st.x;cy=st.y}mv('right');
 walk(12,3);face('up');Z.interact(S);acts.push({k:'e'});walk(12,4);mv('right');
 for(const p of solveR2(S)){walk(p.from[0],p.from[1]);mv(p.dir)}walk(12,4);mv('right');
 walk(1,6);face('down');Z.interact(S);acts.push({k:'e'});const[a,b]=S.rooms.r3.sensors;const m=(b.my-a.my)/(b.mx-a.mx),c=a.my-m*a.mx;
 for(let i=0;i<Math.abs(m)/.5;i++){Z.consoleKey(S,m>0?'right':'left');acts.push({k:'move',d:m>0?'right':'left'})}for(let i=0;i<Math.abs(c);i++){Z.consoleKey(S,c>0?'up':'down');acts.push({k:'move',d:c>0?'up':'down'})}
 Z.interact(S);acts.push({k:'e'});walk(12,4);mv('right');return acts}
module.exports={record};
