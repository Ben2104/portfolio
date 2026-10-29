const {chromium}=require('/tmp/portfolio-shelf-qa/node_modules/playwright');
const fs=require('fs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function run(tier,dpr){
 const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:dpr,reducedMotion:'no-preference'});
 await context.addInitScript(()=>{
  const s=window.__perf={phase:'startup',handlers:[],events:[],canvases:[],gl:{},frames:[],long:[],clicks:[],resizes:[],renderer:null};
  try{new PerformanceObserver(list=>list.getEntries().forEach(e=>s.long.push({phase:s.phase,start:e.startTime,duration:e.duration}))).observe({type:'longtask',buffered:true})}catch{}
  const add=EventTarget.prototype.addEventListener; EventTarget.prototype.addEventListener=function(type,listener,options){if(type==='click' && this.dataset?.shelf && typeof listener==='function'){const original=listener;listener=function(e){const t=performance.now();try{return original.call(this,e)}finally{s.handlers.push({phase:s.phase,target:this.dataset.shelf,ms:performance.now()-t})}}}return add.call(this,type,listener,options)};
  const ce=document.createElement.bind(document);document.createElement=function(tag,...args){const el=ce(tag,...args);if(String(tag).toLowerCase()==='canvas')s.canvases.push({phase:s.phase,el});return el};
  const originalGet=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){const gl=originalGet.call(this,type,...args);if(gl&&(type==='webgl'||type==='webgl2')){const ext=gl.getExtension('WEBGL_debug_renderer_info');s.renderer=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)}return gl};
  for(const prop of ['width','height']){const d=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,prop);Object.defineProperty(HTMLCanvasElement.prototype,prop,{...d,set(v){if(this.dataset?.shelf==='scene')s.resizes.push({phase:s.phase,prop,value:v,time:performance.now()});d.set.call(this,v)}})}
  for(const T of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){if(!T)continue;for(const name of ['createTexture','deleteTexture','texImage2D','texSubImage2D','generateMipmap','createShader','compileShader','linkProgram','drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){if(!Object.hasOwn(T.prototype,name))continue;const orig=T.prototype[name];T.prototype[name]=function(...args){const t=performance.now();try{return orig.apply(this,args)}finally{const elapsed=performance.now()-t;const key=s.phase+':'+name;const a=s.gl[key] ||= {count:0,ms:0,max:0,sizes:[]};a.count++;a.ms+=elapsed;a.max=Math.max(a.max,elapsed);if(name==='texImage2D'){const src=args.at(-1);if(src&&typeof src==='object'&&src.width)a.sizes.push([src.width,src.height])}}}}}
  const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=function(cb){return raf(time=>{const phase=s.phase;const before=performance.now();const drawBefore=Object.entries(s.gl).filter(([k])=>k.startsWith(phase+':draw')).reduce((n,[,v])=>n+v.count,0);try{cb(time)}finally{const drawAfter=Object.entries(s.gl).filter(([k])=>k.startsWith(phase+':draw')).reduce((n,[,v])=>n+v.count,0);if(drawAfter>drawBefore)s.frames.push({phase,time,ms:performance.now()-before,draws:drawAfter-drawBefore})}})};
  document.addEventListener('click',e=>{const button=e.target.closest?.('[data-shelf]');if(!button)return;const start=performance.now(),phase=s.phase;raf(()=>s.clicks.push({phase,target:button.dataset.shelf,toRafMs:performance.now()-start}));},true);
 });
 const page=await context.newPage();page.setDefaultTimeout(180000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const phase=async name=>page.evaluate(name=>{window.__perf.phase=name},name);
 const click=async name=>page.locator(`[data-shelf="${name}"]`).click({timeout:180000});
 const settled=async()=>{await sleep(5000)};
 try{
  await page.goto(`http://127.0.0.1:3107/?shelf-quality=${tier}`,{waitUntil:'domcontentloaded'});
  await page.locator('.pshelf').scrollIntoViewIfNeeded();await page.waitForSelector('.pshelf.webgl-ready',{timeout:180000});await settled();
  await phase('scroll');await page.mouse.wheel(0,500);await sleep(5000);
  await phase('inspect1');await click('inspect');await sleep(5000);
  const data=await page.evaluate(()=>{const s=window.__perf;return {...s,canvases:s.canvases.map(({phase,el})=>({phase,width:el.width,height:el.height})),dpr:devicePixelRatio,scene:(()=>{let c=document.querySelector('[data-shelf=scene]');return {width:c.width,height:c.height,cssWidth:c.clientWidth,cssHeight:c.clientHeight}})()}});
  return {tier,dpr,errors,...data};
 }finally{await context.close();await browser.close()}
}
(async()=>{const out=[];for(const [tier,dpr] of [['high',1],['high',2]]){console.log('START',tier,dpr);try{out.push(await run(tier,dpr));console.log('DONE',tier,dpr)}catch(e){console.error('FAILED',tier,dpr,e.message);out.push({tier,dpr,error:e.message})}fs.writeFileSync('/tmp/portfolio-shelf-qa/perf-high-results.json',JSON.stringify(out,null,2))}})();
