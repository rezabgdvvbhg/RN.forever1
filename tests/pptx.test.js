/* ساخت PPTX واقعی با همهٔ چیدمان‌ها؛ فرمول‌ها نباید LaTeX خام داشته باشند */
const P=require('pptxgenjs'),B=require('../js/pptx-build.js'),X=require('../js/pptx-math.js'),fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');let f=0;
const t=(n,ok,x)=>{console.log((ok?'PASS ':'FAIL ')+n+(ok?'':' ← '+x));if(!ok)f++};
const deck={title:'اجتماع، اشتراک و کسرهای گویا',subtitle:'نمونهٔ آزمایشی رادیکال RN',chapter:'فصل ۷: عبارت‌های گویا',slides:[
 {type:'concept',title:'مفهوم: ساده کردن کسر گویا',bullets:['عامل مشترک صورت و مخرج را حذف می‌کنیم: \\(\\frac{x^2-1}{x+1}=x-1\\)','شرط دامنه: \\(x\\neq-1\\)','توان‌ها: \\(2^{-3}=\\frac{1}{8}\\) و \\(\\sqrt{18}=3\\sqrt{2}\\)']},
 {type:'formula',title:'فرمول حجم کره',formula:'V=\\frac{4}{3}\\pi r^3',bullets:['\\(r\\) شعاع کره است.']},
 {type:'formula',title:'اتحاد مزدوج و کسر',formula:'\\frac{x^2-1}{x+1}=x-1',bullets:['به شرط \\(x\\neq-1\\)']},
 {type:'example',title:'مثال حل‌شده',problem:'حاصل \\(\\frac{x+2}{x-3}\\div\\frac{x+2}{x+1}\\) را ساده کنید.',solution:'معکوس دومی را ضرب می‌کنیم: \\(\\frac{x+2}{x-3}\\times\\frac{x+1}{x+2}\\)\nپاسخ: \\(\\frac{x+1}{x-3}\\) به شرط \\(x\\neq3,-1,-2\\)'},
 {type:'steps',title:'حل معادله گام‌به‌گام',bullets:['معادلهٔ \\(2x+3=11\\)','از دو طرف ۳ تا کم می‌کنیم: \\(2x=8\\)','دو طرف را بر ۲ تقسیم می‌کنیم: \\(x=4\\)'],formula:'x=4'},
 {type:'compare',title:'مقایسه: اجتماع و اشتراک',left:{title:'اشتراک \\(A\\cap B\\)',bullets:['عضوهای مشترک']},right:{title:'اجتماع \\(A\\cup B\\)',bullets:['همهٔ عضوها بدون تکرار']}},
 {type:'diagram',title:'نمودار ون',diagram:{kind:'venn',a:'A',b:'B',onlyA:'1, 2',both:'3',onlyB:'4, 5',outside:'6'},bullets:['\\(A\\cap B=\\{3\\}\\)','\\(A\\cup B=\\{1,2,3,4,5\\}\\)']},
 {type:'diagram',title:'عددهای گنگ روی محور',diagram:{kind:'numberline',min:-3,max:5,points:[{v:1.414,label:'\\sqrt{2}'},{v:-1.732,label:'-\\sqrt{3}'},{v:3.14159,label:'\\pi'}]},bullets:['\\(\\sqrt2\\approx1.41\\)']},
 {type:'diagram',title:'قضیهٔ فیثاغورس',diagram:{kind:'rtriangle',a:'3',b:'4',c:'5'},bullets:['\\(3^2+4^2=5^2\\)'],formula:'a^2+b^2=c^2'},
 {type:'practice',title:'تمرین',bullets:['\\(\\sqrt{50}\\) را ساده کنید.','دامنهٔ \\(\\frac{1}{x^2-4}\\) را بنویسید.']},
 {type:'summary',title:'جمع‌بندی',bullets:['اجتماع: همه','اشتراک: مشترک‌ها','\\(a^0=1\\)']}]};
(async()=>{const out=path.join(os.tmpdir(),'rn-test.pptx');await B.build(P,deck,{theme:'classic'}).writeFile({fileName:out});
 t('فایل pptx ساخته شد',fs.statSync(out).size>20000);
 const xml=cp.spawnSync('unzip',['-p',out,'ppt/slides/slide2.xml']).stdout.toString()+Array.from({length:11},(_,i)=>cp.spawnSync('unzip',['-p',out,`ppt/slides/slide${i+3}.xml`]).stdout.toString()).join('');
 const texts=[...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(m=>m[1]).join(' ');
 t('هیچ LaTeX خامی در اسلایدها نیست (\\frac, \\sqrt, \\( ...)',!/\\frac|\\sqrt|\\\(|\\\)|\\cup|\\cap|\\pi|\^\{|frac\s/.test(texts),texts.match(/.{20}(\\\w+).{10}/)||'');
 t('توان با superscript واقعی (baseline مثبت)',/baseline="30000"/.test(xml)&&/baseline="-25000"|baseline="30000"/.test(xml));
 t('رادیکال و کسر یونیکد موجود',/√/.test(texts)&&/⁄/.test(texts));
 t('اسلاید با ۱۲ صفحه (عنوان + ۱۱)',cp.spawnSync('unzip',['-l',out]).stdout.toString().match(/ppt\/slides\/slide\d+\.xml/g).length===12);
 for(const th of Object.keys(B.THEMES)){const b=await B.build(P,deck,{theme:th}).write({outputType:'nodebuffer'});if(b[0]!==0x50||b[1]!==0x4b){t('قالب '+th,false);}}
 t('همهٔ قالب‌ها zip معتبر می‌سازند',true);
 try{B.build(P,{slides:[]});t('رد ارائهٔ خالی',false)}catch(e){t('رد ارائهٔ خالی',true)}
 const r=X.plain('\\(\\frac{x^2-1}{x+1}\\)');t('کسر پیچیده با پرانتز',r==='(x2−1)⁄(x+1)',r);
 process.exit(f?1:0)})();
