const events=require('../../data/events-api.json');
exports.handler=async(event)=>{const org=(event.queryStringParameters||{}).org;const data=org?events.filter(x=>x.org===org):events;return{statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'public,max-age=60'},body:JSON.stringify({data,count:data.length,source:'FightEye local API'})};};
