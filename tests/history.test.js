/* نگاشت دقیق هفت شخصیت به تصویر و پس‌زمینهٔ خودشان */
const fs=require('fs'),path=require('path');const H=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/history.json'),'utf8'));let f=0;
const t=(n,ok)=>{console.log((ok?'PASS ':'FAIL ')+n);if(!ok)f++};
const CH=require('../js/chapters.js');const order=['euclid','archimedes','khwarizmi','khayyam','pythagoras','newton','noether'];
t('دقیقاً هفت شخصیت',H.length===7);t('ترتیب درست',H.map(h=>h.slug).join()===order.join());
H.forEach((h,i)=>{const n=i+1;t(`${h.nameFa}: m${n} ↔ m${n}${n}`,h.portrait===`/assets/history/m${n}.webp`&&h.background===`/assets/history/m${n}${n}.webp`&&fs.existsSync(path.join(__dirname,'..',h.portrait))&&fs.existsSync(path.join(__dirname,'..',h.background)));
 t(`${h.nameFa}: فیلدهای لازم`,h.nameFa&&h.nameEn&&h.period&&h.summary&&h.contributions.length>=3&&h.note&&h.chapters.length&&h.theme.accent&&Array.isArray(h.media)&&h.biographySections.length>=3&&h.works.length>=1&&h.chapterConnections.length>=1&&h.chapterConnections.every(c=>['direct','educational'].includes(c.kind)&&CH.some(x=>x.slug===c.chapter))&&h.contributions.every(c=>['established','attributed'].includes(c.c)))});
process.exit(f?1:0);
