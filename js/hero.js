import * as THREE from '../assets/vendor/three.module.js';
import {RoomEnvironment} from '../assets/vendor/addons/RoomEnvironment.js';
const RED=matchMedia('(prefers-reduced-motion:reduce)').matches;
const hasGL=()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'))}catch(e){return false}};
const disposeScene=s=>s.traverse(o=>{o.geometry&&o.geometry.dispose();const m=o.material;m&&(Array.isArray(m)?m:[m]).forEach(x=>{x.map&&x.map.dispose();x.dispose()})});
/* ---------- Hero sculpture ---------- */
let H=null;
function mountHero(){const box=document.getElementById('hero3d');if(!box||H||!hasGL()){box&&!hasGL()&&box.classList.add('nogl');return}
 let r;try{r=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){box.classList.add('nogl');return}
 r.setPixelRatio(Math.min(devicePixelRatio,1.25));r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;box.appendChild(r.domElement);r.domElement.className='gl';
 const scene=new THREE.Scene(),pm=new THREE.PMREMGenerator(r),env=pm.fromScene(new RoomEnvironment(),.04);scene.environment=env.texture;
 const cam=new THREE.PerspectiveCamera(32,1,.1,100);const key=new THREE.DirectionalLight(0xffffff,1.4);key.position.set(3,5,4);scene.add(key);
 const silver=new THREE.MeshPhysicalMaterial({color:0xe4e8ef,metalness:1,roughness:.2,clearcoat:.6}),cobalt=new THREE.MeshPhysicalMaterial({color:0x2447d6,metalness:.15,roughness:.22,clearcoat:1}),glass=new THREE.MeshPhysicalMaterial({color:0xcfe0ff,roughness:.05,metalness:.1,transparent:true,opacity:.38,clearcoat:1});
 const G=new THREE.Group(),sign=new THREE.Group();G.add(sign);scene.add(G);
 const seg=(a,b,m,rad=.15)=>{const dx=b[0]-a[0],dy=b[1]-a[1],mesh=new THREE.Mesh(new THREE.CapsuleGeometry(rad,Math.hypot(dx,dy),8,20),m);mesh.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,0);mesh.rotation.z=Math.atan2(dy,dx)-Math.PI/2;sign.add(mesh)};
 seg([-1.7,-.1],[-1.2,-.45],silver);seg([-1.2,-.45],[-.6,-1.7],silver,.17);seg([-.6,-1.7],[.35,1.35],silver,.17);seg([.35,1.35],[3,1.35],cobalt,.17);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.9,.025,12,160),silver);ring.rotation.set(1.2,.2,0);G.add(ring);
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,1),cobalt);core.position.set(1.7,-.1,0);sign.add(core);
 const frag=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.22,0),glass,46),d=new THREE.Object3D();for(let i=0;i<46;i++){const a=i*2.399,rr=3.2+(i%7)*.45;d.position.set(Math.cos(a)*rr,(Math.sin(i*1.7)*2.2),Math.sin(a)*rr*.6-1);d.rotation.set(i,i*.7,0);d.scale.setScalar(.5+(i%5)*.25);d.updateMatrix();frag.setMatrixAt(i,d.matrix)}G.add(frag);
 const pg=new THREE.BufferGeometry(),pa=new Float32Array(360*3);for(let i=0;i<pa.length;i++)pa[i]=(Math.random()-.5)*(i%3==1?8:14);pg.setAttribute('position',new THREE.BufferAttribute(pa,3));const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0x6b7fb8,size:.035,transparent:true,opacity:.7}));scene.add(pts);
 const grid=new THREE.GridHelper(24,24,0xb7c1d4,0xdde2ec);grid.position.y=-2.3;grid.material.transparent=true;grid.material.opacity=.7;scene.add(grid);
 const cv=document.createElement('canvas');cv.width=cv.height=128;const cx=cv.getContext('2d'),gr=cx.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,'rgba(21,25,34,.38)');gr.addColorStop(1,'rgba(21,25,34,0)');cx.fillStyle=gr;cx.fillRect(0,0,128,128);const sh=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=-2.29;scene.add(sh);
 const st={mx:0,my:0,x:0,y:0,intro:{k:0},raf:0,vis:true,t0:performance.now()};
 const size=()=>{const w=box.clientWidth,h=box.clientHeight;r.setSize(w,h,false);cam.aspect=w/h;const wide=cam.aspect>1.1;cam.position.set(0,.4,wide?13.5:19);G.position.set(wide?-3.2:0,wide?.1:2.4,0);G.scale.setScalar(wide?1:.8);cam.lookAt(0,0,0);cam.updateProjectionMatrix();draw()};
 const draw=()=>{const t=(performance.now()-st.t0)/1000,p=Math.min(1,scrollY/Math.max(1,box.clientHeight));st.x+=(st.mx-st.x)*.06;st.y+=(st.my-st.y)*.06;
  sign.rotation.y=Math.sin(t*.4)*.45+st.x*.4+p*1.4+(1-st.intro.k)*-3.4;sign.rotation.x=st.y*-.15;sign.position.y=Math.sin(t*.8)*.1;ring.rotation.z=t*.12;frag.rotation.y=t*.05+st.x*.12;frag.position.y=Math.sin(t*.5)*.1;pts.rotation.y=t*.01-st.x*.05;
  cam.position.x=st.x*.6;cam.position.z+=(((cam.aspect>1.1?13.5:19)+p*4)-cam.position.z)*.1;cam.lookAt(0,0,0);G.position.y+=0;r.render(scene,cam)};
 const loop=()=>{st.raf=0;if(!st.vis||document.hidden)return;draw();st.raf=requestAnimationFrame(loop)};
 const kick=()=>{if(!st.raf&&!RED)st.raf=requestAnimationFrame(loop)};
 const io=new IntersectionObserver(e=>{st.vis=e[0].isIntersecting;kick()});io.observe(box);
 const pm_=e=>{st.mx=e.clientX/innerWidth*2-1;st.my=e.clientY/innerHeight*2-1},vc=()=>kick(),rs=()=>size();
 if(!RED){addEventListener('pointermove',pm_,{passive:true})}document.addEventListener('visibilitychange',vc);addEventListener('resize',rs);
 if(window.gsap&&!RED)gsap.to(st.intro,{k:1,duration:2.2,ease:'expo.out'});else st.intro.k=1;
 size();kick();box.classList.add('ready');
 H={dispose(){cancelAnimationFrame(st.raf);st.raf=0;st.vis=false;io.disconnect();removeEventListener('pointermove',pm_);removeEventListener('resize',rs);document.removeEventListener('visibilitychange',vc);disposeScene(scene);env.dispose();pm.dispose();r.dispose();r.domElement.remove();H=null}}}
document.addEventListener('rn:home',mountHero);document.addEventListener('rn:leave',()=>H&&H.dispose());mountHero();
/* ---------- Solid viewer for volume/area tool ---------- */
let cur=null;
window.RNSolid={mount(el,kind,d){if(!hasGL())return false;try{
 const f=2.2/({sphere:2*d[0],cone:Math.max(2*d[0],d[1]),cylinder:Math.max(2*d[0],d[1]),pyramid:Math.max(d[0],d[1]),cuboid:Math.max(...d)}[kind]);
 const geo={sphere:()=>new THREE.SphereGeometry(d[0]*f,40,28),cone:()=>new THREE.ConeGeometry(d[0]*f,d[1]*f,48),cylinder:()=>new THREE.CylinderGeometry(d[0]*f,d[0]*f,d[1]*f,48),pyramid:()=>new THREE.ConeGeometry(d[0]*f/Math.SQRT2,d[1]*f,4),cuboid:()=>new THREE.BoxGeometry(d[0]*f,d[2]*f,d[1]*f)}[kind]();
 if(kind=='pyramid')geo.rotateY(Math.PI/4);
 if(cur&&(!cur.el.isConnected||cur.el!==el||!el.contains(cur.canvas)))cur.dispose();
 if(!cur){const r=new THREE.WebGLRenderer({antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio,1.25));r.setSize(el.clientWidth||300,el.clientHeight||240);el.appendChild(r.domElement);
  const s=new THREE.Scene(),pm=new THREE.PMREMGenerator(r),env=pm.fromScene(new RoomEnvironment(),.04);s.environment=env.texture;const c=new THREE.PerspectiveCamera(35,(el.clientWidth||300)/(el.clientHeight||240),.1,50);c.position.set(0,1.4,6.2);c.lookAt(0,0,0);
  const mat=new THREE.MeshPhysicalMaterial({color:0x2447d6,roughness:.12,metalness:.1,transparent:true,opacity:.55,clearcoat:1}),mesh=new THREE.Mesh(geo,mat),edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0x151922}));mesh.add(edges);s.add(mesh);
  let raf=0;const o={el,canvas:r.domElement,s,mesh,edges,dispose(){cancelAnimationFrame(raf);disposeScene(s);env.dispose();pm.dispose();r.dispose();r.domElement.remove();cur=null}};
  const loop=()=>{if(!el.isConnected||!el.contains(r.domElement)){o.dispose();return}mesh.rotation.y+=RED?0:.008;r.render(s,c);raf=requestAnimationFrame(loop)};loop();cur=o}
 else{cur.mesh.geometry.dispose();cur.mesh.geometry=geo;cur.edges.geometry.dispose();cur.edges.geometry=new THREE.EdgesGeometry(geo);if(window.gsap&&!RED)gsap.fromTo(cur.mesh.scale,{x:.6,y:.6,z:.6},{x:1,y:1,z:1,duration:.6,ease:'back.out(1.6)'})}
 return true}catch(e){console.warn('solid viewer unavailable',e);return false}}};
