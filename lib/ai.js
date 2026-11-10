/* اتصال امن سمت‌سرور به DeepSeek (سازگار با OpenAI). کلید فقط از متغیر محیطی خوانده می‌شود. */
const S=require('../js/shared.js'),site=require('./site.js');
const cfg=()=>({key:process.env.DEEPSEEK_API_KEY||'',base:(process.env.DEEPSEEK_BASE_URL||'https://api.deepseek.com').replace(/\/+$/,''),model:process.env.DEEPSEEK_MODEL||'deepseek-flash',timeout:+process.env.AI_TIMEOUT_MS||90000});
const configured=()=>!!cfg().key;
class AIError extends Error{constructor(status,msg){super(msg);this.status=status}}

function chapterContext(slugs,limit){return slugs.map(s=>{const c=site.CH.find(x=>x.slug===s);const t=site.notesHtml(s).replace(/<span class="m">|<div class="m display">/g,' ').replace(/<\/(p|li|h2|h3|tr|div)>/g,'\n').replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\n{2,}/g,'\n').trim().slice(0,limit);return `### فصل ${c.id}: ${c.t}\n${t}`}).join('\n\n')}

function pickSlugs(a,max){if(!Array.isArray(a)||!a.length||a.length>max)throw new AIError(400,'حداقل یک و حداکثر '+max+' فصل انتخاب کنید');const u=[...new Set(a)];if(u.some(s=>!site.CH.some(c=>c.slug===s)))throw new AIError(400,'فصل نامعتبر است');return u}
const int=(v,lo,hi,name)=>{v=Number(v);if(!Number.isInteger(v)||v<lo||v>hi)throw new AIError(400,`«${name}» باید عدد صحیح بین ${lo} و ${hi} باشد`);return v};

function parseExamInput(b){if(!b||typeof b!=='object')throw new AIError(400,'درخواست نامعتبر است');
 const chapters=pickSlugs(b.chapters,4),count=int(b.count,1,30,'تعداد سؤال'),total=Number(b.total);if(!(total>0&&total<=100))throw new AIError(400,'نمرهٔ کل باید بین ۱ و ۱۰۰ باشد');
 const types=[...new Set(Array.isArray(b.types)?b.types:[])].filter(t=>Object.prototype.hasOwnProperty.call(S.QTYPES,t));if(!types.length)throw new AIError(400,'حداقل یک نوع سؤال انتخاب کنید');
 const level=Object.prototype.hasOwnProperty.call(S.LEVELS,b.level)?b.level:'mixed';
 return{chapters,count,total,types,level,answers:b.answers!==false,barem:!!b.barem,note:S.clip(b.note,300)}}
function parseSlidesInput(b){if(!b||typeof b!=='object')throw new AIError(400,'درخواست نامعتبر است');
 const chapter=pickSlugs([b.chapter],1)[0],topic=S.clip(b.topic,150);if(!topic)throw new AIError(400,'موضوع ارائه را وارد کنید');
 return{chapter,topic,count:int(b.count,3,20,'تعداد اسلاید'),style:['simple','examples','review'].includes(b.style)?b.style:'simple'}}

const SYS='You are an expert Iranian grade-9 mathematics teacher and content designer. You write in clear, correct Persian (Farsi). Math formulas must be written in LaTeX inside \\( ... \\). You must ONLY use topics that appear in the provided chapter material; never invent topics outside it. If unsure about a fact, leave it out rather than guessing. Reply with a single valid JSON object only (json), no markdown fences, no commentary.';
function examMessages(p){const ctx=chapterContext(p.chapters,5000);
 const schema='{"title":string,"questions":[{"type":"descriptive|mcq|truefalse|fill|short","level":"easy|medium|hard","text":string,"options":[4 strings, only for mcq],"score":number,"answer":string'+(p.barem?',"barem":[{"step":string,"score":number}]':'')+'}]}';
 const user=`Create a math exam as JSON.\nChapters (source material):\n${ctx}\n\nRequirements:\n- Exactly ${p.count} questions.\n- Allowed question types: ${p.types.join(', ')}.\n- Difficulty: ${p.level==='mixed'?'a balanced mix of easy, medium, hard':p.level}.\n- Total score: ${p.total}; question scores must sum exactly to ${p.total}.\n- ${p.answers?'Give a correct, concise worked "answer" for every question.':'Set "answer" to an empty string.'}\n${p.barem?'- Give a "barem" (grading steps whose scores sum to the question score).\n':''}- Questions must be answerable from the chapters above only. Keep numbers simple.${p.note?'\n- Teacher note: '+p.note:''}\n- JSON schema: ${schema}`;
 return[{role:'system',content:SYS},{role:'user',content:user}]}
function slidesMessages(p){const ctx=chapterContext([p.chapter],7000);
 const user=`Create a Persian slide deck outline as JSON about: "${p.topic}".\nChapter material:\n${ctx}\n\nRequirements:\n- Exactly ${p.count} slides in "slides" (the title slide is added automatically, do not include it).\n- Style: ${{simple:'simple and concise explanation',examples:'example-driven with worked problems',review:'review and exam-prep'}[p.style]}.\n- Max 5 short bullets per slide, each under 18 words. No long paragraphs.\n- Slide types: content, example (use "problem" and "solution"), steps (bullets are ordered steps), formula (use "formula" in LaTeX), summary (last slide).\n- Include at least one worked example and end with a summary slide.\n- JSON schema: {"title":string,"subtitle":string,"slides":[{"type":"content|example|steps|formula|summary","title":string,"bullets":[string],"formula":string?,"problem":string?,"solution":string?,"note":string?}]}`;
 return[{role:'system',content:SYS},{role:'user',content:user}]}

async function chat(messages,maxTokens){const c=cfg();if(!c.key)throw new AIError(503,'کلید DeepSeek روی سرور تنظیم نشده است. فایل .env را بر اساس .env.example بسازید.');
 const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),c.timeout);let res;
 try{res=await fetch(c.base+'/chat/completions',{method:'POST',signal:ctl.signal,headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.key},
  body:JSON.stringify({model:c.model,messages,response_format:{type:'json_object'},thinking:{type:'disabled'},max_tokens:maxTokens,temperature:0.4,stream:false})})}
 catch(e){throw new AIError(504,e.name==='AbortError'?'پاسخ مدل بیش از حد طول کشید؛ دوباره تلاش کنید.':'اتصال به سرویس هوش مصنوعی برقرار نشد.')}finally{clearTimeout(t)}
 if(!res.ok){await res.text().catch(()=>'');throw new AIError(res.status===401||res.status===403?502:res.status===429?429:502,res.status===401?'کلید API نامعتبر است (سرور).':res.status===402?'اعتبار حساب سرویس هوش مصنوعی کافی نیست.':res.status===429?'سرویس هوش مصنوعی شلوغ است؛ کمی بعد تلاش کنید.':'خطای سرویس هوش مصنوعی ('+res.status+').')}
 let j;try{j=await res.json()}catch(e){throw new AIError(502,'پاسخ سرویس خوانده نشد.')}
 const ch=j&&j.choices&&j.choices[0];if(!ch||!ch.message||!ch.message.content)throw new AIError(502,'پاسخ خالی از مدل دریافت شد.');
 if(ch.finish_reason==='length')throw new AIError(502,'پاسخ مدل ناقص ماند؛ تعداد سؤال/اسلاید را کمتر کنید.');
 return ch.message.content}

async function genExam(body){const p=parseExamInput(body);const raw=await chat(examMessages(p),Math.min(7000,900+p.count*(p.barem?420:260)));
 let exam;try{exam=S.validateExam(raw,{barem:p.barem,maxQuestions:p.count})}catch(e){throw new AIError(502,'خروجی مدل قابل‌استفاده نبود: '+e.message)}
 const warnings=[];if(exam.questions.length!==p.count)warnings.push(`مدل ${exam.questions.length} سؤال تولید کرد (درخواست: ${p.count}).`);
 const sum=Math.round(exam.questions.reduce((a,q)=>a+q.score,0)*100)/100;if(Math.abs(sum-p.total)>0.01){S.distributeScores(exam.questions,p.total);warnings.push('نمره‌ها با مجموع کل هم‌خوان نبود و به‌طور مساوی بازتقسیم شد؛ پیش از استفاده بررسی کنید.')}
 if(!p.answers)exam.questions.forEach(q=>q.answer='');
 return{exam,warnings,params:p}}
async function genSlides(body){const p=parseSlidesInput(body);const raw=await chat(slidesMessages(p),Math.min(6500,800+p.count*380));
 let deck;try{deck=S.validateDeck(raw,{maxSlides:p.count})}catch(e){throw new AIError(502,'خروجی مدل قابل‌استفاده نبود: '+e.message)}
 const c=site.CH.find(x=>x.slug===p.chapter);deck.chapter=`فصل ${site.fa(c.id)}: ${c.t}`;return{deck,warnings:deck.slides.length!==p.count?[`مدل ${deck.slides.length} اسلاید تولید کرد (درخواست: ${p.count}).`]:[],params:p}}
module.exports={cfg,configured,AIError,genExam,genSlides,parseExamInput,parseSlidesInput};
