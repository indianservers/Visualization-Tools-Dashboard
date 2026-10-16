/* Finite educational micro-demonstrations. No dependencies or whole-icon transforms. */
(() => {
  'use strict';
  const registry = [];
  const part = (name,html) => `<g data-part="${name}">${html}</g>`;
  const text = (x,y,t,size=13) => `<text x="${x}" y="${y}" font-size="${size}">${t}</text>`;
  const pulse = [{opacity:0},{opacity:1,offset:.45},{opacity:1,offset:.65},{opacity:0}];
  const flash = [{opacity:0},{opacity:1,offset:.3},{opacity:1,offset:.65},{opacity:0}];
  const draw = [{strokeDashoffset:1},{strokeDashoffset:0,offset:.7},{strokeDashoffset:0}];
  const move = (x,y) => [{transform:'translate(0px,0px)'},{transform:`translate(${x}px,${y}px)`,offset:.45},{transform:`translate(${x}px,${y}px)`,offset:.65},{transform:'translate(0px,0px)'}];
  const grow = [{transform:'scaleY(1)'},{transform:'scaleY(.25)',offset:.15},{transform:'scaleY(1)',offset:.7},{transform:'scaleY(1)'}];
  const effect = (part,frames,delay=0,duration=2200) => ({part,frames,delay,duration});
  function add(id,body,effects){registry.push({id,body,effects});}
  ["pi-draw","electron-orbits","helix-twist","atomic-bonding","forward-propagation","cluster-learning","cpu-instructions","robot-processing","graph-traversal","record-stack","vision-detection","chip-signals","and-truth-table","pcb-led-sequence","filament-idea","language-tokenization","lock-encryption","statistical-trend","business-insight","database-query","process-scheduler","app-circuit-completion","app-equation","app-base-pairs","app-molecular-bond"].forEach(id=>add(id,'',[]));
  // Original raster materials remain visible for the entire sequence. Cropped
  // components use pixels from that same image, rather than flat SVG substitutes.
  const rect = (x,y,w,h,rx=0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
  const circle = (x,y,r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  const stroke = (d,cls='') => `<path d="${d}" pathLength="1" class="${cls}"/>`;
  const bead = (x,y,r=2.5) => `<circle cx="${x}" cy="${y}" r="${r}" class="demo-bead"/>`;
  function revise(index,body,effects,crops=[]){Object.assign(registry[index],{body,effects,crops});}
  revise(0,part('pi',stroke('M24 52Q42 35 69 36L106 31M49 39Q45 80 26 100M78 38Q66 97 101 92','demo-pi'))+part('symbols',text(15,26,'∑',10)+text(102,111,'∞',10)),[effect('pi',draw,0,2300),effect('symbols',flash,900,1600)]);
  const orbit = (cx,cy,rx,ry,start) => Array.from({length:65},(_,i)=>{const angle=start+i*Math.PI/32;return {transform:`translate(${cx+rx*Math.cos(angle)}px,${cy+ry*Math.sin(angle)}px)`,offset:i/64};});
  const orbitBodies = [0,60,120].map((angle,i)=>`<g transform="rotate(${angle} 64 64)">${part('electron'+i,bead(0,0,3))}</g>`).join('');
  revise(1,orbitBodies,[0,1,2].map(i=>effect('electron'+i,orbit(64,64,43,19,i*2),0,2800)));
  const dnaCrops=Array.from({length:8},(_,i)=>({part:'base'+i,shape:rect(48,21+i*11,30,5,2)}));
  const dnaEffects = Array.from({length:8},(_,i)=>effect('base'+i,[{transform:'translateX(0) scaleX(1)'},{transform:`translateX(${Math.sin(i*.8)*5}px) scaleX(.45)`,offset:.35},{transform:`translateX(${-Math.sin(i*.8)*4}px) scaleX(.85)`,offset:.7},{transform:'translateX(0) scaleX(1)'}],i*50,2600));
  revise(2,'',dnaEffects,dnaCrops);
  revise(3,`<g transform="translate(29 55) scale(.55)">${orbitBodies}${part('nucleus',bead(64,64,7))}${part('bond',stroke('M66 65L97 78')+bead(100,80,4))}</g>`,[...[0,1,2].map(i=>effect('electron'+i,orbit(64,64,37,16,i*2),0,2600)),effect('nucleus',pulse,0,2400),effect('bond',flash,1000,1500)]);
  const brainLayers=['M26 66L38 45L49 70L33 88','M49 70L62 44L78 63L64 89','M78 63L94 44L105 71L91 88'];
  revise(4,brainLayers.map((d,i)=>part('layer'+i,stroke(d)+bead(38+i*28,63,2))).join(''),[0,1,2].map(i=>effect('layer'+i,flash,i*600,1300)));
  const clusters=[[22,56,8],[60,34,9],[104,58,8],[23,93,9],[68,104,9],[103,91,9]];
  revise(5,part('learned',stroke('M22 56L23 93L60 34M104 58L68 104L103 91')),[...clusters.map((_,i)=>effect('node'+i,move(i<3?-3:3,i%2?-3:3),i*60,2400)),effect('learned',flash,1100,1400)],clusters.map(([x,y,r],i)=>({part:'node'+i,shape:circle(x,y,r)})));
  revise(6,part('binary',text(32,46,'1010',8))+part('bus',stroke('M31 55H67V62H96M32 70H76V78H48')),[effect('binary',move(14,0),0,2200),effect('bus',draw,400,2200)]);
  revise(7,part('eye-glow',bead(64,49.5,3)+bead(87.5,51,3)),[effect('eyes', [{transform:'scaleY(1)'},{transform:'scaleY(.08)',offset:.13},{transform:'scaleY(1)',offset:.21},{transform:'translateX(2px)',offset:.45},{transform:'translateX(-2px)',offset:.7},{transform:'translateX(0)'}],0,2600),effect('eye-glow',flash,900,1300)],[{part:'eyes',shape:circle(64,49.5,6)+circle(87.5,51,6),underlay:'<ellipse cx="64" cy="49.5" rx="6" ry="6" fill="#071b30"/><ellipse cx="87.5" cy="51" rx="6" ry="6" fill="#071b30"/>'}]);
  const traversal=[[62,32],[79,59],[101,86],[66,95],[44,71],[27,106]];
  revise(8,part('route',stroke('M62 32L79 59L101 86L66 95L44 71L27 106'))+traversal.map(([x,y],i)=>part('visit'+i,bead(x,y,4))).join(''),[effect('route',draw,0,2600),...traversal.map((_,i)=>effect('visit'+i,flash,i*340,850))]);
  const packet3d = (x,y) => `<path d="M${x} ${y}l9 -3l5 4v7l-9 3l-5 -4Z" class="demo-packet"/>`;
  revise(9,part('insert',packet3d(15,48))+part('record',stroke('M25 70Q64 84 103 70'))+part('retrieve',packet3d(75,83)),[effect('insert',[{opacity:0,transform:'translateX(-5px)'},{opacity:1,transform:'translateX(5px)',offset:.2},{opacity:0,transform:'translateX(32px)'}],0,1300),effect('record',flash,850,1100),effect('retrieve',[{opacity:0},{opacity:1,transform:'translate(0px,0px)',offset:.2},{opacity:0,transform:'translate(24px,-32px)'}],1500,1300)]);
  revise(10,part('scan',stroke('M40 53V79'))+part('frame',stroke('M64 60V56H69M77 56H82V61M82 68V73H77M69 73H64V68'))+part('object',bead(73,65,3)),[effect('scan',move(48,0),0,2000),effect('frame',flash,1100,1600),effect('object',flash,900,1600)]);
  revise(11,part('pins',stroke('M13 44H29V57H43M115 84H98V77H87M54 15V28H74V35'))+part('core',stroke('M41 45H87V88H41Z')),[effect('pins',draw,0,2300),effect('core',flash,1200,1300)]);
  const gateFrames={a:[{opacity:0},{opacity:0,offset:.18},{opacity:1,offset:.2},{opacity:1,offset:.78},{opacity:0,offset:.8},{opacity:0}],b:[{opacity:0},{opacity:0,offset:.43},{opacity:1,offset:.45},{opacity:1,offset:.78},{opacity:0,offset:.8},{opacity:0}],out:[{opacity:0},{opacity:0,offset:.49},{opacity:1,offset:.51},{opacity:1,offset:.78},{opacity:0,offset:.8},{opacity:0}]};
  revise(12,part('a',stroke('M15 46H36')+bead(31,46,3))+part('b',stroke('M15 80H36')+bead(31,80,3))+part('bias',stroke('M15 61H36')+text(20,58,'1',7))+part('out',stroke('M98 65H117')+bead(112,65,3))+part('truth',text(30,113,'1 · 1 · 1 = 1',7)),Object.entries(gateFrames).map(([name,frames])=>effect(name,frames,0,2800)).concat(effect('bias',[{opacity:1},{opacity:1}],0,2800),effect('truth',flash,1500,1000)));
  revise(13,part('current',stroke('M25 77L45 72L55 88L82 81L98 66'))+[[32,53],[52,88],[97,69]].map(([x,y],i)=>part('led'+i,bead(x,y,3))).join(''),[effect('current',draw,0,2600),...[0,1,2].map(i=>effect('led'+i,flash,500+i*550,900))]);
  revise(14,part('filament',stroke('M56 73L51 47L59 43L66 49L73 42L79 46L70 73','demo-filament'))+part('idea',stroke('M29 36L23 31M96 36L102 31M63 13V7')),[effect('filament',draw,0,1900),effect('heat',flash,900,1600),effect('idea',flash,1500,1100)]);
  registry[14].body+=part('heat','<ellipse cx="64" cy="51" rx="23" ry="26" class="demo-heat"/>');
  revise(15,[45,63,82].map((x,i)=>part('dot'+i,bead(x,63,4))).join('')+part('wave',stroke('M35 79H42L47 73L53 84L60 75L66 80H90'))+part('tokens',[38,56,74].map(x=>rect(x,76,12,7,2)).join('')),[...[0,1,2].map(i=>effect('dot'+i,flash,i*260,900)),effect('wave',flash,700,1000),effect('tokens',flash,1500,1200)]);
  revise(16,part('keyhole',bead(61,74,3)+stroke('M61 76V84'))+part('cipher',text(33,105,'0110 1011',8)),[effect('shackle',[{transform:'translateY(0)'},{transform:'translateY(-5px)',offset:.15},{transform:'translateY(0)',offset:.4},{transform:'translateY(0)'}],0,2200),effect('keyhole',flash,850,1100),effect('cipher',flash,1300,1200)],[{part:'shackle',shape:'<path d="M46 60V49C46 35 72 35 72 49V60H67V49C67 43 51 43 51 49V60Z"/>',underlay:'<path d="M46 60V49C46 35 72 35 72 49V60H67V49C67 43 51 43 51 49V60Z" fill="#46c9ff"/>'}]);
  // Partition in the transparent gaps between columns, so scaling never leaves
  // a stationary rim of the original column behind.
  const statShapes=[rect(6,6,28,116),rect(34,6,25,116),rect(59,6,25,116),rect(84,6,38,116)];
  revise(17,part('trend',stroke('M24 80L49 63L74 45L100 21')),[...[0,1,2,3].map(i=>effect('bar'+i,grow,i*140,2100)),effect('trend',draw,900,1800)],statShapes.map((shape,i)=>({part:'bar'+i,shape})));
  revise(18,part('columns','<path d="M22 69L31 66V108L22 111ZM37 55L47 51V106L37 109ZM52 30L63 27V104L52 106Z" class="demo-column-light"/>')+part('selected',stroke('M26 75L35 72V105L26 110Z'))+part('lens-scan',stroke('M77 41V82')),[effect('columns',grow,0,1800),effect('lens-scan',move(17,0),500,2100),effect('selected',flash,1500,1300)]);
  revise(19,part('packet',packet3d(10,49))+part('query',rect(67,66,11,9,1))+part('result',packet3d(83,83)),[effect('packet',[{opacity:0,transform:'translateX(-4px)'},{opacity:1,transform:'translateX(7px)',offset:.25},{opacity:0,transform:'translateX(29px)'}],0,1300),effect('query',flash,900,1100),effect('result',[{opacity:0},{opacity:1,transform:'translate(0px,0px)',offset:.2},{opacity:0,transform:'translate(20px,-24px)'}],1600,1200)]);
  const gearOutline=[[140,90],[166,90],[170,108],[177,111],[187,102],[204,113],[193,131],[197,140],[216,142],[216,161],[194,166],[189,176],[199,190],[181,204],[167,195],[160,200],[160,215],[140,215],[137,198],[129,193],[117,203],[104,190],[113,174],[109,165],[95,160],[95,143],[111,140],[115,128],[107,116],[119,102],[133,110],[138,105]];
  const gearShape='<path d="'+gearOutline.map(([x,y],i)=>(i?'L':'M')+(6+x*116/256)+' '+(6+y*116/256)).join('')+'Z"/>';
  revise(20,[28,43,58].map((x,i)=>part('process'+i,bead(x,34,3))).join(''),[effect('gear',[{transform:'rotate(0deg)'},{transform:'rotate(90deg)'}],0,2800),...[0,1,2].map(i=>effect('process'+i,flash,i*600,1000))],[{part:'gear',shape:gearShape,underlay:'<g class="demo-window-underlay">'+gearShape+'</g>'}]);
  revise(21,part('wire',stroke('M31 80V47H47L52 42L57 52L62 42L67 52L72 47H98V82H77M52 82H31'))+part('led',bead(96,47,4)),[effect('wire',draw,0,2300),effect('led',flash,1800,1000)]);
  revise(22,part('numbers',text(43,34,'2  3',9))+part('equation',text(34,34,'2 + 3 = 5',8))+part('answer',rect(73,23,12,14,2)),[effect('numbers',[{opacity:0},{opacity:1,offset:.15},{opacity:0,offset:.45},{opacity:0}],0,2200),effect('equation',flash,1100,1600),effect('answer',flash,1900,1000)]);
  const appBaseTurn=Array.from({length:8},(_,i)=>effect('base'+i,[{transform:'perspective(140px) rotateY(0deg)'},{transform:'perspective(140px) rotateY(28deg)',offset:.5},{transform:'perspective(140px) rotateY(0deg)'}],0,3000));
  revise(23,[0,1,2,3,4,5,6,7].map(i=>part('pair'+i,stroke('M49 '+(24+i*11)+'H77'))).join(''),appBaseTurn.concat(Array.from({length:8},(_,i)=>effect('pair'+i,flash,i*190,1100))),dnaCrops);
  revise(24,part('bond',stroke('M54 82H59M54 85H59')),[effect('left',move(5,-1),0,2600),effect('right',move(-5,1),0,2600),effect('bond',flash,1000,1400)],[{part:'left',shape:circle(47.2,84.4,3.6),underlay:'<circle cx="47.2" cy="84.4" r="3.6" fill="#0085dd"/>'},{part:'right',shape:circle(65.4,80.3,4.5),underlay:'<circle cx="65.4" cy="80.3" r="4.5" fill="#0085dd"/>'}]);
  const SubjectAnimationRegistry=Object.freeze(registry.slice(0,21));
  const AppAnimationRegistry=Object.freeze(Object.fromEntries(['circuits','maths','biology','chemistry'].map((k,i)=>[k,registry[21+i]])));
  let serial=0;
  function markup(entry,kind,artwork){
    const id='demo-'+serial++;
    const image=extra=>'<image href="'+artwork+'" x="6" y="6" width="116" height="116" '+extra+'/>';
    let definitions='',cutouts='',components='',underlays='';
    (entry.crops||[]).forEach((crop,i)=>{
      const clip=id+'-piece-'+i;
      definitions+='<clipPath id="'+clip+'">'+crop.shape+'</clipPath>';
      cutouts+='<g fill="black">'+crop.shape+'</g>';
      underlays+=crop.underlay||'';
      components+=part(crop.part,'<g clip-path="url(#'+clip+')">'+image('')+'</g>');
    });
    definitions+='<mask id="'+id+'-base" maskUnits="userSpaceOnUse" x="0" y="0" width="128" height="128"><rect width="128" height="128" fill="white"/>'+cutouts+'</mask>';
    definitions+='<radialGradient id="'+id+'-light" cx="30%" cy="25%"><stop stop-color="#fff"/><stop offset=".22" stop-color="#c1ffff"/><stop offset=".55" stop-color="#24d9ff"/><stop offset="1" stop-color="#086dc4"/></radialGradient><linearGradient id="'+id+'" x2="1" y2="1"><stop stop-color="#ecffff"/><stop offset=".4" stop-color="#47cfff"/><stop offset="1" stop-color="#2153ba"/></linearGradient>';
    return '<svg class="realistic-icon concept-icon '+kind+'" data-animation="'+entry.id+'" viewBox="0 0 128 128" aria-hidden="true" focusable="false" style="--demo-light:url(#'+id+'-light);--demo-metal:url(#'+id+')"><defs>'+definitions+'</defs>'+underlays+image('class="demo-original" mask="url(#'+id+'-base)"')+'<g class="demo-components">'+components+'</g><g class="demo-art">'+entry.body+'</g></svg>';
  }
  window.SubjectAnimationRegistry=SubjectAnimationRegistry;
  window.AppAnimationRegistry=AppAnimationRegistry;
  window.AnimatedSubjectIcon=s=>markup(SubjectAnimationRegistry[s.id],'subject-concept',s.icon||`assets/icons/${s.id}.png`);
  const appArtwork={circuits:'assets/icons/21.png',maths:'assets/icons/22.png',biology:'assets/icons/2.png',chemistry:'assets/icons/23.png'};
  window.AnimatedAppIcon=a=>markup(AppAnimationRegistry[a.id],'app-concept',a.icon||appArtwork[a.id]);
  window.subjectIcon=window.AnimatedSubjectIcon;
  if(typeof document==='undefined')return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const states=new Map();
  const lookup=new Map(registry.map(e=>[e.id,e]));
  function stop(state){clearTimeout(state.timer);state.animations.forEach(a=>a.cancel());state.animations=[];}
  function play(svg,delay=0,interaction=false){
    const s=states.get(svg);
    if(s&&interaction&&svg.getBoundingClientRect){
      const bounds=svg.getBoundingClientRect();
      s.visible=bounds.bottom>0&&bounds.right>0&&bounds.top<innerHeight&&bounds.left<innerWidth;
    }
    if(!s||!s.visible||reduced.matches||document.hidden||typeof svg.animate!=='function')return;
    stop(s);
    s.timer=setTimeout(()=>{
      s.timer=null;
      if(!s.visible||!svg.isConnected||reduced.matches||document.hidden)return;
      const entry=lookup.get(svg.dataset.animation);
      const duration=Math.max(...entry.effects.map(e=>e.duration+e.delay));
      // Only the transparent light overlay fades. The 3D artwork never fades.
      s.animations.push(svg.querySelector('.demo-art').animate([{opacity:0},{opacity:1,offset:.08},{opacity:1,offset:.9},{opacity:0}],{duration,easing:'ease-in-out'}));
      entry.effects.forEach(e=>svg.querySelectorAll('[data-part="'+e.part+'"]').forEach(node=>{
        s.animations.push(node.animate(e.frames,{duration:e.duration,delay:e.delay,easing:e.frames.length>32?'linear':'ease-in-out',iterations:1,fill:'backwards'}));
      }));
    },delay);
  }
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{let stagger=0;entries.forEach(e=>{const s=states.get(e.target);if(!s)return;s.visible=e.isIntersecting;if(e.isIntersecting)play(e.target,(stagger++%5)*100);else stop(s);});},{threshold:.15}):null;
  function scan(){for(const [svg,s] of states)if(!svg.isConnected){stop(s);observer?.unobserve(svg);states.delete(svg);}document.querySelectorAll('.concept-icon').forEach(svg=>{if(states.has(svg))return;const state={visible:!observer,animations:[],timer:null};states.set(svg,state);observer?.observe(svg);});}
  function within(target){return target?.closest?.('.card,.app-card,.featured,.tool-links a');}
  function trigger(event){const host=within(event.target);if(!host||host.contains(event.relatedTarget))return;host.querySelectorAll('.concept-icon').forEach(svg=>play(svg,0,true));}
  function leave(event){
    const host=within(event.target);
    if(!host||host.contains(event.relatedTarget))return;
    if(event.type==='pointerout'&&host.contains(document.activeElement))return;
    if(event.type==='pointerout'&&event.pointerType==='touch')return;
    host.querySelectorAll('.concept-icon').forEach(svg=>{
      const s=states.get(svg);if(!s)return;
      clearTimeout(s.timer);
      const current=s.animations.filter(a=>a.playState==='running'||a.playState==='paused');
      if(!current.length)return;
      const nodes=[...new Set(current.map(a=>a.effect?.target).filter(Boolean))];
      const values=nodes.map(node=>{const style=getComputedStyle(node);return {node,transform:style.transform,opacity:style.opacity,strokeDashoffset:style.strokeDashoffset};});
      stop(s);
      if(reduced.matches)return;
      s.animations=values.map(({node,...from})=>{
        const idle=getComputedStyle(node);
        return node.animate([from,{transform:idle.transform,opacity:idle.opacity,strokeDashoffset:idle.strokeDashoffset}],{duration:180,easing:'ease-out'});
      });
    });
  }
  document.addEventListener('pointerover',trigger);document.addEventListener('focusin',trigger);document.addEventListener('pointerdown',trigger);document.addEventListener('pointerout',leave);document.addEventListener('focusout',leave);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)states.forEach(stop);});
  reduced.addEventListener('change',()=>states.forEach(stop));
  function init(){scan();new MutationObserver(scan).observe(document.querySelector('main'),{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
