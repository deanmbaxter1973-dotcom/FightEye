const fs=require('fs');const path=require('path');const assert=require('assert');const vm=require('vm');const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const app=fs.readFileSync(path.join(root,'app.js'),'utf8');const data=fs.readFileSync(path.join(root,'data/events-api.json'),'utf8');const events=JSON.parse(data);
assert(html.includes('app.js'),'index references app.js');assert(app.includes('analyticsView'),'analytics view present');assert(app.includes('productionView'),'production view present');
assert(events.length>=25,'expanded event dataset present');assert.strictEqual(new Set(events.map(e=>e.id)).size,events.length,'event IDs unique');
for(const e of events){for(const k of ['id','name','org','start','end'])assert(e[k],`missing ${k}`);assert(e.start<=e.end,`invalid dates: ${e.id}`);if(e.source)assert(e.sourceUrl?.startsWith('https://'),`missing listing: ${e.id}`);}
assert(events.filter(e=>e.country==='United Kingdom').length>=15,'UK competition coverage');
assert.strictEqual(events.find(e=>e.id==='peterborough-series-3-2026').closing,'2026-10-25','Peterborough published closing date');
assert.strictEqual(events.find(e=>e.id==='wku-english-open-2027').start,'2027-01-30','WKU 2027 date');
assert(app.includes('seriesFilter'),'organiser filter present');
assert.strictEqual(events.find(e=>e.id==='bristol-open-2026').start,'2026-10-23','Bristol Open uses published date');
const context={window:{FIGHTEYE_EVENTS:events,FIGHTEYE_ATHLETES:[],addEventListener:()=>{}},document:{getElementById:()=>({})},localStorage:{getItem:()=>null},navigator:{}};
vm.runInNewContext(app.replace('})();','globalThis.__events={statusFor,eventsView};})();'),context);
assert.strictEqual(context.__events.statusFor({start:'2099-01-01',end:'2099-01-02',closing:null}),'Date confirmed • entry TBC');
assert(context.__events.eventsView().includes('data-event-period="past"'),'past events tab present');
for(const f of ['styles.css','sw.js','manifest.json','netlify.toml','netlify/functions/analytics.js','netlify/functions/metrics.js'])assert(fs.existsSync(path.join(root,f)),`missing ${f}`);
console.log(`Smoke tests passed: ${events.length} events, unique IDs, analytics and production modules present.`);
