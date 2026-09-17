import type {EventRecord} from "./event-catalogue";
import {readClubAthletes} from "./club-data";

export type EventTeamLink={athleteIds:string[];athleteNames:string[];updatedAt:string};
export type EventTeamLinks=Record<string,EventTeamLink>;
export type ActiveLiveEvent=Pick<EventRecord,"id"|"name"|"start"|"end"|"venue"|"city"|"country"|"flag">;

export const eventTeamLinksKey="fighteye-event-team-links-v1";
export const activeLiveEventKey="fighteye-active-live-event-v1";

export const readEventTeamLinks=():EventTeamLinks=>{
 if(typeof window==="undefined")return{};
 try{
  const value=JSON.parse(localStorage.getItem(eventTeamLinksKey)||"{}");const links=value&&typeof value==="object"?value as EventTeamLinks:{};
  const plans=JSON.parse(localStorage.getItem("fighteye-event-plans-v2")||"{}");const roster=readClubAthletes();
  Object.entries(plans&&typeof plans==="object"?plans:{}).forEach(([eventId,plan])=>{const names=Array.isArray((plan as {athletes?:unknown}).athletes)?(plan as {athletes:string[]}).athletes:[];if(!links[eventId]&&names.length){const athleteIds=names.map(name=>roster.find(athlete=>athlete.name===name)?.id).filter(Boolean) as string[];links[eventId]={athleteIds,athleteNames:names,updatedAt:new Date().toISOString()}}});
  return links;
 }catch{return{}}
};

export const readActiveLiveEvent=():ActiveLiveEvent|null=>{
 if(typeof window==="undefined")return null;
 try{const value=JSON.parse(localStorage.getItem(activeLiveEventKey)||"null");return value&&typeof value.id==="string"?value as ActiveLiveEvent:null}catch{return null}
};

export const saveActiveLiveEvent=(event:EventRecord)=>{
 const linked:ActiveLiveEvent={id:event.id,name:event.name,start:event.start,end:event.end,venue:event.venue,city:event.city,country:event.country,flag:event.flag};
 try{localStorage.setItem(activeLiveEventKey,JSON.stringify(linked))}catch{}
 return linked;
};
