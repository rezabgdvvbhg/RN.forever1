/* دروازهٔ مقدمه (همگام و کوچک): تصمیم می‌گیرد مقدمه نمایش داده شود تا صفحه چشمک نزند.
   پیش‌نمایش برای توسعه: افزودن ‎?intro=1‎ به نشانی، یا RN_INTRO.replay() در کنسول. */
(function(){try{var q=/[?&]intro=1(&|$)/.test(location.search);var seen=false;try{seen=localStorage.getItem('rn-intro-v1')==='1'}catch(e){}
 var red=matchMedia('(prefers-reduced-motion:reduce)').matches;var landing=location.pathname==='/'||location.pathname==='';
 if(q||(landing&&!seen&&!red))document.documentElement.classList.add('intro-on')}catch(e){}})();
