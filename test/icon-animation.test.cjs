const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('dist/icon-motion.js','utf8');
function load(){const window={};vm.runInNewContext(source,{window});return window;}
test('21 subjects and four apps resolve to unique, finite internal demonstrations',()=>{
 const w=load(), entries=[...w.SubjectAnimationRegistry,...Object.values(w.AppAnimationRegistry)];
 assert.equal(entries.length,25);assert.equal(new Set(entries.map(e=>e.id)).size,25);
 for(const entry of entries){assert.ok(entry.effects.length);for(const effect of entry.effects){assert.ok((entry.body.includes(`data-part="${effect.part}"`)||(entry.crops||[]).some(c=>c.part===effect.part)),`${entry.id}: ${effect.part}`);assert.ok(effect.duration+effect.delay<=4000);assert.ok(effect.frames.length>=2);}}
});
test('each rendered icon uses independent gradient ids and preserves an accessible static SVG',()=>{
 const w=load(),ids=[];
 for(let id=0;id<21;id++){const svg=w.AnimatedSubjectIcon({id});assert.match(svg,/aria-hidden="true"/);assert.match(svg,/viewBox="0 0 128 128"/);assert.doesNotMatch(svg,/undefined|NaN/);assert.match(svg,/<image [^>]+class="demo-original"/);ids.push(svg.match(/linearGradient id="([^"]+)"/)[1]);}
 for(const id of ['circuits','maths','biology','chemistry']){const svg=w.AnimatedAppIcon({id});assert.match(svg,/app-concept/);assert.doesNotMatch(svg,/undefined|NaN/);}
 assert.equal(new Set(ids).size,21);
});
test('AND output only illuminates after both inputs are high',()=>{
 const gate=load().SubjectAnimationRegistry[12];const effects=Object.fromEntries(gate.effects.map(e=>[e.part,e]));
 function opacityAt(part,t){const f=effects[part].frames;let previous=f[0];for(let i=1;i<f.length;i++){const next=f[i],end=next.offset??1,start=previous.offset??0;if(t<=end)return previous.opacity+(next.opacity-previous.opacity)*(t-start)/(end-start);previous=next;}return previous.opacity;}
 assert.equal(opacityAt('out',.44),0);assert.equal(opacityAt('a',.5),1);assert.equal(opacityAt('b',.5),1);assert.equal(opacityAt('out',.6),1);assert.equal(opacityAt('out',.81),0);
});
test('elliptical electron paths close and remain inside the icon',()=>{
 const e=load().SubjectAnimationRegistry[1].effects[0];
 const xy=f=>f.transform.match(/-?[0-9]+(?:\.[0-9]+)?(?:e-?[0-9]+)?/g).map(Number);
 const first=xy(e.frames[0]),last=xy(e.frames.at(-1));
 assert.ok(Math.abs(first[0]-last[0])<1e-8&&Math.abs(first[1]-last[1])<1e-8);
 for(const f of e.frames){const [x,y]=xy(f);assert.ok(x>=18&&x<=110&&y>=40&&y<=88);}

});
test('viewport, interaction, reduced-motion and removal cancel finite animations',()=>{
 const events={},media={},timers=new Map(),animations=[];let tick=0,intersection,mutation;
 const node={animate(frames,options){const a={effect:{target:this},frames,options,playState:'running',cancelled:false,cancel(){this.cancelled=true;},reverse(){this.reversed=true;},finished:new Promise(()=>{})};animations.push(a);return a;}};
 const svg={dataset:{animation:'electron-orbits'},isConnected:true,animate:()=>{},querySelector:()=>node,querySelectorAll:()=>[node]};
 const host={contains:()=>false,querySelectorAll:()=>[svg]};const target={closest:()=>host};
 const document={readyState:'complete',hidden:false,querySelector:()=>({}),querySelectorAll:()=>svg.isConnected?[svg]:[],addEventListener:(k,v)=>events[k]=v};
 const reduced={matches:false,addEventListener:(k,v)=>media[k]=v};
 class IO{constructor(cb){intersection=cb;}observe(){}unobserve(){this.unobserved=true;}}
 class MO{constructor(cb){mutation=cb;}observe(){}}
 const window={IntersectionObserver:IO};
 vm.runInNewContext(source,{window,document,matchMedia:()=>reduced,IntersectionObserver:IO,MutationObserver:MO,getComputedStyle:()=>({transform:'none',opacity:'1',strokeDashoffset:'0'}),setTimeout:cb=>{timers.set(++tick,cb);return tick;},clearTimeout:id=>timers.delete(id)});
 const flush=()=>{const queue=[...timers.values()];timers.clear();queue.forEach(cb=>cb());};
 assert.equal(animations.length,0);intersection([{target:svg,isIntersecting:true}]);flush();assert.equal(animations.length,4);
 animations.forEach(a=>assert.equal(a.options.iterations??1,1));
 intersection([{target:svg,isIntersecting:false}]);assert.ok(animations.every(a=>a.cancelled));
 intersection([{target:svg,isIntersecting:true}]);flush();events.pointerover({target,relatedTarget:null});flush();assert.equal(animations.length,12);
 events.pointerout({target,relatedTarget:null});assert.ok(animations.slice(8,12).every(a=>a.cancelled));
 reduced.matches=true;media.change();const count=animations.length;events.focusin({target,relatedTarget:null});flush();assert.equal(animations.length,count);
 reduced.matches=false;events.pointerdown({target,relatedTarget:null});flush();assert.equal(animations.length,count+4);
 document.hidden=true;events.visibilitychange();assert.ok(animations.every(a=>a.cancelled));svg.isConnected=false;mutation();assert.equal(timers.size,0);
});
