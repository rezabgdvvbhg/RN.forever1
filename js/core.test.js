const RN=require('./core.js');let f=0;const eq=(n,a,b)=>{const ok=JSON.stringify(a)===JSON.stringify(b);if(!ok)f++;console.log(ok?'PASS':'FAIL',n,ok?'':JSON.stringify(a)+' != '+JSON.stringify(b))};
eq('dup',RN.parseSet('{3,3,4,۳}'),{els:['3','4'],dups:2});eq('empty',RN.parseSet('').els,[]);eq('∅',RN.parseSet('∅').els,[]);
eq('nested',RN.parseSet('{1,{2,1}},{1,2}').els.length,2);eq('union',RN.union(['1','2'],['2','3']),['1','2','3']);eq('diff',RN.diff(['1','2'],['2']),['1']);eq('sym',RN.sym(['1','2'],['2','3']),['1','3']);
eq('2^3',RN.powerset([1,2,3]).length,8);eq('bell',[0,1,2,3,4,5,6].map(n=>Number(RN.bell(n))),[1,1,2,5,15,52,203]);
eq('S(3,k)',RN.stirling(3).map(Number),[0,1,3,1]);eq('enum=bell',RN.partitions([1,2,3,4]).length,15);
eq('chains n=2',RN.boolPoset(2).chains,11);eq('antichains Dedekind',[0,1,2,3,4].map(n=>RN.boolPoset(n).antichains),[2,3,6,20,168]);
eq('max antichains n=2',RN.boolPoset(2).maximalAntichains,3);eq('maxanti size n=4',RN.boolPoset(4).maxAntichainSize,6);
eq('isChain',RN.isChain(RN.setsOf('{1},{1,3},{1,3,4}')),true);eq('isAnti',RN.isAnti(RN.setsOf('{1},{2,3},{2,4}')),true);eq('notAnti',RN.isAnti(RN.setsOf('{1},{1,2}')),false);
eq('root 72',RN.simplifyRoot(72,2),{out:6,rem:2});eq('root3 54',RN.simplifyRoot(54,3),{out:3,rem:2});
const P=RN.polyParse;eq('expand',RN.polyStr(P('(x+1)(x-1)')),'x^2-1');eq('sq',RN.polyStr(P('(2x+3)^2')),'4x^2+12x+9');eq('bad',(()=>{try{P('x+');return 1}catch(e){return 0}})(),0);eq('inj',(()=>{try{P('alert(1)');return 1}catch(e){return 0}})(),0);
eq('gcd',RN.polyStr(RN.polyGcd(P('x^2-1'),P('x^2+2x+1'))),'x+1');eq('roots',RN.realRoots(P('x^2-1')),[-1,1]);eq('norot',RN.realRoots(P('x^2+1')),[]);
eq('line',RN.line(0,1,2,5),{m:2,b:1});eq('vert',RN.line(1,0,1,5).vertical,true);eq('lin none',RN.solveLinear(2,1,2,3).type,'none');eq('lin inf',RN.solveLinear(2,1,2,1).type,'inf');eq('lin',RN.solveLinear(3,1,1,5).x,2);
eq('tri bad',!!RN.tri(1,2,3).err,true);eq('tri 345',Math.round(RN.tri(3,4,5).area),6);eq('V sphere',Math.round(RN.solids.sphere.V(3)),113);
eq('fmt',RN.fmt(0.5),'1/2');eq('num fa',RN.num('۱٫۵'),1.5);eq('num frac',RN.num('3/4'),0.75);
console.log(f?f+' FAILED':'ALL PASSED');process.exit(f?1:0)
