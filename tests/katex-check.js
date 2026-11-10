// همهٔ فرمول‌های جزوه و بانک سؤال باید با KaTeX محلی بدون خطا رندر شوند
const fs=require('fs'),path=require('path');
const katex=require('../assets/vendor/katex/katex.min.js');
const un=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
let n=0,bad=[];
function check(src,label){
  const re=/\\\((.+?)\\\)|\\\[(.+?)\\\]/gs;let m;
  while((m=re.exec(src))){const t=un(m[1]||m[2]);n++;
    try{katex.renderToString(t,{throwOnError:true,strict:'ignore',displayMode:!!m[2]})}catch(e){bad.push(label+': '+t.slice(0,80)+' → '+e.message.slice(0,80))}}
}
const dir=path.join(__dirname,'../data/notes');
fs.readdirSync(dir).forEach(f=>check(fs.readFileSync(path.join(dir,f),'utf8'),f));
JSON.parse(fs.readFileSync(path.join(__dirname,'../data/questions.json'),'utf8')).forEach(q=>{check(q.question,q.id);check(q.answer||'',q.id)});
console.log(`formulas checked: ${n}, errors: ${bad.length}`);bad.slice(0,15).forEach(b=>console.log(' -',b));
process.exit(bad.length?1:0);
