/* آزمون ساخت صحنه‌های سه‌بعدی بدون GPU: هندسه‌ها ساخته می‌شوند و موقعیت‌های ریاضی دقیق‌اند */
const ctx2d=new Proxy({},{get:(t,k)=>k==='measureText'?()=>({width:120}):()=>{}, set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx2d,style:{}}),addEventListener(){},getElementById:()=>null};
globalThis.matchMedia=()=>({matches:false});globalThis.addEventListener=()=>{};
const M=await import('../js/rn3d.js');const THREE=await import('../assets/vendor/three.module.js');
let f=0;const t=(n,ok,x)=>{console.log((ok?'PASS ':'FAIL ')+n+(ok?'':' ← '+x));if(!ok)f++};
const CH=['sets','real-numbers','geometry-reasoning','power-root','algebraic-expressions','linear-equations','rational-expressions','volume-area'];
t('هشت صحنه برای هشت فصل',JSON.stringify(M.SCENE_KINDS.sort())===JSON.stringify([...CH].sort()),M.SCENE_KINDS);
for(const k of CH){const g=M.buildScene(k);const b=new THREE.Box3().setFromObject(g);t(`${k}: ساخته شد و ابعاد معتبر`,g.children.length>3&&isFinite(b.max.x)&&isFinite(b.min.x)&&(b.max.x-b.min.x)>2&&(b.max.x-b.min.x)<14,JSON.stringify(b))}
const rn=M.buildScene('real-numbers');const xs=rn.children.filter(o=>o.geometry&&o.geometry.type==='SphereGeometry').map(o=>o.position.x).sort((a,b)=>a-b);
t('محور اعداد: نقطه‌ها دقیقاً −√3, −1.5, √2, π',Math.abs(xs[0]+Math.sqrt(3))<1e-12&&xs[1]===-1.5&&Math.abs(xs[2]-Math.SQRT2)<1e-12&&Math.abs(xs[3]-Math.PI)<1e-12,xs);
const pw=M.buildScene('power-root');const inst=pw.children.filter(o=>o.isInstancedMesh).map(o=>o.count).sort((a,b)=>a-b);t('توان: ۹ واحد (۳²) و ۲۷ واحد (۳³)',inst[0]===9&&inst[1]===27,inst);
const vol=M.buildScene('volume-area');const sh=vol.children.filter(o=>o.isMesh).map(o=>o.geometry.type);t('حجم: استوانه، مخروط، کره',['CylinderGeometry','ConeGeometry','SphereGeometry'].every(g=>sh.includes(g)),sh);
const sets=M.buildScene('sets');const lens=sets.children.find(o=>o.geometry&&o.geometry.type==='ExtrudeGeometry');const lb=new THREE.Box3().setFromObject(lens);const r=1.5,d=1.7;t('مجموعه‌ها: عرض عدسی اشتراک = 2r−d',Math.abs((lb.max.x-lb.min.x)-(2*r-d))<1e-5,lb.max.x-lb.min.x);
const rad=M.radical();t('رادیکال سه‌بعدی ساخته می‌شود (۴ بخش)',rad.children.length===4);
process.exit(f?1:0);
