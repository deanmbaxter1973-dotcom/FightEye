import {EventRecord} from "./event-catalogue";

const continentByCountry:Record<string,string>={
 "Bosnia and Herzegovina":"Europe",Cambodia:"Asia",Croatia:"Europe","Czech Republic":"Europe",
 Denmark:"Europe",France:"Europe",Germany:"Europe",Hungary:"Europe",Ireland:"Europe",Italy:"Europe",
 Lithuania:"Europe","North Macedonia":"Europe",Norway:"Europe",Poland:"Europe",Slovenia:"Europe",
 Spain:"Europe",Sweden:"Europe","United Kingdom":"Europe","United States":"North America",Uzbekistan:"Asia"
};

export const eventContinent=(event:Pick<EventRecord,"country">)=>continentByCountry[event.country]??"Other";
export const eventContinents=(events:EventRecord[])=>Array.from(new Set(events.map(eventContinent))).sort();
export const eventCountries=(events:EventRecord[],continent:string)=>Array.from(new Set(events.filter(event=>continent==="All continents"||eventContinent(event)===continent).map(event=>event.country))).sort((a,b)=>a.localeCompare(b));
