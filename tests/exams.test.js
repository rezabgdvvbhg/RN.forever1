/* ساختار بانک آزمون، وجود فایل‌ها، سالم‌بودن PDF/Word و تطابق پاسخنامه با آزمون */
const fs=require('fs'),path=require('path'),cp=require('child_process');const R=path.join(__dirname,'..');let f=0;
const t=(n,ok,x)=>{console.log((ok?'PASS ':'FAIL ')+n+(ok?'':' ← '+x));if(!ok)f++};
const M=JSON.parse(fs.readFileSync(R+'/data/exams.json','utf8')),CH=require('../js/chapters.js');
t('۳۰ آزمون در فهرست',M.length===30,M.length);
CH.forEach(c=>{const n=M.filter(e=>e.kind==='chapter'&&e.chapters[0]===c.slug).length;t(`فصل ${c.id}: حداقل ۳ آزمون`,n>=3,n)});
t('حداقل ۲ آزمون ترکیبی',M.filter(e=>e.kind==='combined').length>=2);t('یک آزمون جامع',M.filter(e=>e.kind==='final').length===1);
t('نوبت اول و دوم جدا با دامنهٔ متفاوت',(()=>{const a=M.find(e=>e.kind==='term1'),b=M.find(e=>e.kind==='term2');return a&&b&&a.chapters.every(c=>!b.chapters.includes(c))})());
t('نوبت‌ها/جامع/ترکیبی برچسب «نیازمند تأیید» دارند',M.filter(e=>['term1','term2','final','combined'].includes(e.kind)).every(e=>e.scopeStatus==='needs-review'&&e.scopeNote.length>20));
const ids=new Set();
M.forEach(e=>{ids.add(e.id);const j=JSON.parse(fs.readFileSync(`${R}/data/exams/${e.id}.json`,'utf8'));
 const sum=Math.round(j.questions.reduce((a,q)=>a+q.score,0)*100)/100;
 t(`${e.id}: مجموع بارم ${sum}=${e.total}=۲۰`,sum===e.total&&e.total===20);
 t(`${e.id}: شماره‌گذاری پیوسته و پاسخ برای همهٔ سؤال‌ها`,j.questions.every((q,i)=>q.no===i+1&&q.text&&q.answer&&!/NaN|undefined/.test(q.text+q.answer+q.solution)));
 t(`${e.id}: دامنهٔ فصل‌ها رعایت شده`,j.questions.every(q=>e.chapters.includes(q.chapter)));
 for(const [k,p] of Object.entries(e.files)){const fp=R+p;const ok=fs.existsSync(fp)&&fs.statSync(fp).size>4000;if(!ok){t(`${e.id}: فایل ${k}`,false,p);continue}
  if(k.endsWith('Pdf'))t(`${e.id}: ${k} یک PDF معتبر`,fs.readFileSync(fp).slice(0,5).toString()==='%PDF-');
  else{const x=cp.spawnSync('unzip',['-p',fp,'word/document.xml'],{maxBuffer:1e8}).stdout.toString();t(`${e.id}: ${k} یک Word معتبر با معادله`,x.includes('<w:body>')&&(x.match(/<m:oMath/g)||[]).length>0)}}
});
t('شناسه‌ها یکتا',ids.size===M.length);
process.exit(f?1:0);
