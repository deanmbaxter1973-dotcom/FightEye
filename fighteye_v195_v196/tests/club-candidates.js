const assert = require('node:assert/strict');
const {candidates, handler, sourceUrl} = require('../netlify/functions/club-candidates');

const html = `<table><tr><th>Rank</th><th>Name</th><th>Club</th></tr>
<tr><td>1</td><td>BAXTER CHARLIE</td><td>PRESTIGE MARTIAL ART</td></tr>
<tr><td>2</td><td>BAXTER CHARLIE</td><td>PRESTIGE MARTIAL ART</td></tr>
<tr><td>3</td><td>OTHER FIGHTER</td><td>OTHER CLUB</td></tr></table>`;
assert.deepEqual(candidates(html, 'Prestige Martial Arts'), ['Charlie Baxter']);
assert.deepEqual(candidates(html, 'Other Club'), ['Fighter Other']);
assert.match(sourceUrl('2050', 'results'), /popup_action=results/);
(async () => {
  const invalid = await handler({httpMethod:'POST', body:JSON.stringify({eventIds:['https://example.com'],club:'Prestige Martial Arts'})});
  assert.equal(invalid.statusCode, 400);
  const original = global.fetch;
  global.fetch = async url => {
    if (url.includes('catauslist')) throw Error('Unavailable');
    return {ok:true,headers:{get:key => key==='content-type'?'text/html':null},text:async () => html};
  };
  try {
    const response = await handler({httpMethod:'POST', body:JSON.stringify({eventIds:['2050','2051'],club:'Prestige Martial Arts'})});
    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.checked, 2);
    assert.equal(body.total, 4);
    assert.deepEqual(body.candidates.map(x => x.name), ['Charlie Baxter']);
    assert.equal(body.candidates[0].sources.length, 2);
  } finally {global.fetch = original}
  console.log('Club candidate checks passed');
})().catch(error => {console.error(error); process.exitCode = 1});
