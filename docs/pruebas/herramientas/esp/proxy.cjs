const https=require('node:https'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const dir=process.env.STCS_ESP_LAB_DIR;if(!dir)throw Error('Falta STCS_ESP_LAB_DIR');let mode='untrusted';
const log=(o)=>fs.appendFileSync(path.join(dir,'server.jsonl'),JSON.stringify({time:Date.now(),...o})+'\n');
const opts=(m)=>({key:fs.readFileSync(path.join(dir,m+'-key.pem')),cert:fs.readFileSync(path.join(dir,m+'-cert.pem'))});
const server=https.createServer(opts(mode),(req,res)=>{
 log({event:'http',mode,method:req.method,path:req.url.split('?')[0],hasDeviceKey:!!req.headers['x-stcs-device-key']});
 const up=http.request({host:'127.0.0.1',port:3100,path:req.url,method:req.method,headers:{...req.headers,host:'127.0.0.1:3100'}},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res)});
 up.on('error',()=>{res.writeHead(502);res.end()});req.pipe(up);
});
server.on('tlsClientError',err=>log({event:'tls_rejected',mode,code:err.code||'unknown'}));
server.listen(3444,'0.0.0.0',()=>{log({event:'listen',mode});console.log('Proxy TLS aislado en 3444; modo inicial no confiable.');});
setInterval(()=>{let requested;try{requested=fs.readFileSync(path.join(dir,'tls-mode.txt'),'utf8').trim()}catch{return}if(['trusted','untrusted'].includes(requested)&&requested!==mode){mode=requested;server.setSecureContext(opts(mode));log({event:'mode',mode});console.log('TLS mode '+mode)}},200);
