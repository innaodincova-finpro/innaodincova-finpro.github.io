const {chromium}=require('../tochka-dnya/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const dir=__dirname,origin='https://innaodincova-finpro.github.io';
(async()=>{
 const manifest=JSON.parse(fs.readFileSync(dir+'/manifest.webmanifest','utf8'));
 assert.equal(manifest.name,'Реестр');assert.equal(manifest.id,'/reestr-tochki/');
 assert.equal(manifest.scope,'/reestr-tochki/');assert.equal(manifest.start_url,'/reestr-tochki/');
 assert(!manifest.start_url.startsWith('/tochka-dnya/'),'outside old installed Tochka scope');
 const browser=await chromium.launch({headless:true});
 for(const width of [320,390,430,1280]){
  const page=await browser.newPage({viewport:{width,height:844}});
  await page.route('**/*',route=>{
   const path=new URL(route.request().url()).pathname;
   if(path.endsWith('/registry.js'))return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(dir+'/../tochka-dnya/registry.js','utf8')});
   if(path.endsWith('/supabase.js'))return route.fulfill({contentType:'text/javascript',body:`window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:'test'}}}),onAuthStateChange:fn=>setTimeout(()=>fn('INITIAL_SESSION',{}),0)}})};window.fetch=async()=>({ok:true,json:async()=>({lyudi:Array.from({length:45},(_,i)=>({id:String(i),pochta:'person'+i+'@example.test',zahodil:i%2?'2026-09-08T10:00:00Z':null,mozhno_udalit:true}))})});`});
   if(path.endsWith('/install.js'))return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(dir+'/install.js','utf8')});
   if(path.endsWith('/manifest.webmanifest'))return route.fulfill({contentType:'application/manifest+json',body:JSON.stringify(manifest)});
   if(path.endsWith('.png'))return route.fulfill({contentType:'image/png',body:fs.readFileSync(dir+'/..'+path)});
   if(path.endsWith('/sw.js'))return route.fulfill({contentType:'text/javascript',body:''});
   return route.fulfill({contentType:'text/html',body:fs.readFileSync(dir+'/index.html','utf8').replaceAll('env(safe-area-inset-top,0px)','59px')});
  });
  await page.goto(origin+'/reestr-tochki/');
  await page.locator('.person').first().waitFor();assert.equal(await page.title(),'Реестр');
  assert.equal(await page.locator('.person').count(),20);
  assert.equal(await page.locator('.back').getAttribute('href'),'/tochka-dnya/index.html');
  const box=await page.locator('.back').boundingBox();assert(box.y>=59&&box.height>=48);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.getByRole('button',{name:'Установить Реестр',exact:true}).click();
  await page.locator('#install-help').waitFor({state:'visible'});
  await page.evaluate(()=>{const e=new Event('beforeinstallprompt');e.prompt=async()=>{window.promptCalled=true};e.userChoice=Promise.resolve({outcome:'accepted'});dispatchEvent(e)});
  await page.getByRole('button',{name:'Установить Реестр',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.promptCalled),true);
  await page.getByRole('button',{name:'+ Пригласить'}).click();
  await page.locator('#email').fill('test@example.test');
  await page.getByRole('button',{name:'Закрыть приглашение',exact:true}).click();
  await page.screenshot({path:'registry-install-'+width+'.png'});
  await page.close();
 }
 await browser.close();console.log('PASS: disjoint scope, registry identity, installation control, 45 users, 4 viewports, safe area, invitation dialog. Native OS installation not exercised.');
})().catch(e=>{console.error(e);process.exit(1)});
