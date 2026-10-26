import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.join(process.cwd(),'dist');
const server=http.createServer((req,res)=>{let file;try{file=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Invalid path');}const target=path.resolve(root,'.'+file);if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403);return res.end('Forbidden');}let resolved=target===root?path.join(root,'index.html'):target;if(!fs.existsSync(resolved)){res.writeHead(404);return res.end('Not found');}if(fs.statSync(resolved).isDirectory())resolved=path.join(resolved,'index.html');const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};res.writeHead(200,{'Content-Type':types[path.extname(resolved)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(resolved).pipe(res);});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
