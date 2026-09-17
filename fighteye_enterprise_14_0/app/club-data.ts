export type MembershipStatus="Active"|"Trial"|"Paused";
export type ClubAthlete={id:string;name:string;dateOfBirth:string;category:string;weight:string;grade:string;disciplines:string[];licence:string;membership:MembershipStatus;guardian:string;emergencyPhone:string;notes:string};

export const clubAthletesKey="fighteye-club-athletes-v1";

export const defaultClubAthletes:ClubAthlete[]=[
 {id:"club-charlie-baxter",name:"Charlie Baxter",dateOfBirth:"2012-04-18",category:"Older Cadet",weight:"−42 kg",grade:"Black belt",disciplines:["PF","LC","KL"],licence:"WGB-OC-1042",membership:"Active",guardian:"Dean Baxter",emergencyPhone:"",notes:"England squad athlete"},
 {id:"club-jamie-granville",name:"Jamie Granville",dateOfBirth:"2010-08-07",category:"Junior",weight:"−60 kg",grade:"Black belt",disciplines:["PF","LC","KL"],licence:"",membership:"Active",guardian:"",emergencyPhone:"",notes:""},
 {id:"club-hollie-haworth",name:"Hollie Haworth",dateOfBirth:"2012-11-14",category:"Older Cadet",weight:"Category to confirm",grade:"Advanced",disciplines:["PF","LC"],licence:"",membership:"Active",guardian:"",emergencyPhone:"",notes:""},
 {id:"club-callum-edwards",name:"Callum Edwards",dateOfBirth:"2011-06-02",category:"Older Cadet",weight:"Category to confirm",grade:"Advanced",disciplines:["PF","LC","KL"],licence:"",membership:"Active",guardian:"",emergencyPhone:"",notes:""},
 {id:"club-reece-wells",name:"Reece Wells",dateOfBirth:"2009-03-21",category:"Junior",weight:"Category to confirm",grade:"Advanced",disciplines:["PF","LC"],licence:"",membership:"Active",guardian:"",emergencyPhone:"",notes:""},
 {id:"club-olivia-green",name:"Olivia Green",dateOfBirth:"2013-01-09",category:"Older Cadet",weight:"Category to confirm",grade:"Intermediate",disciplines:["PF"],licence:"",membership:"Active",guardian:"Gemma Green",emergencyPhone:"",notes:""},
 {id:"club-zak",name:"Zak",dateOfBirth:"2011-09-10",category:"Older Cadet",weight:"Category to confirm",grade:"Intermediate",disciplines:["PF","LC"],licence:"",membership:"Active",guardian:"",emergencyPhone:"",notes:""},
 {id:"club-joe-hopkinson",name:"Joe Hopkinson",dateOfBirth:"2008-12-05",category:"Junior",weight:"Category to confirm",grade:"Advanced",disciplines:["PF","LC"],licence:"",membership:"Active",guardian:"",emergencyPhone:"",notes:""}
];

export function readClubAthletes(){
 if(typeof window==="undefined")return defaultClubAthletes;
 try{const value=JSON.parse(localStorage.getItem(clubAthletesKey)||"null");return Array.isArray(value)?value as ClubAthlete[]:defaultClubAthletes}catch{return defaultClubAthletes}
}
