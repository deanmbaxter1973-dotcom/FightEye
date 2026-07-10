const events = require('../../data/events-api.json');
const numberFrom = value => Number(String(value || '').replace(/[^0-9.]/g, '')) || 0;
exports.handler = async event => {
  const q = event.queryStringParameters || {};
  const goal = q.goal || 'Ranking';
  const saved = new Set(String(q.saved || '').split(',').filter(Boolean));
  const recommendations = events.map(item => {
    const distance = numberFrom(item.distance) || 500;
    const difficulty = Number(item.difficulty) || 3;
    let score = 100 - difficulty * 7 - Math.min(28, distance / 45);
    if (saved.has(item.id)) score += 14;
    if (goal === 'Ranking' && /WAKO/i.test(item.org)) score += 8;
    if (goal === 'Travel efficiency' && distance < 200) score += 12;
    if (goal === 'Experience' && difficulty <= 3) score += 10;
    return { id:item.id, name:item.name, org:item.org, score:Math.max(20, Math.min(99, Math.round(score))) };
  }).sort((a,b)=>b.score-a.score).slice(0,5);
  return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'public,max-age=120'},body:JSON.stringify({goal,recommendations,generatedAt:new Date().toISOString(),explainability:'Scores use event difficulty, travel distance, organisation and saved status.'})};
};
