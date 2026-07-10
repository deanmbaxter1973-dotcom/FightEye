const fs=require('fs');const path=require('path');const assert=require('assert');const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const app=fs.readFileSync(path.join(root,'app.js'),'utf8');const data=fs.readFileSync(path.join(root,'data/events-api.json'),'utf8');const events=JSON.parse(data);
assert(html.includes('app.js'),'index references app.js');assert(app.includes('analyticsView'),'analytics view present');assert(app.includes('productionView'),'production view present');
assert(events.length>=10,'event dataset present');assert.strictEqual(new Set(events.map(e=>e.id)).size,events.length,'event IDs unique');
for(const e of events)for(const k of ['id','name','org','start','end','closing'])assert(e[k],`missing ${k}`);
for(const f of ['styles.css','sw.js','manifest.json','netlify.toml','netlify/functions/analytics.js','netlify/functions/metrics.js'])assert(fs.existsSync(path.join(root,f)),`missing ${f}`);
console.log(`Smoke tests passed: ${events.length} events, unique IDs, analytics and production modules present.`);
