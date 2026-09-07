"use client";

import {useEffect,useMemo,useRef,useState} from "react";

type Readiness="Ready"|"Action needed"|"Review";
type Athlete={id:string;name:string;age:string;weight:string;categories:string[];licence:boolean;consent:boolean;medical:boolean;weightCheck:boolean};
type EventPlan={id:string;name:string;date:string;place:string;clubDeadline:string;entryFee:number;travel:number};

const events:EventPlan[]=[
 {id:"wako-worlds",name:"WAKO Junior World Championships",date:"18–27 Sep 2026",place:"Italy",clubDeadline:"6 Sep 2026",entryFee:42,travel:540},
 {id:"peterborough",name:"Peterborough Series",date:"9 Nov 2026",place:"Peterborough, UK",clubDeadline:"26 Oct 2026",entryFee:30,travel:35},
 {id:"revolution",name:"Revolution Series",date:"Date pending",place:"United Kingdom",clubDeadline:"Not set",entryFee:30,travel:45},
];

const initialAthletes:Athlete[]=[
 {id:"charlie",name:"Charlie Baxter",age:"Older Cadet",weight:"−42 kg",categories:["PF","LC","KL"],licence:true,consent:true,medical:true,weightCheck:false},
 {id:"jamie",name:"Jamie Granville",age:"Junior",weight:"−60 kg",categories:["PF","LC"],licence:true,consent:true,medical:true,weightCheck:true},
 {id:"olivia",name:"Olivia Green",age:"Younger Cadet",weight:"−37 kg",categories:["PF"],licence:false,consent:true,medical:true,weightCheck:true},
 {id:"hollie",name:"Hollie Haworth",age:"Older Cadet",weight:"−50 kg",categories:["LC","KL"],licence:true,consent:false,medical:true,weightCheck:true},
];

const readiness=(athlete:Athlete):Readiness=>!athlete.licence||!athlete.consent?"Action needed":!athlete.medical||!athlete.weightCheck?"Review":"Ready";
const readAthletes=()=>{if(typeof window==="undefined")return initialAthletes;try{const saved=JSON.parse(localStorage.getItem("fighteye-entry-readiness-v1")||"null");return Array.isArray(saved)&&saved.every(item=>item&&typeof item.name==="string"&&Array.isArray(item.categories))?saved as Athlete[]:initialAthletes}catch{return initialAthletes}};

export default function EntryReadiness({notice}:{notice:(message:string)=>void}){
 const[eventId,setEventId]=useState(events[0].id);const[athletes,setAthletes]=useState<Athlete[]>(readAthletes);const[filter,setFilter]=useState<"All"|Readiness>("All");const saveTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(()=>{try{localStorage.setItem("fighteye-entry-readiness-v1",JSON.stringify(athletes))}catch{}},120);return()=>{if(saveTimer.current)clearTimeout(saveTimer.current)}},[athletes]);
 const selected=events.find(event=>event.id===eventId)??events[0];const visible=useMemo(()=>athletes.filter(athlete=>filter==="All"||readiness(athlete)===filter),[athletes,filter]);
 const entries=athletes.reduce((total,athlete)=>total+athlete.categories.length,0);const ready=athletes.filter(athlete=>readiness(athlete)==="Ready").length;const entryCost=entries*selected.entryFee;const total=entryCost+selected.travel;
 const toggleCheck=(id:string,key:"licence"|"consent"|"medical"|"weightCheck")=>setAthletes(current=>current.map(athlete=>athlete.id===id?{...athlete,[key]:!athlete[key]}:athlete));
 const toggleCategory=(id:string,category:string)=>setAthletes(current=>current.map(athlete=>athlete.id!==id?athlete:{...athlete,categories:athlete.categories.includes(category)?athlete.categories.filter(item=>item!==category):[...athlete.categories,category]}));
 const exportPlan=()=>{const rows=[["Athlete","Age band","Weight","Categories","Readiness"],...athletes.map(athlete=>[athlete.name,athlete.age,athlete.weight,athlete.categories.join(" / "),readiness(athlete)])];const csv=rows.map(row=>row.map(value=>'"'+value.replaceAll('"','""')+'"').join(",")).join("\n");const link=document.createElement("a");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));link.href=url;link.download=selected.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-team-entry.csv";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notice("Team entry CSV exported")};
 return <div className="entryPlanner">
  <section className="entryHero"><div><span className="badge gold">PHASE 46 · TEAM ENTRY</span><h2>Know who is ready before the deadline.</h2><p>Build the club entry, clear eligibility issues and keep competition costs visible in one phone-friendly plan.</p></div><label><span>Competition</span><select value={eventId} onChange={event=>setEventId(event.target.value)}>{events.map(event=><option value={event.id} key={event.id}>{event.name}</option>)}</select></label></section>
  <section className="entrySummary"><article><small>Team readiness</small><b>{ready}/{athletes.length}</b><span>{Math.round(ready/athletes.length*100)}% cleared</span></article><article><small>Category entries</small><b>{entries}</b><span>£{entryCost} entry fees</span></article><article><small>Club deadline</small><b className="deadlineValue">{selected.clubDeadline}</b><span>{selected.date} · {selected.place}</span></article><article><small>Estimated total</small><b>£{total}</b><span>Including £{selected.travel} travel</span></article></section>
  <section className="entryControls panel"><div><button className={filter==="All"?"active":""} onClick={()=>setFilter("All")}>All {athletes.length}</button><button className={filter==="Ready"?"active":""} onClick={()=>setFilter("Ready")}>Ready {ready}</button><button className={filter==="Action needed"?"active warningFilter":""} onClick={()=>setFilter("Action needed")}>Action needed {athletes.filter(a=>readiness(a)==="Action needed").length}</button><button className={filter==="Review"?"active":""} onClick={()=>setFilter("Review")}>Review {athletes.filter(a=>readiness(a)==="Review").length}</button></div><button className="entryExport" onClick={exportPlan}>⇩ Export entry</button></section>
  <section className="entryList" aria-live="polite">{visible.map(athlete=>{const state=readiness(athlete);return <article className="entryAthlete panel" key={athlete.id}><div className="entryAthleteHead"><span className="entryInitial">{athlete.name.split(" ").map(part=>part[0]).join("")}</span><div><small>{athlete.age} · {athlete.weight}</small><h3>{athlete.name}</h3></div><strong className={`readiness ${state.toLowerCase().replace(" ","-")}`}>{state}</strong></div><div className="categoryPicker"><small>CATEGORIES</small><div>{["PF","LC","KL"].map(category=><button key={category} className={athlete.categories.includes(category)?"selected":""} aria-pressed={athlete.categories.includes(category)} onClick={()=>toggleCategory(athlete.id,category)}>{category}</button>)}</div></div><div className="readinessChecks">{([['licence','Licence'],['consent','Consent'],['medical','Medical'],['weightCheck','Weight check']] as const).map(([key,label])=><button key={key} className={athlete[key]?"complete":"missing"} aria-pressed={athlete[key]} onClick={()=>toggleCheck(athlete.id,key)}><i>{athlete[key]?"✓":"!"}</i><span>{label}<small>{athlete[key]?"Complete":"Tap to clear"}</small></span></button>)}</div></article>})}</section>
  {!visible.length&&<section className="panel entryEmpty"><b>No athletes in this status.</b><button onClick={()=>setFilter("All")}>Show full team</button></section>}
 </div>
}
