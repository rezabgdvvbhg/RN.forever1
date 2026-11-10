/* ساخت ارائهٔ PPTX واقعی با PptxGenJS (مرورگر و Node).
   چیدمان‌ها: عنوان، مفهوم/محتوا، فرمول (کسر انباشته)، مثال حل‌شده، گام‌به‌گام، مقایسه، نمودار (ون/محور/مثلث قائم)، تمرین، جمع‌بندی.
   فرمول‌ها به متن ویرایش‌پذیر با توان/اندیس واقعی، کسر و رادیکال تبدیل می‌شوند؛ LaTeX خام هرگز در اسلاید نمی‌آید. */
(function(root,f){const m=f(typeof require==='function'&&typeof module==='object'?require('./shared.js'):root.RNShared,typeof require==='function'&&typeof module==='object'?require('./pptx-math.js'):root.RNPptxMath);if(typeof module==='object'&&module.exports)module.exports=m;else root.RNPptx=m})(this,function(S,X){
const THEMES={
 classic:{name:'کلاسیک (آبی)',main:'2447D6',dark:'151922',soft:'EEF2FF',warm:'C8402A',bg:'FFFFFF',text:'1F2533',mute:'6B7385'},
 warm:{name:'گرم (نارنجی)',main:'C8402A',dark:'2B1A16',soft:'FFF1EC',warm:'2447D6',bg:'FFFFFF',text:'2A2320',mute:'7A6A64'},
 mint:{name:'ملایم (سبز)',main:'1F8A70',dark:'12261F',soft:'E8F6F1',warm:'C8402A',bg:'FFFFFF',text:'1B2A25',mute:'5F7A70'}};
const FONT='Tahoma',MATH='Cambria Math',W=13.33,H=7.5;
const faN=s=>String(s).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
function build(Pptx,deck,opt){opt=opt||{};const D=S.validateDeck(deck,{maxSlides:40}),T=THEMES[opt.theme]||THEMES.classic;
 const p=new Pptx();p.layout='LAYOUT_WIDE';p.rtlMode=true;p.title=D.title;p.author='رادیکال RN';p.company='رادیکال RN';p.subject=D.chapter||'ریاضی نهم';p.lang='fa-IR';
 const R={rtlMode:true,lang:'fa-IR',fontFace:FONT,align:'right'};
 const para=(str,o)=>{const rr=X.runs(str,{color:T.text,fontSize:20,...(o||{})});if(!rr.length)return[];const pp=o&&o.para||{};const al=(o&&o.align)||'right';rr.forEach(r=>{delete r.options.para;r.options.rtlMode=true;r.options.align=al});rr[0].options={...rr[0].options,...pp};rr[rr.length-1].options.breakLine=true;return rr};
 const paras=(arr,o)=>arr.flatMap(s=>para(s,o));
 const bullets=(arr,o)=>arr.flatMap(s=>para(s,{...o,para:{bullet:{indent:22},paraSpaceAfter:10}}));
 const ltr=rr=>rr.map(r=>({text:r.text,options:{...r.options,rtlMode:false}}));
 const foot=(s,n)=>{s.addShape('line',{x:.6,y:6.95,w:W-1.2,h:0,line:{color:'D9DEE8',width:.75}});s.addText('رادیکال RN'+(D.chapter?' — '+D.chapter:''),{...R,x:W-6.6,y:7,w:6,h:.35,fontSize:11,color:T.mute});s.addText(faN(n),{x:.6,y:7,w:1,h:.35,fontSize:11,color:T.mute,fontFace:FONT,align:'left'})};
 const head=(s,t)=>{s.background={color:T.bg};s.addShape('rect',{x:W-.28,y:0,w:.28,h:H,fill:{color:T.main},line:{color:T.main,width:0}});s.addText(para(t,{fontSize:30,bold:true,color:T.dark}),{...R,x:.7,y:.4,w:W-1.7,h:1,valign:'middle'});s.addShape('rect',{x:W-2.2,y:1.5,w:1.6,h:.07,fill:{color:T.warm},line:{color:T.warm,width:0}})};
 const box=(s,x,y,w,h,fill,line)=>s.addShape('roundRect',{x,y,w,h,fill:{color:fill},line:{color:line||fill,width:1},rectRadius:.1});
 const stacked=(s,tex,cx,cy,size,color)=>{const segs=X.segments(tex);const ch=size/72*1.35,fs=size*.8;const wd=sg=>sg.t==='frac'?Math.max(X.wEst(sg.n,fs),X.wEst(sg.d,fs))+.35:X.wEst(sg.v,size)+.3;const tot=segs.reduce((a,g)=>a+wd(g),0);let x=cx-tot/2;
  for(const g of segs){const w=wd(g);if(g.t==='txt'){s.addText(ltr(X.runs(g.v,{fontSize:size,color,bold:true},true).map(r=>({text:r.text,options:{...r.options,fontFace:MATH}}))),{x,y:cy-ch/2,w,h:ch,margin:0,valign:'middle',align:'center',rtlMode:false,wrap:false})}
   else{const hh=fs/72*1.3;s.addText(ltr(X.runs(g.n,{fontSize:fs,color,bold:true},true)),{x,y:cy-hh-.04,w,h:hh,margin:0,valign:'bottom',align:'center',rtlMode:false});s.addShape('line',{x:x+.05,y:cy,w:w-.1,h:0,line:{color,width:2}});s.addText(ltr(X.runs(g.d,{fontSize:fs,color,bold:true},true)),{x,y:cy+.04,w,h:hh,margin:0,valign:'top',align:'center',rtlMode:false})}
   x+=w}};
 const chip=(s,tex,y)=>{box(s,1.4,y,W-2.8,.95,T.soft,T.main);s.addText(ltr(X.runs(tex,{fontSize:26,bold:true,color:T.main},true)),{x:1.5,y:y+.02,w:W-3,h:.9,align:'center',valign:'middle',rtlMode:false})};
 const cleanTex=t=>String(t||'').replace(/^\\\(|\\\)$/g,'');
 let s=p.addSlide();s.background={color:T.dark};
 s.addShape('rect',{x:W-.5,y:0,w:.5,h:H,fill:{color:T.main},line:{color:T.main,width:0}});s.addShape('rect',{x:W-4.2,y:3.95,w:2.6,h:.09,fill:{color:T.warm},line:{color:T.warm,width:0}});
 s.addText(para(D.title,{fontSize:46,bold:true,color:'FFFFFF'}),{...R,x:.9,y:1.7,w:W-2.6,h:2.1,valign:'bottom'});
 s.addText(para(D.subtitle||D.chapter||'ریاضی پایهٔ نهم',{fontSize:22,color:'C9D0DE'}),{...R,x:.9,y:4.25,w:W-2.6,h:.9,valign:'top'});
 s.addText('رادیکال RN',{...R,x:.9,y:6.6,w:W-2.6,h:.5,fontSize:16,color:'9FB0FF',bold:true});
 let n=1;
 D.slides.forEach(sl=>{n++;s=p.addSlide();head(s,sl.title);const body={x:.7,y:1.85,w:W-1.7};const ty=sl.type;
  if(ty==='example'){const bw=(W-1.7-.4)/2;box(s,.7,1.9,bw,4.8,T.soft,T.main);box(s,.7+bw+.4,1.9,bw,4.8,'FFFFFF',T.warm);
   const prob=sl.problem||sl.bullets[0]||'',sol=sl.solution||sl.bullets.slice(1).join('\n');
   s.addText([...para('مسئله',{fontSize:16,bold:true,color:T.main}),...paras(prob.split('\n'),{fontSize:20})],{...R,x:.7+bw+.6,y:2,w:bw-.4,h:4.6,valign:'top'});
   s.addText([...para('راه‌حل',{fontSize:16,bold:true,color:T.warm}),...paras(sol.split('\n'),{fontSize:20})],{...R,x:.9,y:2,w:bw-.4,h:4.6,valign:'top'})}
  else if(ty==='steps'){const st=sl.bullets.length?sl.bullets:[sl.solution||''];const rh=Math.min(.95,4.0/st.length);st.forEach((t,i)=>{const y=1.9+i*rh;s.addShape('ellipse',{x:W-1.6,y:y+.05,w:.6,h:.6,fill:{color:T.main},line:{color:T.main,width:0}});s.addText(faN(i+1),{x:W-1.6,y:y+.05,w:.6,h:.6,align:'center',valign:'middle',fontFace:FONT,fontSize:18,bold:true,color:'FFFFFF'});s.addText(para(t,{fontSize:st.length>5?18:21}),{...R,x:.8,y,w:W-2.7,h:rh-.05,valign:'middle'})});
   if(sl.formula)chip(s,sl.formula,5.85)}
  else if(ty==='formula'){box(s,1.2,1.95,W-2.4,2.3,T.soft,T.main);stacked(s,cleanTex(sl.formula),W/2,3.1,38,T.main);if(sl.bullets.length)s.addText(bullets(sl.bullets,{fontSize:20}),{...R,...body,y:4.5,h:2.3,valign:'top'})}
  else if(ty==='compare'){const cw=(W-1.7-.4)/2;[[sl.right,.7+cw+.4,T.main],[sl.left,.7,T.warm]].forEach(([c,x,col])=>{box(s,x,1.9,cw,4.8,'FFFFFF',col);s.addShape('rect',{x,y:1.9,w:cw,h:.7,fill:{color:col},line:{color:col,width:0}});s.addText(para(c.title,{fontSize:20,bold:true,color:'FFFFFF',align:'center'}),{...R,x:x+.1,y:1.9,w:cw-.2,h:.7,align:'center',valign:'middle'});s.addText(bullets(c.bullets,{fontSize:19}),{...R,x:x+.2,y:2.75,w:cw-.4,h:3.8,valign:'top'})})}
  else if(ty==='diagram'){const d=sl.diagram;const dx=.9,dw=6.6;
   if(d.kind==='venn'){const r=1.45,cy=3.9;s.addShape('ellipse',{x:dx+.5,y:cy-r,w:r*2.2,h:r*2,fill:{color:T.main,transparency:70},line:{color:T.main,width:2}});s.addShape('ellipse',{x:dx+.5+r*1.2,y:cy-r,w:r*2.2,h:r*2,fill:{color:T.warm,transparency:70},line:{color:T.warm,width:2}});
    const lab=(t,x,yy,w)=>s.addText(ltr(X.runs(t,{fontSize:18,bold:true,color:T.dark},true)),{x,y:yy,w,h:.5,align:'center',valign:'middle',rtlMode:false});
    lab(d.a,dx+.6,cy-r-.45,1.4);lab(d.b,dx+.6+r*2,cy-r-.45,1.4);lab(d.onlyA,dx+.7,cy-.25,1.4);lab(d.both,dx+.5+r*1.2+.15,cy-.25,r*.9);lab(d.onlyB,dx+.5+r*2.2,cy-.25,1.4);lab(d.outside,dx+.4,cy+r+.15,3.2)}
   else if(d.kind==='numberline'){const y=3.9,x0=dx+.2,x1=dx+dw-.2,px=v=>x0+(v-d.min)/(d.max-d.min)*(x1-x0);s.addShape('line',{x:x0,y,w:x1-x0,h:0,line:{color:T.dark,width:2.5}});
    for(let v=Math.ceil(d.min);v<=d.max;v++){s.addShape('line',{x:px(v),y:y-.1,w:0,h:.2,line:{color:T.dark,width:1.5}});s.addText(String(v).replace('-','−'),{x:px(v)-.3,y:y+.15,w:.6,h:.35,fontSize:12,align:'center',fontFace:FONT,color:T.mute,rtlMode:false})}
    d.points.forEach(q=>{s.addShape('ellipse',{x:px(q.v)-.1,y:y-.1,w:.2,h:.2,fill:{color:T.warm},line:{color:'FFFFFF',width:1}});s.addText(ltr(X.runs(q.label,{fontSize:16,bold:true,color:T.warm},true)),{x:px(q.v)-.6,y:y-.75,w:1.2,h:.5,align:'center',valign:'bottom',rtlMode:false})})}
   else{const bx=dx+.8,by=2.4,bw=4.4,bh=3.0;s.addShape('rtTriangle',{x:bx,y:by,w:bw,h:bh,fill:{color:T.soft},line:{color:T.main,width:2.5}});s.addShape('rect',{x:bx+.02,y:by+bh-.38,w:.36,h:.36,fill:{color:'FFFFFF',transparency:100},line:{color:T.main,width:1.5}});
    const Lb=(t,x,y,w)=>s.addText(ltr(X.runs(t,{fontSize:20,bold:true,color:T.dark},true)),{x,y,w,h:.5,align:'center',valign:'middle',rtlMode:false});Lb(d.b,bx,by+bh+.08,bw);Lb(d.a,bx-.9,by+bh/2-.25,.8);Lb(d.c,bx+bw/2+.05,by+bh/2-.95,1.1)}
   s.addText(bullets(sl.bullets,{fontSize:20}),{...R,x:7.9,y:1.9,w:W-8.9,h:3.9,valign:'middle'});if(sl.formula)chip(s,sl.formula,5.85)}
  else if(ty==='practice'){const qs=sl.bullets;const rh=Math.min(1,4.8/Math.max(qs.length,1));qs.forEach((q,i)=>{const y=1.9+i*rh;box(s,.7,y,W-1.7,rh-.12,i%2?'FFFFFF':T.soft,T.soft);s.addText(faN(i+1)+'.',{x:W-1.7,y,w:.6,h:rh-.12,align:'center',valign:'middle',fontFace:FONT,fontSize:20,bold:true,color:T.main});s.addText(para(q,{fontSize:19}),{...R,x:.9,y,w:W-2.8,h:rh-.12,valign:'middle'})})}
  else if(ty==='summary'){box(s,.7,1.9,W-1.7,4.8,T.soft,T.soft);s.addText(bullets(sl.bullets,{fontSize:22}),{...R,x:1,y:2.05,w:W-2.3,h:4.5,valign:'top'})}
  else{const f=sl.formula?1.2:0;s.addText(bullets(sl.bullets,{fontSize:sl.bullets.length>5?19:23}),{...R,...body,h:4.9-f-.1,valign:'top'});if(sl.formula)chip(s,sl.formula,5.7)}
  if(sl.note)s.addNotes(X.plain(sl.note));foot(s,n)});
 return p}
return{THEMES,build}});
