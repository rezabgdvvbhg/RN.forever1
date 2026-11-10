/* مقدمهٔ سینمایی رادیکال RN (≈ ۴٫۸ ثانیه). سه‌بعدی سبک با fallback؛ همیشه قابل رد شدن؛ برای بازدیدکنندهٔ برگشتی نمایش داده نمی‌شود. */
import * as THREE from '../assets/vendor/three.module.js';
import {RoomEnvironment} from '../assets/vendor/addons/RoomEnvironment.js';
import {radical,hasGL,disposeScene} from './rn3d.js';
const KEY='rn-intro-v1',root=document.documentElement,el=document.getElementById('intro');let run=null;
const mark=()=>{try{localStorage.setItem(KEY,'1')}catch(e){}};
function play(){if(!el||run)return;root.classList.add('intro-on');document.body.style.overflow='hidden';const skip=document.getElementById('intro-skip'),box=document.getElementById('in3d');
 let r=null,scene,cam,G,tl=null,raf=0,done=false,pm,env,floor;const prev=document.activeElement;
 const finish=(fast)=>{if(done)return;done=true;mark();cancelAnimationFrame(raf);const end=()=>{tl&&tl.kill();root.classList.remove('intro-on');document.body.style.overflow='';if(r){disposeScene(scene);env&&env.dispose();pm&&pm.dispose();r.dispose();r.domElement.remove()}el.classList.remove('fallback');run=null;document.dispatchEvent(new Event('rn:intro-done'));try{(prev&&prev.focus&&prev!==document.body?prev:document.getElementById('view')).focus({preventScroll:true})}catch(e){}};
  if(window.gsap&&!fast)gsap.to(el,{opacity:0,duration:.45,ease:'power2.out',onComplete:()=>{end();gsap.set(el,{clearProps:'opacity'})}});else end()};
 const onKey=e=>{if(e.key==='Escape'||e.key==='Enter'&&e.target===document.body)finish(true)};document.addEventListener('keydown',onKey);
 skip.onclick=()=>{document.removeEventListener('keydown',onKey);finish(true)};setTimeout(()=>skip.focus({preventScroll:true}),30);
 const safety=setTimeout(()=>finish(false),9000);run={finish};
 const words=[...el.querySelectorAll('.in-w span')];
 if(hasGL()){try{r=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})}catch(e){r=null}}
 if(r){r.setPixelRatio(Math.min(devicePixelRatio,1.25));r.toneMapping=THREE.ACESFilmicToneMapping;box.appendChild(r.domElement);r.domElement.setAttribute('aria-hidden','true');
  scene=new THREE.Scene();pm=new THREE.PMREMGenerator(r);env=pm.fromScene(new RoomEnvironment(),.04);scene.environment=env.texture;cam=new THREE.PerspectiveCamera(32,1,.1,120);
  const key=new THREE.DirectionalLight(0xffffff,1.6);key.position.set(3,5,5);const rim=new THREE.DirectionalLight(0xc8402a,1.1);rim.position.set(-5,2,-3);scene.add(key,rim);
  floor=new THREE.GridHelper(80,80,0x2447d6,0x24305a);floor.position.y=-2.3;floor.material.transparent=true;floor.material.opacity=0;scene.add(floor);
  G=radical();G.scale.setScalar(.01);G.rotation.y=-2.6;scene.add(G);
  const size=()=>{const w=box.clientWidth,h=box.clientHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()};size();addEventListener('resize',size);
  const st={z:22,y:.4,k:0};const loop=()=>{if(done)return;cam.position.set(Math.sin(st.k*.6)*.6,st.y,st.z);cam.lookAt(0,-.1,0);if(!G.userData.fixed)G.position.set(-.6,0,0);floor.position.z=-(performance.now()/1000%1)*1;r.render(scene,cam);raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  tl=gsap.timeline({onComplete:()=>finish(false)});
  tl.to(el.querySelector('.in-sun'),{opacity:1,y:0,duration:1.1,ease:'power3.out'},0).to(floor.material,{opacity:.85,duration:1.2},0)
    .to(G.scale,{x:1,y:1,z:1,duration:1.5,ease:'expo.out'},.5).to(G.rotation,{y:.35,duration:2.1,ease:'power3.out'},.5).to(st,{z:14,k:2,duration:3.2,ease:'power1.inOut'},.3)
    .to(G.userData.cobalt,{emissiveIntensity:1,duration:.01},1.4)
    .from(words,{yPercent:110,opacity:0,duration:.7,stagger:.12,ease:'power3.out'},1.7).to(el.querySelector('.in-tag'),{opacity:1,duration:.6},2.5)
    .to(el.querySelector('.in-flash'),{opacity:1,duration:.35,ease:'power2.in'},3.9).to({}, {duration:.3},4.4);
 }else{el.classList.add('fallback');tl=gsap.timeline({onComplete:()=>finish(false)});tl.to(el.querySelector('.in-sun'),{opacity:1,y:0,duration:1},0).from('.in-fb path',{strokeDashoffset:600,duration:1.8,ease:'power2.out'},.3).from(words,{yPercent:110,opacity:0,duration:.7,stagger:.12},1.4).to(el.querySelector('.in-tag'),{opacity:1,duration:.5},2.2).to(el.querySelector('.in-flash'),{opacity:1,duration:.35},3.2).to({}, {duration:.3},3.5)}}
window.RN_INTRO={replay(){try{localStorage.removeItem(KEY)}catch(e){}if(!run)play()}};
if(root.classList.contains('intro-on')){if(window.gsap)play();else{root.classList.remove('intro-on')}}
