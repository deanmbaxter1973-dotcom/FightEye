"use client";

import {useEffect,useMemo,useRef,useState} from "react";

export type ToolItem={id:string;label:string;icon:string;hub:string;description:string};
export type HubItem={id:string;label:string;icon:string;description:string};
type TodayWindow="Now"|"Today"|"This week";

const hubNames:Record<string,string>={athletes:"Athletes",coaching:"Coaching",events:"Events",live:"Live",club:"Club",manage:"Manage"};

export function ToolHub({hub,tools,favourites,onOpen,onToggleFavourite}:{hub:string;tools:ToolItem[];favourites:string[];onOpen:(id:string)=>void;onToggleFavourite:(id:string)=>void}){
 const visible=tools.filter(tool=>tool.hub===hub);
 return <div className="experienceHub"><section className="hubIntro"><div><span className="badge gold">PHASE 85 · SIMPLER NAVIGATION</span><h2>{hubNames[hub]||"FightEye"}</h2><p>{hub==="live"?"Everything needed when bouts are moving.":hub==="events"?"Find, prepare, run and review every competition.":hub==="coaching"?"Plan sessions, analyse performance and turn insight into action.":hub==="athletes"?"Profiles, progress, training and selection in one place.":hub==="club"?"Attendance, grading, finance and equipment without the clutter.":"Welfare, permissions, data quality and platform control."}</p></div><strong>{visible.length}<small>tools</small></strong></section><section className="hubToolGrid">{visible.map(tool=><article className="hubTool" key={tool.id}><button className="hubToolOpen" onClick={()=>onOpen(tool.id)}><i>{tool.icon}</i><span><b>{tool.label}</b><small>{tool.description}</small></span><em>→</em></button><button className={favourites.includes(tool.id)?"hubFavourite active":"hubFavourite"} aria-label={(favourites.includes(tool.id)?"Remove ":"Add ")+tool.label+" favourite"} onClick={()=>onToggleFavourite(tool.id)}>★</button></article>)}</section></div>
}

export function SmartHome({tools,hubs,favourites,recents,onOpen,onOpenHub,onSearch,onToggleFavourite}:{tools:ToolItem[];hubs:HubItem[];favourites:string[];recents:string[];onOpen:(id:string)=>void;onOpenHub:(id:string)=>void;onSearch:()=>void;onToggleFavourite:(id:string)=>void}){
 const shortcuts=[...favourites,...recents].filter((id,index,list)=>list.indexOf(id)===index).map(id=>tools.find(tool=>tool.id===id)).filter(Boolean).slice(0,4) as ToolItem[];
 return <div className="smartHome"><section className="homeCommand"><div><span className="badge green">READY</span><h2>Your next action,<br/><em>without the searching.</em></h2><p>Open a hub or find any FightEye tool by name.</p></div><button onClick={onSearch}><i>⌕</i><span><b>Find anything</b><small>Athletes, events, coaching and club tools</small></span><kbd>⌘ K</kbd></button></section><section className="homeHubs" aria-label="FightEye hubs">{hubs.filter(hub=>hub.id!=="overview").map(hub=><button key={hub.id} onClick={()=>onOpenHub(hub.id)}><i>{hub.icon}</i><span><b>{hub.label}</b><small>{hub.description}</small></span><em>→</em></button>)}</section><section className="homePriority"><article><span className="priorityFlag">NEXT TEAM CALL</span><div><small>Hungarian World Cup · Point fighting</small><h3>Charlie Baxter</h3><p>Area 3 · adjusted call 14:31</p></div><button onClick={()=>onOpen("liveSchedule")}>Open fight tracker →</button></article><aside><div><span className="eyebrow">QUICK ACCESS</span><button onClick={onSearch}>Edit shortcuts</button></div>{shortcuts.length?shortcuts.map(tool=><div className="quickTool" key={tool.id}><button onClick={()=>onOpen(tool.id)}><i>{tool.icon}</i><span><b>{tool.label}</b><small>{hubNames[tool.hub]}</small></span></button><button className={favourites.includes(tool.id)?"active":""} aria-label={(favourites.includes(tool.id)?"Remove ":"Add ")+tool.label+" favourite"} onClick={()=>onToggleFavourite(tool.id)}>★</button></div>):<button className="emptyShortcut" onClick={onSearch}>Choose favourite tools</button>}</aside></section></div>
}

const todayActions:{id:string;window:TodayWindow;tone:string;title:string;detail:string;target:string;action:string}[]=[
 {id:"call",window:"Now",tone:"urgent",title:"Confirm Charlie’s fight readiness",detail:"Hungarian World Cup · Area 3 · adjusted call 14:31",target:"liveSchedule",action:"Open live tracker"},
 {id:"entries",window:"Today",tone:"gold",title:"Review 2 competition entries",detail:"Eligibility and registration details need checking",target:"entryPlanner",action:"Review entries"},
 {id:"handover",window:"Today",tone:"care",title:"Complete welfare handover",detail:"One open athlete handover needs acknowledgement",target:"welfareHandover",action:"Open handover"},
 {id:"session",window:"This week",tone:"blue",title:"Finish Monday’s class plan",detail:"Add the final drill and assign the coaching team",target:"classPlanner",action:"Continue plan"},
];

export function TodayBoard({onOpen}:{onOpen:(id:string)=>void}){
 const[window,setWindow]=useState<TodayWindow>("Today");const order:TodayWindow[]=["Now","Today","This week"];const visible=todayActions.filter(item=>order.indexOf(item.window)<=order.indexOf(window));
 return <section className="todayBoard"><div className="todayHead"><div><span className="badge gold">PHASE 89 · TODAY</span><h2>What needs attention</h2></div><div role="group" aria-label="Action timeframe">{order.map(item=><button key={item} className={window===item?"active":""} onClick={()=>setWindow(item)}>{item}</button>)}</div></div><div className="todayList">{visible.map((item,index)=><article key={item.id}><i className={item.tone}>{index+1}</i><span><small>{item.window.toUpperCase()}</small><b>{item.title}</b><p>{item.detail}</p></span><button onClick={()=>onOpen(item.target)}>{item.action}<em>→</em></button></article>)}</div></section>
}

export function ToolContextBar({hub,tool,favourite,onBack,onFind,onToggleFavourite}:{hub:string;tool:string;favourite:boolean;onBack:()=>void;onFind:()=>void;onToggleFavourite:()=>void}){
 return <nav className="toolContext" aria-label="Current tool"><button className="contextBack" onClick={onBack}>← <span>Back to {hubNames[hub]||"FightEye"}</span></button><span><small>PHASE 88 · {hubNames[hub]}</small><b>{tool}</b></span><div><button onClick={onFind} aria-label="Find another tool">⌕ <span>Find</span></button><button className={favourite?"active":""} onClick={onToggleFavourite} aria-label={(favourite?"Remove ":"Add ")+tool+" favourite"}>★</button></div></nav>
}

export function QuickActionSheet({open,onClose,onAction}:{open:boolean;onClose:()=>void;onAction:(action:string)=>void}){
 useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose()};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[open,onClose]);
 if(!open)return null;const actions=[{id:"athlete",icon:"◎",title:"Add athlete",detail:"Create a club athlete record"},{id:"competition",icon:"◇",title:"Add competition",detail:"Create an event record"},{id:"video",icon:"▶",title:"Upload fight video",detail:"Store footage for review"},{id:"liveSessionCommand",icon:"◷",title:"Run coaching session",detail:"Start the class command screen"},{id:"liveSchedule",icon:"●",title:"Open fight tracker",detail:"Go straight to live operations"},{id:"sessionRegister",icon:"✓",title:"Take attendance",detail:"Open the session register"}];
 return <div className="quickBackdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="quickSheet" role="dialog" aria-modal="true" aria-label="Quick actions"><header><div><span className="badge gold">PHASE 90 · ONE-TAP ACTIONS</span><h2>What do you want to do?</h2></div><button onClick={onClose} aria-label="Close quick actions">×</button></header><div>{actions.map(action=><button key={action.id} onClick={()=>onAction(action.id)}><i>{action.icon}</i><span><b>{action.title}</b><small>{action.detail}</small></span><em>→</em></button>)}</div></section></div>
}

export function ToolFinder({open,tools,favourites,onClose,onOpen,onToggleFavourite}:{open:boolean;tools:ToolItem[];favourites:string[];onClose:()=>void;onOpen:(id:string)=>void;onToggleFavourite:(id:string)=>void}){
 const[query,setQuery]=useState("");const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(!open)return;requestAnimationFrame(()=>input.current?.focus());const close=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose()};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[open,onClose]);
 const results=useMemo(()=>{const value=query.trim().toLowerCase();return tools.filter(tool=>!value||[tool.label,tool.description,hubNames[tool.hub]].join(" ").toLowerCase().includes(value)).slice(0,12)},[query,tools]);
 if(!open)return null;
 return <div className="finderBackdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="toolFinder" role="dialog" aria-modal="true" aria-label="Find a FightEye tool"><label><i>⌕</i><input ref={input} value={query} onChange={event=>setQuery(event.target.value)} placeholder="Find athletes, events or tools…"/><button onClick={onClose} aria-label="Close search">×</button></label><div className="finderResults">{results.map(tool=><article key={tool.id}><button onClick={()=>onOpen(tool.id)}><i>{tool.icon}</i><span><b>{tool.label}</b><small>{hubNames[tool.hub]} · {tool.description}</small></span><em>→</em></button><button className={favourites.includes(tool.id)?"active":""} aria-label={(favourites.includes(tool.id)?"Remove ":"Add ")+tool.label+" favourite"} onClick={()=>onToggleFavourite(tool.id)}>★</button></article>)}{!results.length&&<div className="finderEmpty"><i>⌕</i><b>No matching tools</b><span>Try an athlete, event or action.</span></div>}</div><footer><span><kbd>↑</kbd><kbd>↓</kbd> browse</span><span><kbd>esc</kbd> close</span></footer></section></div>
}

export function MobileHubMenu({tools,hubs,recents,onOpen,onOpenHub,onSearch,onClose}:{tools:ToolItem[];hubs:HubItem[];recents:string[];onOpen:(id:string)=>void;onOpenHub:(id:string)=>void;onSearch:()=>void;onClose:()=>void}){
 const recentTools=recents.map(id=>tools.find(tool=>tool.id===id)).filter(Boolean).slice(0,4) as ToolItem[];
 return <><button className="mobileFind" onClick={onSearch}><i>⌕</i><span>Find anything in FightEye</span></button><div className="mobileHubGrid">{hubs.filter(hub=>hub.id!=="overview").map(hub=><button key={hub.id} onClick={()=>{onOpenHub(hub.id);onClose()}}><i>{hub.icon}</i><span><b>{hub.label}</b><small>{hub.description}</small></span></button>)}</div>{recentTools.length>0&&<div className="mobileRecent"><span>RECENT</span>{recentTools.map(tool=><button key={tool.id} onClick={()=>{onOpen(tool.id);onClose()}}><i>{tool.icon}</i>{tool.label}<em>→</em></button>)}</div>}</>
}
