export type BoutStatus="Queued"|"Call"|"Live"|"Complete";
export type LiveBout={id:string;athlete:string;category:string;division:string;stage:string;ring:string;time:string;status:BoutStatus;opponent:string};
export const coaches=["Will Taylor","Saf","Trevor Digan"];
export const initialLiveBouts:LiveBout[]=[
 {id:"B41",athlete:"Charlie Baxter",category:"PF",division:"Older Cadet −42 kg",stage:"Quarter-final",ring:"Ring 2",time:"09:40",status:"Call",opponent:"Máté Horváth"},
 {id:"B18",athlete:"Olivia Green",category:"PF",division:"Younger Cadet −37 kg",stage:"Semi-final",ring:"Ring 4",time:"09:45",status:"Queued",opponent:"Eva Rossi"},
 {id:"B52",athlete:"Hollie Haworth",category:"LC",division:"Older Cadet −50 kg",stage:"Quarter-final",ring:"Ring 1",time:"09:52",status:"Queued",opponent:"Sofia Klein"},
 {id:"B63",athlete:"Jamie Granville",category:"LC",division:"Junior −60 kg",stage:"Final",ring:"Ring 3",time:"10:05",status:"Queued",opponent:"Leo Martin"},
 {id:"B75",athlete:"Charlie Baxter",category:"LC",division:"Older Cadet −42 kg",stage:"Last 16",ring:"Ring 5",time:"10:18",status:"Queued",opponent:"Noah Williams"},
 {id:"B82",athlete:"Hollie Haworth",category:"KL",division:"Older Cadet −50 kg",stage:"Semi-final",ring:"Ring 1",time:"10:34",status:"Queued",opponent:"Amelia Jones"},
];
export const initialAssignments:Record<string,string>={B41:"Will Taylor",B18:"Saf",B52:"Will Taylor",B63:"Trevor Digan",B75:"Will Taylor",B82:"Saf"};
export const statusOrder:BoutStatus[]=["Queued","Call","Live","Complete"];
export const minutes=(time:string)=>{const[hour,minute]=time.split(":").map(Number);return hour*60+minute};
