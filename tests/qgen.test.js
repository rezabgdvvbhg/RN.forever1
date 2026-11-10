/* هر مولد روی ۳۰۰ بذر تصادفی × ۳ سطح: بدون خطا، verify درست، متن بدون NaN/undefined، و همهٔ LaTeX با KaTeX رندر شود */
const Q=require('../lib/qgen2.js');const katex=require('../assets/vendor/katex/katex.min.js');
let fails=0,n=0;const bad={};
const segs=s=>[...String(s).matchAll(/\\\((.+?)\\\)/gs)].map(m=>m[1]);
for(const [ch,gens] of Object.entries(Q.G)){gens.forEach((g,gi)=>{for(let seed=1;seed<=300;seed++)for(let L=1;L<=3;L++){n++;const r=Q.rng(seed*7919+gi*131+L);let q;
 try{q=g(r,L)}catch(e){(bad[`${ch}#${gi}`]=bad[`${ch}#${gi}`]||[]).push('exception '+e.message);continue}
 const txt=[q.t,q.a,q.s,...(q.opts||[])].join(' ');
 if(!q.ok)(bad[`${ch}#${gi}`]=bad[`${ch}#${gi}`]||[]).push('verify false seed '+seed);
 if(/NaN|undefined|Infinity|null/.test(txt))(bad[`${ch}#${gi}`]=bad[`${ch}#${gi}`]||[]).push('bad text: '+txt.slice(0,80));
 if(!q.t||!q.a)(bad[`${ch}#${gi}`]=bad[`${ch}#${gi}`]||[]).push('empty');
 for(const t of segs(txt)){try{katex.renderToString(t,{throwOnError:true,strict:'ignore'})}catch(e){(bad[`${ch}#${gi}`]=bad[`${ch}#${gi}`]||[]).push('katex: '+t.slice(0,60)+' → '+e.message.slice(0,50));break}}}})}
const keys=Object.keys(bad);keys.forEach(k=>console.log('FAIL',k,[...new Set(bad[k])].slice(0,3)));
console.log(`${n} نمونه، ${keys.length} مولد مشکل‌دار`);process.exit(keys.length?1:0);
