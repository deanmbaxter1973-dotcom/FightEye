const assert = require('node:assert/strict');
const {candidates, handler} = require('../netlify/functions/club-candidates');

const html = `<table><tr><th>Rank</th><th>Name</th><th>Club</th></tr>
<tr><td>1</td><td>BAXTER CHARLIE</td><td>PRESTIGE MARTIAL ART</td></tr>
<tr><td>2</td><td>BAXTER CHARLIE</td><td>PRESTIGE MARTIAL ART</td></tr>
<tr><td>3</td><td>OTHER FIGHTER</td><td>OTHER CLUB</td></tr></table>`;
assert.deepEqual(candidates(html, 'Prestige Martial Arts'), ['Charlie Baxter']);
assert.deepEqual(candidates(html, 'Other Club'), ['Fighter Other']);
handler({httpMethod:'POST', body:JSON.stringify({url:'https://example.com/private',club:'Prestige Martial Arts'})}).then(response => {
  assert.equal(response.statusCode, 400);
  console.log('Club candidate checks passed');
}).catch(error => {console.error(error); process.exitCode = 1});
