const events = require('../../data/events-api.json');
exports.handler = async () => ({statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({ok:true,release:'v195-v196',eventCount:events.length,functions:['health','events','sync','analytics','metrics'],uptimeSeconds:Math.round(process.uptime()),timestamp:new Date().toISOString()})});
