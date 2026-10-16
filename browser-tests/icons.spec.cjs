const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises');
const path=require('node:path');
const names=['Maths','Physics','Biology','Chemistry','Deep Learning','Machine Learning Algorithms','Computer Organization','AI Algorithms','DAA','Data Structures','Computer Vision','VLSI','Digital Logic','Electronics Labs','IQ Labs','NLP','Cryptography','Probability & Statistics','Business Intelligence','Database Management','Operating Systems','Circuits Simulator','Maths App','Biology App','Chemistry App'];
const artifacts=path.resolve('browser-tests/results');
async function ready(page){
 await page.goto('/');
 await expect(page.locator('#subjects-grid .concept-icon')).toHaveCount(21);
 await expect(page.locator('#apps-grid .concept-icon')).toHaveCount(4);
 await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.concept-icon image')].map(el=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=()=>reject(new Error(el.getAttribute('href')));i.src=el.getAttribute('href');})));});
}
async function reveal(card){await card.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));}
function targets(page){return [...Array.from({length:21},(_,i)=>page.locator('#subjects-grid .card').nth(i)),...Array.from({length:4},(_,i)=>page.locator('#apps-grid .app-card').nth(i))];}
async function freeze(icon,time){await icon.evaluate((svg,t)=>{svg.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=t;});},time);}
async function state(icon){return icon.evaluate(svg=>({originalOpacity:getComputedStyle(svg.querySelector('.demo-original')).opacity,transform:getComputedStyle(svg).transform,animations:svg.getAnimations({subtree:true}).map(a=>({state:a.playState,iterations:a.effect.getTiming().iterations,target:a.effect.target.getAttribute('data-part')||a.effect.target.getAttribute('class')})),bounds:svg.getBoundingClientRect().toJSON()}));}
async function contactSheet(page,project,phase,tiles){
 const html=`<!doctype html><meta charset="utf-8"><style>body{font:13px system-ui;margin:16px;color:#102a50}h1{font-size:20px}.sheet{display:grid;grid-template-columns:repeat(5,180px);gap:10px}.tile{padding:10px;text-align:center;background:#f4faff;border:1px solid #bdd9ed;border-radius:12px}.tile img{display:block;margin:auto;width:108px;height:108px;object-fit:scale-down}.tile b{display:block;margin-top:8px;font-size:12px;min-height:30px}</style><h1>${project}: all 25 icons · ${phase}</h1><div class="sheet">${tiles.map((t,i)=>`<div class="tile"><img src="data:image/png;base64,${t.toString('base64')}"><b>${names[i]}</b></div>`).join('')}</div>`;
 const sheet=await page.context().newPage();await sheet.setViewportSize({width:1040,height:1000});await sheet.setContent(html,{waitUntil:'domcontentloaded'});await sheet.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));await sheet.screenshot({path:path.join(artifacts,`${project}-${phase}.png`),fullPage:true});await sheet.close();
}
test('all 25 icons preserve 3D artwork, animate internally, and keep layout stable',async({page},info)=>{
 await fs.mkdir(artifacts,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 const tiles={idle:[],early:[],middle:[],late:[]},matrix=[];
 const cards=targets(page);
 for(let i=0;i<cards.length;i++){
  if(i%5===0)console.log(info.project.name+': visual checks '+(i+1)+'–'+Math.min(i+5,25));
  const card=cards[i],icon=card.locator('.concept-icon');await reveal(card);
  await page.mouse.move(0,0);await page.waitForTimeout(350);
  await icon.evaluate(svg=>svg.getAnimations({subtree:true}).forEach(a=>a.cancel()));
  const before=await card.boundingBox();
  const unobscured=await icon.evaluate(svg=>{const r=svg.getBoundingClientRect(),host=svg.closest('.card,.app-card');return [[.15,.15],[.85,.15],[.15,.85],[.85,.85]].every(([x,y])=>host.contains(document.elementFromPoint(r.x+r.width*x,r.y+r.height*y)));});
  expect(unobscured,names[i]+' must not be covered by fixed navigation').toBe(true);
  tiles.idle.push(await icon.screenshot());
  if(info.project.name==='mobile'){await card.dispatchEvent('pointerdown',{pointerType:'touch',bubbles:true});}
  else await card.hover();
  await expect.poll(async()=> (await state(icon)).animations.length).toBeGreaterThan(0);
  const active=await state(icon);
  if(i<21){const tile=await card.locator('.icon-tile').boundingBox();expect(active.bounds.width).toBeLessThanOrEqual(tile.width+.1);expect(active.bounds.height).toBeLessThanOrEqual(tile.height+.1);expect(Math.abs(active.bounds.width-active.bounds.height)).toBeLessThan(.1);}
  expect(active.originalOpacity,names[i]).toBe('1');expect(active.transform).toBe('none');
  expect(active.animations.every(a=>a.iterations===1)).toBe(true);
  expect(active.animations.some(a=>a.target==='demo-original')).toBe(false);
  for(const [phase,time] of [['early',600],['middle',1600],['late',2400]]){await freeze(icon,time);tiles[phase].push(await icon.screenshot());expect((await state(icon)).originalOpacity).toBe('1');}
  const after=await card.boundingBox();expect(after.width).toBe(before.width);expect(after.height).toBe(before.height);
  matrix.push({name:names[i],id:await icon.getAttribute('data-animation'),width:before.width,height:before.height,artworkOpacity:active.originalOpacity,internalAnimations:active.animations.length});
 }
 expect(errors).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 for(const [phase,images] of Object.entries(tiles))await contactSheet(page,info.project.name,phase,images);
 await fs.writeFile(path.join(artifacts,`${info.project.name}-matrix.json`),JSON.stringify(matrix,null,2));
});
test('focus, pointer exit, finite completion, scrolling, filters and link destinations',async({page},info)=>{
 await ready(page);const cards=targets(page);
 for(let i=0;i<cards.length;i++){
  const card=cards[i],icon=card.locator('.concept-icon'),link=card.locator(i<21?'a.card-launch':'a.primary');
  await reveal(card);await page.mouse.move(0,0);await page.waitForTimeout(200);
  await page.locator('#search').focus();await link.focus();
  await expect.poll(()=>icon.evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBeGreaterThan(0);
  await page.locator('#search').focus();
  await expect.poll(()=>icon.evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);
  expect(await link.getAttribute('href')).toMatch(i<21?/^https:\/\/[^/]+\.aimersociety\.com\//:/^https:\/\/play\.google\.com\/store\/apps\/details\?id=/);
 }
 const first=cards[0],icon=first.locator('.concept-icon');await reveal(first);await first.hover();await page.waitForTimeout(100);await page.mouse.move(0,0);
 await expect.poll(()=>icon.evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);
 await first.hover();await page.waitForTimeout(3800);expect(await icon.evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);
 await first.hover();await page.locator('#apps').scrollIntoViewIfNeeded();await expect.poll(()=>icon.evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);
 await page.getByRole('button',{name:'Science & Maths',exact:true}).click();await expect(page.locator('#subjects-grid .card')).toHaveCount(5);
 await page.getByRole('button',{name:'All subjects',exact:true}).click();await expect(page.locator('#subjects-grid .card')).toHaveCount(21);
 await page.locator('#search').fill('Cryptography');await expect(page.locator('#subjects-grid .card')).toHaveCount(1);await page.locator('#search').fill('');await expect(page.locator('#subjects-grid .card')).toHaveCount(21);
 await page.screenshot({path:path.join(artifacts,`${info.project.name}-page.png`),fullPage:true});
});
test('all icons stay static with reduced motion, including dynamic preference changes',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await ready(page);
 for(const card of targets(page)){await reveal(card);await card.hover();await card.locator('a').first().focus();await card.dispatchEvent('pointerdown',{pointerType:'touch',bubbles:true});const s=await state(card.locator('.concept-icon'));expect(s.animations).toHaveLength(0);expect(s.originalOpacity).toBe('1');}
 await page.emulateMedia({reducedMotion:'no-preference'});const card=targets(page)[0],icon=card.locator('.concept-icon');await reveal(card);await card.hover();await expect.poll(()=>icon.evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBeGreaterThan(0);
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>icon.evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);
});

test('native touch keeps finite playback after finger release',async({page},info)=>{
 test.skip(info.project.name!=='mobile','Requires a touch-enabled browser context');
 // An isolated card harness exercises real touch delivery without following the
 // production card links into a different tab and hiding the tested document.
 const vm=require('node:vm'),fsSync=require('node:fs'),window={};
 vm.runInNewContext(fsSync.readFileSync('dist/icon-motion.js','utf8'),{window});
 const markup=[...Array.from({length:21},(_,id)=>window.AnimatedSubjectIcon({id})),...['circuits','maths','biology','chemistry'].map((id,i)=>window.AnimatedAppIcon({id,icon:`assets/icons/${[21,22,2,23][i]}.png`}))];
 await page.goto('/');await page.setContent('<meta name="viewport" content="width=device-width,initial-scale=1"><style>.card{height:140px;margin:10px;display:flex;align-items:center;justify-content:center}.concept-icon{width:108px;height:108px}</style><main>'+markup.map(m=>'<article class="card">'+m+'</article>').join('')+'</main>');
 await page.addStyleTag({path:'dist/realistic-icons.css'});await page.addScriptTag({path:'dist/icon-motion.js'});
 for(const card of await page.locator('.card').all()){
  await reveal(card);const icon=card.locator('.concept-icon');await page.waitForTimeout(100);
  await icon.evaluate(svg=>svg.getAnimations({subtree:true}).forEach(a=>a.cancel()));
  await card.tap();await expect.poll(()=>icon.evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBeGreaterThan(0);
  expect((await state(icon)).originalOpacity).toBe('1');
 }
});
test('learning tools and featured icons animate; idle page releases animation work',async({page},info)=>{
 await ready(page);const icons=page.locator('.featured .concept-icon,.tool-links .concept-icon');await expect(icons).toHaveCount(4);
 for(const icon of await icons.all()){
  const card=icon.locator('..');await reveal(card);await card.hover();await expect.poll(()=>icon.evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBeGreaterThan(0);expect((await state(icon)).originalOpacity).toBe('1');
 }
 await page.mouse.move(0,0);await page.locator('#search').focus();await page.waitForTimeout(4200);
 expect(await page.evaluate(()=>document.querySelectorAll('.concept-icon').length)).toBe(29);
 expect(await page.evaluate(()=>[...document.querySelectorAll('.concept-icon')].flatMap(s=>s.getAnimations({subtree:true})).length)).toBe(0);
 await fs.writeFile(path.join(artifacts,`${info.project.name}-idle.json`),JSON.stringify({activeIconAnimations:0,renderedIcons:29}));
});
test('small mobile and tablet breakpoints keep every subject SVG inside its tile',async({page},info)=>{
 test.skip(info.project.name==='mobile','Desktop project handles additional viewport widths');
 await ready(page);
 for(const width of [360,768,840]){
  await page.setViewportSize({width,height:1000});
  const fits=await page.locator('#subjects-grid .icon-tile').evaluateAll(tiles=>tiles.map(tile=>{const a=tile.getBoundingClientRect(),b=tile.querySelector('svg').getBoundingClientRect();return {width:a.width,height:a.height,svgWidth:b.width,svgHeight:b.height};}));
  expect(fits).toHaveLength(21);for(const f of fits){expect(f.svgWidth).toBeLessThanOrEqual(f.width+.1);expect(f.svgHeight).toBeLessThanOrEqual(f.height+.1);expect(Math.abs(f.svgWidth-f.svgHeight)).toBeLessThan(.1);}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
