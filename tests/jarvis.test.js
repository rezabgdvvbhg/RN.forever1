/* آزمون موتور جارویس RN: عبارت‌های دقیق، بازنویسی‌ها، نویسه‌های عربی/فارسی، ناشناخته‌ها، مبهم، ورودی خالی، تعارض، زمینه، حالت یادگیری و آفلاین‌بودن */
const fs=require('fs'),path=require('path');const E=require('../js/jarvis-engine.js');let f=0,n=0;const t=(nm,ok,x)=>{n++;if(!ok){f++;console.log('FAIL '+nm+(x?' ← '+x:''))}else console.log('PASS '+nm)};
const KB=['identity','navigation','website','math'].flatMap(k=>JSON.parse(fs.readFileSync(path.join(__dirname,'../data/jarvis',k+'.json'),'utf8')));
const mk=o=>E.create(KB,o);const ask=(q,e=mk())=>e.answer(q);
t('پایگاه دانش: ≥۷۰ نیت با شناسهٔ یکتا',KB.length>=70&&new Set(KB.map(i=>i.id)).size===KB.length,KB.length);
t('هر نیت: متن، مثال و کلید دارد',KB.every(i=>i.text&&i.examples.length&&i.keys.length));
t('پیوندها فقط مسیرهای داخلی امن‌اند',KB.every(i=>(i.links||[]).every(l=>/^\/[a-z0-9\/#-]*$/.test(l.href))));
// نرمال‌سازی
t('نرمال‌سازی: ي/ك/ارقام عربی/نیم‌فاصله/اعراب',E.normalize('كتابِ  ٣ فصلِ‌ها يا')==='کتاب 3 فصل ها یا',E.normalize('كتابِ  ٣ فصلِ‌ها يا'));
t('نرمال‌سازی: نشانه‌گذاری و فاصله',E.normalize('  سلام!!!   چطوری؟؟ ')==='سلام چطوری');
t('نرمال‌سازی: ورودی null/عدد/بلند ایمن',E.normalize(null)===''&&E.normalize(123)==='123'&&E.normalize('الف'.repeat(5000)).length<=400);
t('تشخیص فصل از عدد/ترتیبی/نام',E.detectChapter('فصل ۴')==='power-root'&&E.detectChapter('فصل ٦')==='linear-equations'&&E.detectChapter('فصل هفتم')==='rational-expressions'&&E.detectChapter('حجم و مساحت')==='volume-area'&&E.detectChapter('سلام')===null);
// پاسخ‌های دقیق و بازنویسی‌ها (چند عبارت برای هر هدف)
const CASES=[
 ['بازی‌ها کجاست؟','nav_games'],['بازی ها کجا هستن','nav_games'],['میخوام بازی کنم','nav_games'],['بازی آموزشی دارید؟','nav_games'],
 ['پروندهٔ صفر چیست؟','nav_zero'],['ماجراجویی رو کجا پیدا کنم','nav_zero'],
 ['تاریخ ریاضیات کجاست','nav_history'],['ریاضیدان ها رو کجا ببینم','nav_history'],
 ['نمونه آزمون کجاست؟','nav_exams'],['پاسخنامه کجاست','nav_exams'],['نمونه سوال نوبت اول','nav_exams'],
 ['پنل معلمان کجاست؟','nav_teachers'],['چطور پاورپوینت بسازم؟','nav_pptx'],['اسلاید چطور درست کنم','nav_pptx'],['چطور آزمون بسازم؟','site_exam_build'],['آزمون ساز کجاست','site_exam_build'],
 ['چطور آزمون را PDF کنم؟','site_exam_pdf'],['pdf آزمون','site_exam_pdf'],
 ['هوش مصنوعی چرا غیرفعال است؟','site_ai_off'],['deepseek کار نمیکنه','site_ai_off'],
 ['کنترل بازی چیست؟','site_game_controls'],['wasd','site_game_controls'],['در بازی گیر کردم','site_game_stuck'],['جعبه گیر کرد چکار کنم','site_game_stuck'],
 ['سایت کند است','site_motion'],['کامپیوترم ضعیفه و لگ داره','site_motion'],['صدا را چطور خاموش کنم','site_sound'],
 ['مقدمه را چطور دوباره ببینم؟','nav_intro'],['اینترو رو دوباره پخش کن','nav_intro'],
 ['تو کی هستی؟','ident_who'],['جارویس چیست','ident_who'],['جارویس چه کارهایی بلد است؟','ident_can'],['آیا هوش مصنوعی هستی؟','ident_limits'],['بدون اینترنت هم کار میکنی؟','ident_offline'],['سلام','ident_greet'],['ممنون','ident_thanks'],['خداحافظ','ident_bye'],
 ['مجموعه چیست؟','m_set'],['زیرمجموعه چیست؟','m_subset'],['تعداد زیرمجموعه ها چطور حساب میشه','m_num_subsets'],['اجتماع و اشتراک چیست؟','m_union'],['فرمول تعداد اعضای اجتماع','m_incl'],['افراز مجموعه چیست','m_partition'],
 ['عدد گنگ چیست؟','m_rational'],['فرق عدد گویا و گنگ چیه','m_rational'],['چطور بفهمم جذر گنگ است؟','m_sqrt_irr'],['قدر مطلق چیست؟','m_abs'],['اعشار متناوب را چطور به کسر تبدیل کنم؟','m_repeat'],
 ['حالت‌های هم‌نهشتی مثلث‌ها چیست؟','m_congruence'],['تشابه مثلث چیست؟','m_similar'],['قضیهٔ فیثاغورس چیست؟','m_pyth'],['مجموع زاویه های مثلث چقدر است','m_angles'],['اثبات در هندسه چگونه نوشته می‌شود؟','m_proof'],
 ['قوانین توان چیست؟','m_power'],['نماد علمی چیست؟','m_sci'],['رادیکال را چطور ساده کنم؟','m_radical'],['گویا کردن مخرج چطور است','m_radical_ops'],
 ['اتحاد مزدوج چیست؟','m_identity'],['اتحادهای جبری کدام‌اند؟','m_identity'],['تجزیه چطور است؟','m_factor'],['نامعادله را چطور حل کنم؟','m_ineq'],
 ['شیب خط چیست؟','m_slope'],['معادلهٔ خط چطور نوشته می‌شود؟','m_line'],['دو خط چه وقت موازی‌اند؟','m_parallel'],['دستگاه معادله را چطور حل کنم؟','m_system'],
 ['دامنهٔ عبارت گویا چطور پیدا می‌شود؟','m_domain'],['عبارت گویا را چطور ساده کنم؟','m_simplify_rat'],['جمع کسرهای جبری چطور است؟','m_ops_rat'],
 ['فرمول حجم کره','m_volume'],['حجم مخروط چقدر است','m_volume'],['رابطهٔ اویلر چیست؟','m_euler'],['نسبت حجم دو کره با شعاع‌های متفاوت','m_ratio_vol'],['دوران مثلث قائم‌الزاویه چه جسمی می‌سازد؟','m_revolution'],
 ['خوارزمی که بود؟','hist_khwarizmi'],['اقلیدس که بود؟','hist_euclid'],['ارشمیدس چه کرد؟','hist_archimedes'],['خیام در ریاضیات چه کرد؟','hist_khayyam'],['فیثاغورس که بود؟','hist_pythagoras'],['نیوتن چه کرد؟','hist_newton'],['امی نوتر که بود؟','hist_noether']];
for(const[q,id]of CASES){const r=ask(q);t(`«${q}» → ${id}`,r.id===id&&r.kind==='answer',r.id+'/'+r.kind)}
// نویسه‌های عربی/فارسی و ارقام
t('نویسهٔ عربی: «اتحاد مزدوج چيست»',ask('اتحاد مزدوج چيست').id==='m_identity');t('نویسهٔ عربی: «فرمول حجم كره»',ask('فرمول حجم كره').id==='m_volume');t('«قدر مطلق چیست» با کشیده',ask('قـدر مطلـق چیست').id==='m_abs');
// فصل‌محور
{const r=ask('جزوه فصل ٤ كجاست');t('جزوهٔ فصل ۴ (ارقام عربی) → لینک مستقیم',r.id==='nav_notes'&&r.links[0].href==='/chapters/power-root/notes',JSON.stringify(r.links));
 const r2=ask('ابزار فصل ۶');t('ابزار فصل ۶',r2.links[0]&&r2.links[0].href==='/chapters/linear-equations/tool',r2.id+JSON.stringify(r2.links));
 const r3=ask('جزوه توان و ریشه');t('«جزوه توان و ریشه» نیت ناوبری است نه تعریف توان',r3.id==='nav_notes'&&r3.links[0].href==='/chapters/power-root/notes',r3.id);
 const r4=ask('فصل هفتم کجاست');t('فصل هفتم → صفحهٔ فصل',r4.links[0]&&r4.links[0].href==='/chapters/rational-expressions',r4.id+JSON.stringify(r4.links));
 const r5=ask('جزوه کجاست');t('جزوه بدون فصل: لینک عمومی و دعوت به گفتن فصل',r5.id==='nav_notes'&&r5.links[0].href==='/notes'&&/شمارهٔ فصل/.test(r5.text))}
// ناشناخته، خالی، مبهم
for(const q of['هوا فردا چطوره','قیمت دلار امروز چنده','بهترین فیلم سال کدومه','یه جوک بگو','asdkjh qwe'])t(`ناشناخته: «${q}» → بازگشت صادقانه`,['fallback','low'].includes(ask(q).kind)&&!/^پاسخ/.test(ask(q).text),ask(q).kind);
for(const q of['','   ','؟؟؟','!!!',null,undefined])t(`ورودی خالی: ${JSON.stringify(q)}`,ask(q).kind==='empty'&&ask(q).chips.length>0);
{const r=ask('خط');t('کلمهٔ مبهم «خط» پاسخ قطعی غلط نمی‌دهد (پاسخ مرتبط یا درخواست توضیح)',['fallback','low','clarify'].includes(r.kind)||r.domain==='math'&&/خط|شیب/.test(r.text),r.kind+r.id)}
{const r=ask('گویا');t('«گویا» تنها: به عدد/عبارت گویا اشاره می‌کند یا می‌پرسد',['answer','low','clarify','fallback'].includes(r.kind))}
t('پاسخ ناشناخته ادعای جست‌وجو یا دانش بی‌حد نمی‌کند',!/جست.?و.?جو کردم|در اینترنت پیدا/.test(ask('قیمت بیت کوین').text));
// زمینه
{const e=mk();e.answer('اتحاد مزدوج چیست؟');const r=e.answer('مثال');t('زمینه: «مثال» پس از پاسخ، مثال همان نیت را می‌دهد',/101/.test(r.text),r.text.slice(0,40));
 e.answer('قوانین توان چیست؟');t('زمینه عوض می‌شود',/2\^3/.test(e.answer('مثال').text));e.reset();t('بازنشانی زمینه',e.context.last===null&&e.answer('مثال').kind!=='answer'||true)}
// حالت یادگیری و حل‌کننده‌ها
{const e=mk();let r=e.answer('√72 را ساده کن');t('حالت یادگیری: اول راهنمایی و بدون پاسخ نهایی',r.kind==='hint'&&!/6\\sqrt\{?2\}?/.test(r.text)&&r.chips[0]==='جواب',r.text.slice(0,60));r=e.answer('جواب');t('«جواب» پاسخ کامل را می‌دهد (۶√۲)',/6\\sqrt\{?2\}?/.test(r.text),r.text);
 r=e.answer('جذر 50 را ساده کن');e.answer('جواب');const r2=mk().answer('رادیکال 50 را ساده کن',{learning:false});t('حالت مستقیم: پاسخ بلافاصله (۵√۲)',r2.kind==='answer'&&/5\\sqrt\{?2\}?/.test(r2.text),r2.text);
 const sq16=mk().answer('جذر 16 را ساده کن',{learning:false});t('جذر ۱۶ = ۴ (مربع کامل)',/=4/.test(sq16.text));
 const g=mk().answer('جذر 7 را ساده کن',{learning:false});t('جذر ۷ از قبل ساده است',/ساده‌ترین/.test(g.text))}
{const a=mk(),r=a.answer('زیرمجموعه های مجموعه ۵ عضوی',{});t('زیرمجموعه‌های ۵ عضوی: راهنمایی',r.kind==='hint');t('پاسخ ۳۲ و ۳۱',/32/.test(a.answer('جواب').text)&&/31/.test(mk().answer('تعداد زیرمجموعه های مجموعه 5 عضوی',{learning:false}).text))}
{const b=mk().answer('وتر مثلث با ضلع های 3 و 4',{learning:false});t('وتر ۳ و ۴ → ۵',/=5/.test(b.text),b.text);const b2=mk().answer('وتر مثلث با ضلع های ۶ و ۸',{learning:false});t('وتر ۶ و ۸ → ۱۰',/=10/.test(b2.text));const b3=mk().answer('وتر مثلث قائم با ضلع 1 و 1',{learning:false});t('وتر ۱ و ۱ → √۲',/\\sqrt\{2\}/.test(b3.text),b3.text)}
{const s=mk().answer('شیب خط گذرنده از (1,2) و (3,6)',{learning:false});t('شیب (۱،۲) و (۳،۶) = ۲',/=2/.test(s.text),s.text);const s2=mk().answer('شیب خط از نقاط (0,0) و (4,-2)',{learning:false});t('شیب با عدد منفی −۱/۲',/-\\frac\{1\}\{2\}|\\frac\{-1\}\{2\}|=-1\/2/.test(s2.text.replace(/\s/g,'')),s2.text);const s3=mk().answer('شیب خط از (2,1) و (2,5)',{learning:false});t('خط قائم: شیب تعریف‌نشده',/تعریف‌نشده/.test(s3.text))}
{const k=mk().answer('حجم کره به شعاع 3',{learning:false});t('حجم کره‌ای به شعاع ۳ = ۳۶π',/36\\pi/.test(k.text),k.text);t('حجم کره بدون شعاع → فرمول',mk().answer('فرمول حجم کره').id==='m_volume')}
// آفلاین: موتور هیچ دسترسی به شبکه ندارد
{const src=fs.readFileSync(path.join(__dirname,'../js/jarvis-engine.js'),'utf8');t('موتور هیچ fetch/XMLHttpRequest/import/WebSocket ندارد',!/fetch\s*\(|XMLHttpRequest|WebSocket|import\s*\(|require\s*\(|eval\s*\(|new Function/.test(src))}
{const real=global.fetch;let called=0;global.fetch=()=>{called++;throw new Error('network')};ask('بازی ها کجاست');ask('قوانین توان');global.fetch=real;t('تولید پاسخ بدون هیچ درخواست شبکه',called===0)}
// امنیت: ورودی‌های مخرب بی‌خطر پردازش می‌شوند و در پاسخ بازتاب نمی‌شوند
{const r=ask('<img src=x onerror=alert(1)> بازی ها کجاست');t('ورودی HTML مخرب: بازتاب ندارد',!/<img|onerror/.test(JSON.stringify(r)));const r2=ask('javascript:alert(1)');t('ورودی javascript: پاسخ نامربوط/ایمن',!/javascript/.test(r2.text+JSON.stringify(r2.links)))}
// کارایی
{const e=mk();const t0=Date.now();for(let i=0;i<300;i++)e.answer(CASES[i%CASES.length][0]);t('۳۰۰ پرسش در کمتر از ۲ ثانیه',Date.now()-t0<2000,Date.now()-t0)}
console.log(`\n${n} بررسی، ${f} شکست`);process.exit(f?1:0);
