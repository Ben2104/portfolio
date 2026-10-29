const {chromium}=require(process.env.PLAYWRIGHT_PATH || '/tmp/portfolio-shelf-qa/node_modules/playwright');
const fs=require('fs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function run(tier,dpr){
 const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:process.env.QA_CASE==='mobile'?{width:390,height:844}:{width:1280,height:800},deviceScaleFactor:dpr,isMobile:process.env.QA_CASE==='mobile',hasTouch:process.env.QA_CASE==='mobile',reducedMotion:'no-preference'});
 await context.addInitScript(()=>{
  const s=window.__perf={phase:'startup',marks:[{phase:'startup',time:performance.now()}],handlers:[],tasks:[],events:[],canvases:[],gl:{},frames:[],long:[],clicks:[],resizes:[],renderer:null};
  try{new PerformanceObserver(list=>list.getEntries().forEach(e=>s.long.push({phase:s.phase,start:e.startTime,duration:e.duration}))).observe({type:'longtask',buffered:true})}catch{}
  const add=EventTarget.prototype.addEventListener, remove=EventTarget.prototype.removeEventListener;
  const listeners=new WeakMap();
  const capture=options=>typeof options==='boolean'?options:Boolean(options?.capture);
  EventTarget.prototype.addEventListener=function(type,listener,options){
   if(type==='click' && this.dataset?.shelf && typeof listener==='function'){
    let target=listeners.get(this);if(!target){target=new WeakMap();listeners.set(this,target)}
    let wrappers=target.get(listener);if(!wrappers){wrappers=new Map();target.set(listener,wrappers)}
    const key=`${type}:${capture(options)}`;
    if(!wrappers.has(key)){const fn=listener;wrappers.set(key,function(e){const start=performance.now();try{return fn.call(this,e)}finally{s.handlers.push({phase:s.phase,target:this.dataset.shelf,start,duration:performance.now()-start})}})}
    listener=wrappers.get(key);
   }
   return add.call(this,type,listener,options);
  };
  EventTarget.prototype.removeEventListener=function(type,listener,options){
   const wrapper=listener && listeners.get(this)?.get(listener)?.get(`${type}:${capture(options)}`);
   return remove.call(this,type,wrapper || listener,options);
  };
  const timeout=window.setTimeout.bind(window);
  window.setTimeout=function(fn,delay,...args){if(typeof fn!=='function')return timeout(fn,delay,...args);return timeout(function(...values){const start=performance.now(), phase=s.phase, before=s.canvases.length;try{return fn(...values)}finally{const created=s.canvases.length-before;if(created)s.tasks.push({phase,start,duration:performance.now()-start,canvases:created})}},delay,...args)};
  const ce=document.createElement.bind(document);document.createElement=function(tag,...args){const el=ce(tag,...args);if(String(tag).toLowerCase()==='canvas')s.canvases.push({phase:s.phase,el});return el};
  const originalGet=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){const gl=originalGet.call(this,type,...args);if(gl&&(type==='webgl'||type==='webgl2')){const ext=gl.getExtension('WEBGL_debug_renderer_info');s.renderer=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)}return gl};
  for(const prop of ['width','height']){const d=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,prop);Object.defineProperty(HTMLCanvasElement.prototype,prop,{...d,set(v){if(this.dataset?.shelf==='scene')s.resizes.push({phase:s.phase,prop,value:v,time:performance.now()});d.set.call(this,v)}})}
  for(const T of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){if(!T)continue;for(const name of ['createTexture','deleteTexture','texImage2D','texSubImage2D','generateMipmap','createShader','compileShader','linkProgram','drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){if(!Object.hasOwn(T.prototype,name))continue;const orig=T.prototype[name];T.prototype[name]=function(...args){const t=performance.now();try{return orig.apply(this,args)}finally{const elapsed=performance.now()-t;const key=s.phase+':'+name;const a=s.gl[key] ||= {count:0,ms:0,max:0,sizes:[]};a.count++;a.ms+=elapsed;a.max=Math.max(a.max,elapsed);if(name==='texImage2D'){const src=args.at(-1);if(src&&typeof src==='object'&&src.width)a.sizes.push([src.width,src.height])}}}}}
  const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=function(cb){return raf(time=>{const phase=s.phase;const before=performance.now();const canvasBefore=s.canvases.length;const uploadBefore=(s.gl[phase+':texSubImage2D']?.count||0)+(s.gl[phase+':texImage2D']?.count||0);const drawBefore=Object.entries(s.gl).filter(([k])=>k.startsWith(phase+':draw')).reduce((n,[,v])=>n+v.count,0);try{cb(time)}finally{const drawAfter=Object.entries(s.gl).filter(([k])=>k.startsWith(phase+':draw')).reduce((n,[,v])=>n+v.count,0);const uploads=(s.gl[phase+':texSubImage2D']?.count||0)+(s.gl[phase+':texImage2D']?.count||0)-uploadBefore;const canvases=s.canvases.length-canvasBefore;if(canvases||uploads)s.tasks.push({phase,start:before,duration:performance.now()-before,canvases,uploads,scheduler:'raf'});if(drawAfter>drawBefore)s.frames.push({phase,time,ms:performance.now()-before,draws:drawAfter-drawBefore})}})};
  document.addEventListener('click',e=>{const button=e.target.closest?.('[data-shelf]');if(!button)return;const start=performance.now(),phase=s.phase;raf(()=>s.clicks.push({phase,target:button.dataset.shelf,toRafMs:performance.now()-start}));},true);
 });
 const page=await context.newPage();page.setDefaultTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const phase=async name=>{console.log('PHASE',tier,dpr,name);const partial=await page.evaluate(()=>{const s=window.__perf;return {...s,canvases:s.canvases.map(({phase,el})=>({phase,width:el.width,height:el.height}))}});fs.writeFileSync(`/tmp/portfolio-shelf-qa/smoothness-${tier}-${dpr}-partial.json`,JSON.stringify(partial,null,2));await page.evaluate(name=>{window.__perf.phase=name;window.__perf.marks.push({phase:name,time:performance.now()})},name)};
 const click=async name=>page.locator(`[data-shelf="${name}"]`).click({timeout:90000});
 const settled=async()=>{await sleep(3000)};
 try{
  await page.goto(`http://127.0.0.1:3107/?shelf-quality=${tier}`,{waitUntil:'domcontentloaded'});
  await page.locator('.pshelf').scrollIntoViewIfNeeded();await page.waitForSelector('.pshelf.webgl-ready',{timeout:90000});await settled();
  await phase('scroll');await page.mouse.wheel(0,500);await sleep(3000);
  await phase('inspect1');await page.evaluate(()=>{document.querySelectorAll('[data-shelf=markers] button')[1].click();document.querySelector('[data-shelf=inspect]').click()});await page.waitForSelector('.pshelf.mode-detail:not(.is-opening)',{timeout:90000});await settled();
  await phase('close1');await click('close-detail');await page.waitForFunction(()=>!document.querySelector('[data-shelf=browse-ui]').inert && document.querySelector('[data-shelf=live-region]').textContent.includes('returned to the shelf'),null,{timeout:90000});await settled();
  await phase('reinspect');await click('inspect');await page.waitForSelector('.pshelf.mode-detail:not(.is-opening)',{timeout:90000});await settled();
  await phase('close2');await click('close-detail');await page.waitForFunction(()=>!document.querySelector('[data-shelf=browse-ui]').inert && document.querySelector('[data-shelf=live-region]').textContent.includes('returned to the shelf'),null,{timeout:90000});await settled();
  await phase('select2');await page.locator('[data-shelf=markers] button').nth(2).evaluate(e=>e.click());await sleep(10000);
  await phase('inspect2');await click('inspect');await page.waitForSelector('.pshelf.mode-detail:not(.is-opening)',{timeout:90000});await settled();
  const data=await page.evaluate(()=>{const s=window.__perf;return {...s,canvases:s.canvases.map(({phase,el})=>({phase,width:el.width,height:el.height})),dpr:devicePixelRatio,scene:(()=>{let c=document.querySelector('[data-shelf=scene]');return {width:c.width,height:c.height,cssWidth:c.clientWidth,cssHeight:c.clientHeight}})()}});
  const warmCanvases=data.canvases.filter(c=>c.phase==='reinspect');
  const warmUploads=(data.gl['reinspect:texSubImage2D']?.count || 0)+(data.gl['reinspect:texImage2D']?.count || 0);
  console.log('warm detail candidates',warmCanvases,'uploads',warmUploads,'handler',data.handlers.filter(x=>x.phase==='reinspect'));
  return {tier,dpr,errors,...data,warmCanvases,warmUploads,warmPass:warmCanvases.length===0 && warmUploads===0};
 }catch(error){const partial=await page.evaluate(()=>{const s=window.__perf;return {...s,canvases:s.canvases.map(({phase,el})=>({phase,width:el.width,height:el.height}))}}).catch(()=>null);fs.writeFileSync(`/tmp/portfolio-shelf-qa/smoothness-${tier}-${dpr}-partial.json`,JSON.stringify({error:error.message,partial},null,2));throw error}finally{await context.close();await browser.close()}
}
(async()=>{const out=[];const cases=process.env.QA_CASE==='mobile'? [['low',2]] : process.env.QA_CASE==='low'? [['low',1]] : process.env.QA_CASE==='high2'? [['high',2]] : [['high',1]];for(const [tier,dpr] of cases){console.log('START',tier,dpr);try{out.push(await run(tier,dpr));console.log('DONE',tier,dpr)}catch(e){console.error('FAILED',tier,dpr,e.message);out.push({tier,dpr,error:e.message})}fs.writeFileSync(`/tmp/portfolio-shelf-qa/smoothness-${tier}-${dpr}.json`,JSON.stringify(out,null,2));if(out.at(-1).error || out.at(-1).warmPass===false)process.exitCode=1}})();
