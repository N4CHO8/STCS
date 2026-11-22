const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const front=process.cwd().replaceAll('\\','/');assert(fs.existsSync(front+'/scripts/run-media-lab.mjs'));
const pg=require(front+'/node_modules/pg'),sharp=require(front+'/node_modules/sharp');
const dir=process.env.STCS_ESP_LAB_DIR,base='http://127.0.0.1:3100';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const stage=process.argv[2],n=Number(process.argv[3]);assert(['cold','warm'].includes(stage)&&[1,2,3].includes(n));
 assert(dir);const health=await (await fetch(base+'/api/health')).json();assert.equal(health.testDatabase,'127.0.0.1:55432/stcs_release_tests');
 const config=JSON.parse(fs.readFileSync(path.join(dir,'lab.json')));
 const {HARDWARE_DEMO_ACCOUNTS}=await import('file:///'+front+'/scripts/fixtures/hardware-demo-accounts.ts');
 const a=HARDWARE_DEMO_ACCOUNTS.find(a=>a.role==='therapist');
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json','Origin':base},body:JSON.stringify({email:a.email,password:a.password})});assert.equal(login.status,200);
 const cookie=login.headers.get('set-cookie').split(';')[0];
 async function api(url,body,method){const r=await fetch(base+url,{method:method||'GET',headers:{Cookie:cookie,Origin:base,...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body instanceof FormData?body:body?JSON.stringify(body):undefined});const data=await r.json();assert(r.ok,JSON.stringify({status:r.status,path:url,data}));return data;}
 const db=new pg.Client({connectionString:'postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/stcs_release_tests',ssl:false});await db.connect();
 const item=(await db.query('SELECT * FROM pictograms WHERE student_profile_id=$1 ORDER BY position LIMIT 1',[config.profileId])).rows[0];await db.end();assert(item);
 const assetsFile=path.join(dir,'measurement-assets.json');let assets=fs.existsSync(assetsFile)?JSON.parse(fs.readFileSync(assetsFile)):{};
 const phrase=['Necesito agua, prueba uno.','Necesito agua, prueba dos.','Necesito agua, prueba tres.'][n-1];
 if(stage==='cold'){
  assert(!assets[n],'No repetir una muestra fria ya preparada');
  const colors=['#2b70cf','#23945b','#ad5cbd'];const svg=`<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg"><rect width="192" height="192" fill="white"/><path d="M50 35 L142 35 L127 160 L65 160Z" fill="${colors[n-1]}"/><circle cx="96" cy="90" r="25" fill="white"/><text x="96" y="101" text-anchor="middle" font-size="35">${n}</text></svg>`;
  const bytes=await sharp(Buffer.from(svg)).png().toBuffer();const form=new FormData();form.set('image',new Blob([bytes],{type:'image/png'}),'medicion-'+n+'.png');
  const image=await api('/api/stcs/images?profileId='+config.profileId,form,'POST');assets[n]={imagePath:image.data.imagePath,phrase};fs.writeFileSync(assetsFile,JSON.stringify(assets,null,2));
 }assert(assets[n]);
 const label=(stage==='cold'?'Frio ':'Cache ')+n;
 const body={label,message:phrase,category:item.category,colorTone:item.color_tone,iconName:item.icon_name,imagePath:assets[n].imagePath,position:item.position};
 const started=Date.now();await api('/api/stcs/pictograms/'+item.id+'?profileId='+config.profileId,body,'PUT');const saved=Date.now();
 console.log('Guardado '+label+'; esperando confirmacion del tablero en el ESP.');
 let seen;
 for(let i=0;i<1800;i++){
  const rows=(fs.existsSync(path.join(dir,'serial.jsonl'))?fs.readFileSync(path.join(dir,'serial.jsonl'),'utf8'):'').trim().split('\n').filter(Boolean).map(x=>JSON.parse(x));
  seen=rows.find(r=>r.time>=started&&r.line.includes('STCS_PROBE|label='+label+'|audio=1|image=1'));
  if(seen)break;await sleep(100);
 }
 assert(seen,'Sin tablero completo dentro de 180 segundos');
 const result={stage,n,label,phrase,started,saved,uiReady:seen.time,saveMs:saved-started,totalMs:seen.time-started,afterSaveMs:seen.time-saved,transport:'localhost API real → proxy HTTPS LAN → ESP fisico',scope:'imagen y voz preparada en tablero; reproduccion humana se registra aparte'};
 fs.appendFileSync(path.join(dir,'measurements.jsonl'),JSON.stringify(result)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e.message);process.exitCode=1});
