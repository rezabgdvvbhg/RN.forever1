/* سامانهٔ سه‌بعدی سبک و مشترک: رادیکال (مقدمه) + صحنهٔ ریاضی‌محور هر فصل.
   اصول: یک رندر در هر زمان، رندر فقط وقتی دیده می‌شود، حداکثر ۳۰ فریم بر ثانیه، DPR ≤ 1.25، آزادسازی کامل منابع. */
import * as THREE from '../assets/vendor/three.module.js';
import {RoomEnvironment} from '../assets/vendor/addons/RoomEnvironment.js';
export const RED=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
export const hasGL=()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'))}catch(e){return false}};
export const disposeScene=s=>s.traverse(o=>{o.geometry&&o.geometry.dispose();const m=o.material;m&&(Array.isArray(m)?m:[m]).forEach(x=>{x.map&&x.map.dispose();x.dispose()})});
const COL={cobalt:0x2447d6,coral:0xc8402a,gold:0xd9a441,ink:0x151922,silver:0xe4e8ef,teal:0x1f8a70,soft:0xcfe0ff};
const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.45,metalness:.1,...o});
const glass=(c,op=.4)=>new THREE.MeshStandardMaterial({color:c,roughness:.2,metalness:0,transparent:true,opacity:op,depthWrite:false});
/* برچسب متنی با بوم دوبعدی (ترجیحاً LTR/ریاضی). کسر انباشته با خط کسری واقعی */
export function label(text,{size=.9,color='#151922',bg=null,frac=null}={}){const c=document.createElement('canvas');const ctx=c.getContext('2d');const f=Math.round(64);c.height=frac?200:110;ctx.font=`700 ${f}px Vazirmatn,Tahoma,"Cambria Math",serif`;
 const tw=frac?Math.max(ctx.measureText(frac[0]).width,ctx.measureText(frac[1]).width)+40:ctx.measureText(text).width+40;c.width=Math.ceil(tw);ctx.font=`700 ${f}px Vazirmatn,Tahoma,"Cambria Math",serif`;ctx.textAlign='center';ctx.fillStyle=color;
 if(bg){ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(0,0,c.width,c.height,22);ctx.fill();ctx.fillStyle=color}
 if(frac){ctx.textBaseline='alphabetic';ctx.fillText(frac[0],c.width/2,70);ctx.fillRect(14,92,c.width-28,6);ctx.fillText(frac[1],c.width/2,170)}else{ctx.textBaseline='middle';ctx.fillText(text,c.width/2,c.height/2+4)}
 const tex=new THREE.CanvasTexture(c);tex.anisotropy=2;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));sp.scale.set(size*c.width/c.height*1.1,size*1.1,1);return sp}
const line=(pts,color,w=1)=>{const g=new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(...p)));return new THREE.Line(g,new THREE.LineBasicMaterial({color,linewidth:w}))};
const cyl=(a,b,r,m)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),10),m);mesh.position.copy(A.clone().add(B).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return mesh};
/* رادیکال سه‌بعدی — همان زبان طراحی صفحهٔ اصلی */
export function radical(){const G=new THREE.Group();const silver=new THREE.MeshPhysicalMaterial({color:0xe4e8ef,metalness:1,roughness:.2,clearcoat:.6}),cobalt=new THREE.MeshPhysicalMaterial({color:COL.cobalt,metalness:.15,roughness:.22,clearcoat:1});
 const seg=(a,b,m,rad=.15)=>{const dx=b[0]-a[0],dy=b[1]-a[1],mesh=new THREE.Mesh(new THREE.CapsuleGeometry(rad,Math.hypot(dx,dy),8,20),m);mesh.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,0);mesh.rotation.z=Math.atan2(dy,dx)-Math.PI/2;G.add(mesh)};
 seg([-1.7,-.1],[-1.2,-.45],silver);seg([-1.2,-.45],[-.6,-1.7],silver,.17);seg([-.6,-1.7],[.35,1.35],silver,.17);seg([.35,1.35],[3,1.35],cobalt,.17);G.userData.cobalt=cobalt;return G}
/* ───── صحنه‌های فصل‌ها ───── */
const SCENES={
 'sets'(S){ // دو دایره + ناحیهٔ اشتراک (عدسی) با هندسهٔ دقیق
  const r=1.5,d=1.7;const A=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.12,48),glass(COL.cobalt,.55)),B=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.12,48),glass(COL.coral,.55));A.position.set(-d/2,0,0);B.position.set(d/2,0,0);S.add(A,B);
  const h=d/2,ang=Math.acos(h/r),arc=(cx,sgn)=>{const p=[];for(let i=0;i<=24;i++){const t=-ang+2*ang*i/24;p.push(new THREE.Vector2(cx+sgn*r*Math.cos(t),r*Math.sin(t)))}return p};
  const shp=new THREE.Shape([...arc(-h,1),...arc(h,-1).reverse()]);const lens=new THREE.Mesh(new THREE.ExtrudeGeometry(shp,{depth:.14,bevelEnabled:false}),mat(COL.gold,{emissive:0x553300,emissiveIntensity:.25}));lens.rotation.x=-Math.PI/2;lens.position.y=.05;S.add(lens);
  [['A',-d/2-.6],['B',d/2+.6]].forEach(([t,x])=>{const l=label(t,{size:.55});l.position.set(x,.7,1.3);S.add(l)});const l=label('A∩B',{size:.5});l.position.set(0,.9,.2);S.add(l);S.userData.rot=.25},
 'real-numbers'(S){ // محور اعداد با نقطه‌های دقیق
  const m=mat(COL.ink);S.add(cyl([-4.4,0,0],[4.4,0,0],.04,m));for(let v=-4;v<=4;v++){S.add(cyl([v,-.12,0],[v,.12,0],.025,m))}
  [[Math.SQRT2,'√2',COL.coral],[Math.PI,'π',COL.cobalt],[-1.5,'-3/2',COL.teal],[-Math.sqrt(3),'-√3',COL.gold]].forEach(([v,t,c])=>{const s=new THREE.Mesh(new THREE.SphereGeometry(.14,16,12),mat(c));s.position.set(v,0,0);S.add(s);const l=label(t,{size:.45});l.position.set(v,.55+(t==='-√3'?.5:0),0);S.add(l)});
  for(let v=-4;v<=4;v+=2){const l=label(String(v).replace('-','−'),{size:.3,color:'#6b7385'});l.position.set(v,-.4,0);S.add(l)}S.userData.rot=.12},
 'geometry-reasoning'(S){ // قضیهٔ فیثاغورس ۳-۴-۵: رأس زاویهٔ قائم در مبدأ، ساق‌ها روی +x (۴) و −z (۳)
  const T=new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(4,0),new THREE.Vector2(0,3)]);const tri=new THREE.Mesh(new THREE.ExtrudeGeometry(T,{depth:.12,bevelEnabled:false}),mat(COL.soft));tri.rotation.x=-Math.PI/2;S.add(tri);S.position.set(-1.6,0,.6);
  const sq=(w,c,x,z,ry=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,.1,w),glass(c,.7));m.position.set(x,.06,z);m.rotation.y=ry;S.add(m)};
  sq(3,COL.cobalt,-1.5,-1.5);sq(4,COL.coral,2,2);sq(5,COL.gold,3.5,-3.5,-Math.atan2(3,4));
  [['3²=9',-1.5,-1.5],['4²=16',2,2],['5²=25',3.5,-3.5]].forEach(([t,x,z])=>{const l=label(t,{size:.5});l.position.set(x,.7,z);S.add(l)});S.userData.rot=.18},
 'power-root'(S){ // مکعب 3×3×3 (۲۷ واحد) و صفحهٔ 3×3 (۹ واحد) + رادیکال
  const cube=new THREE.BoxGeometry(.52,.52,.52),mm=mat(COL.cobalt),im=new THREE.InstancedMesh(cube,mm,27),d=new THREE.Object3D();let k=0;for(let x=0;x<3;x++)for(let y=0;y<3;y++)for(let z=0;z<3;z++){d.position.set((x-1)*.6+1.6,(y-1)*.6+.2,(z-1)*.6);d.updateMatrix();im.setMatrixAt(k++,d.matrix)}S.add(im);
  const pl=new THREE.InstancedMesh(new THREE.BoxGeometry(.52,.12,.52),mat(COL.coral),9);k=0;for(let x=0;x<3;x++)for(let z=0;z<3;z++){d.position.set((x-1)*.6-2.2,-.2,(z-1)*.6);d.updateMatrix();pl.setMatrixAt(k++,d.matrix)}S.add(pl);
  const l1=label('3²=9',{size:.5});l1.position.set(-2.2,.7,0);const l2=label('3³=27',{size:.5});l2.position.set(1.6,1.5,0);const l3=label('√9=3',{size:.5});l3.position.set(-2.2,-.9,0);S.add(l1,l2,l3);S.userData.rot=.3},
 'algebraic-expressions'(S){ // (a+b)² با a=2 ، b=1
  const slab=(w,h,c,x,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,.3,h),mat(c));m.position.set(x,.15,z);S.add(m);return m};
  const g=.08;slab(2-g,2-g,COL.cobalt,-.5,-.5);slab(1-g,2-g,COL.coral,1,-.5);slab(2-g,1-g,COL.coral,-.5,1);slab(1-g,1-g,COL.gold,1,1);
  [['a²',-.5,-.5],['ab',1,-.5],['ab',-.5,1],['b²',1,1]].forEach(([t,x,z])=>{const l=label(t,{size:.45,color:'#ffffff'});l.position.set(x,.75,z);S.add(l)});const t=label('(a+b)² = a² + 2ab + b²',{size:.45});t.position.set(.25,-.1,2.7);S.add(t);S.userData.rot=.2},
 'linear-equations'(S){ // محورها + خط y = x/2 + 1 + نقطهٔ متحرک روی خط
  const m=mat(COL.ink);S.add(cyl([-4,0,0],[4,0,0],.03,m),cyl([0,-2.4,0],[0,2.4,0],.03,m));for(let v=-4;v<=4;v++)if(v)S.add(cyl([v,-.08,0],[v,.08,0],.02,m));
  S.add(cyl([-4,-1,0],[4,3,0],.05,mat(COL.cobalt)));const p=new THREE.Mesh(new THREE.SphereGeometry(.16,16,12),mat(COL.coral));S.add(p);S.userData.tick=t=>{const x=Math.sin(t*.6)*3.2;p.position.set(x,x/2+1,0)};
  const l=label('',{size:.6,frac:['1','2']});l.position.set(-2.8,2.3,0);const l2=label('y= x +1',{size:.45});l2.position.set(-1.4,2.3,0);S.add(l,l2);S.userData.rot=.1},
 'rational-expressions'(S){ // کسر درست حروف‌چینی‌شده + حفرهٔ دامنه در x=-1
  const f=label('',{size:1.1,frac:['x²−1','x+1']});f.position.set(-2,.5,0);S.add(f);const e=label('= x − 1',{size:.7});e.position.set(.1,.5,0);S.add(e);
  const m=mat(COL.ink);S.add(cyl([-3.8,-1.6,0],[-1.12,-1.6,0],.035,m),cyl([-.88,-1.6,0],[3.8,-1.6,0],.035,m));const ring=new THREE.Mesh(new THREE.TorusGeometry(.12,.035,8,24),mat(COL.coral));ring.position.set(-1,-1.6,0);S.add(ring);
  const l=label('x≠−1',{size:.4,color:'#c8402a'});l.position.set(-1,-1.1,0);S.add(l);[-3,0,2,3].forEach(v=>{const t=label(String(v).replace('-','−'),{size:.28,color:'#6b7385'});t.position.set(v*.94-.0,-2,0);S.add(t)});S.userData.rot=.08},
 'volume-area'(S){ // استوانه، مخروط و کره با r=1: حجم‌ها ۳ : ۱ : ۲ نسبت به مخروط
  const w=(g,c,x)=>{const m=new THREE.Mesh(g,glass(c,.45));m.position.set(x,0,0);S.add(m);const ed=new THREE.LineSegments(new THREE.EdgesGeometry(g,30),new THREE.LineBasicMaterial({color:c}));ed.position.copy(m.position);S.add(ed)};
  w(new THREE.CylinderGeometry(1,1,2,32),COL.cobalt,-2.6);w(new THREE.ConeGeometry(1,2,32),COL.coral,0);w(new THREE.SphereGeometry(1,24,16),COL.gold,2.6);
  [['V=2π',-2.6],['V=2π/3',0],['V=4π/3',2.6]].forEach(([t,x])=>{const l=label(t,{size:.42});l.position.set(x,-1.55,0);S.add(l)});const k=label('1 : 2 : 3',{size:.5});k.position.set(0,1.7,0);S.add(k);S.userData.rot=.25}
};
export const SCENE_KINDS=Object.keys(SCENES);
export function buildScene(kind){const g=new THREE.Group();SCENES[kind](g);return g}
/* نصب صحنه در یک جعبه؛ بازگشت: {dispose} */
export function mountContext(box,kind){if(!SCENES[kind]||!hasGL())return null;let r;try{r=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})}catch(e){return null}
 r.setPixelRatio(Math.min(devicePixelRatio,1.25));box.appendChild(r.domElement);r.domElement.className='gl';r.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),pm=new THREE.PMREMGenerator(r),env=pm.fromScene(new RoomEnvironment(),.04);scene.environment=env.texture;const cam=new THREE.PerspectiveCamera(34,1,.1,60);cam.position.set(0,3.2,9.5);cam.lookAt(0,0,0);
 const L=new THREE.DirectionalLight(0xffffff,1.1);L.position.set(3,6,4);scene.add(L,new THREE.AmbientLight(0xffffff,.5));
 const S=new THREE.Group();scene.add(S);SCENES[kind](S);const st={raf:0,vis:true,last:0,mx:0,rot:S.userData.rot||.2,t0:performance.now()};
 const size=()=>{const w=Math.max(1,box.clientWidth),h=Math.max(1,box.clientHeight);r.setSize(w,h,false);cam.aspect=w/h;cam.position.z=w/h<1.3?12:9.5;cam.updateProjectionMatrix();draw()};
 const draw=()=>{const t=(performance.now()-st.t0)/1000;S.rotation.y=Math.sin(t*st.rot)*.5+st.mx*.5;S.rotation.x=.06;S.userData.tick&&S.userData.tick(t);r.render(scene,cam)};
 const loop=now=>{st.raf=0;if(!st.vis||document.hidden)return;if(now-st.last>=33){st.last=now;draw()}st.raf=requestAnimationFrame(loop)};const kick=()=>{if(!st.raf&&!RED())st.raf=requestAnimationFrame(loop)};
 const io=new IntersectionObserver(e=>{st.vis=e[0].isIntersecting;kick()});io.observe(box);const pmv=e=>{const b=box.getBoundingClientRect();st.mx=((e.clientX-b.left)/b.width-.5)};if(!RED())box.addEventListener('pointermove',pmv,{passive:true});
 const vc=()=>kick(),rs=()=>size();document.addEventListener('visibilitychange',vc);addEventListener('resize',rs);size();kick();box.classList.add('ready');
 return{dispose(){cancelAnimationFrame(st.raf);st.vis=false;io.disconnect();box.removeEventListener('pointermove',pmv);removeEventListener('resize',rs);document.removeEventListener('visibilitychange',vc);disposeScene(scene);env.dispose();pm.dispose();r.dispose();r.domElement.remove()}}}
/* بارگذارِ بدون‌وابستگی برای صفحه‌ها */
let cur=null;
export function mountChapterScene(slug){const box=document.getElementById('c3d');if(cur){cur.dispose();cur=null}if(!box||!SCENES[slug])return;
 if(matchMedia('(max-width:700px)').matches||!hasGL()){box.classList.add('nogl');return}
 const go=()=>{if(!document.body.contains(box))return;cur=mountContext(box,slug);if(!cur)box.classList.add('nogl')};
 if('IntersectionObserver' in window){const io=new IntersectionObserver(e=>{if(e[0].isIntersecting){io.disconnect();go()}});io.observe(box)}else go()}
document.addEventListener('rn:leave',()=>{if(cur){cur.dispose();cur=null}});
document.addEventListener('rn:chapter-scene',e=>mountChapterScene(e.detail));

{const b=document.getElementById('c3d');if(b&&b.dataset.slug)mountChapterScene(b.dataset.slug)}
