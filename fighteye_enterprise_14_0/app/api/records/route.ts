import { getDb } from "../../../db";
import { athletes, auditLog, clubs, competitions, duplicateFlags, fights, userRoles } from "../../../db/schema";
import { desc, eq } from "drizzle-orm";

type Entity="athlete"|"club"|"competition"|"fight"|"role"|"duplicate";
const actor=(r:Request)=>r.headers.get("oai-authenticated-user-email")||"phase1-admin@fighteye.local";
const safe=(v:unknown)=>typeof v==="string"?v.trim():"";
export async function GET(request:Request){
 try{
  const entity=(new URL(request.url).searchParams.get("entity")||"summary") as Entity|"summary"|"audit";
  const db=getDb();
  if(entity==="summary"){
   const [a,c,e,f,d,r]=await Promise.all([db.select().from(athletes),db.select().from(clubs),db.select().from(competitions),db.select().from(fights),db.select().from(duplicateFlags).where(eq(duplicateFlags.status,"open")),db.select().from(userRoles).where(eq(userRoles.active,true))]);
   return Response.json({counts:{athletes:a.length,clubs:c.length,competitions:e.length,fights:f.length,duplicates:d.length,roles:r.length}});
  }
  if(entity==="athlete")return Response.json({rows:await db.select().from(athletes).orderBy(desc(athletes.id)).limit(100)});
  if(entity==="club")return Response.json({rows:await db.select().from(clubs).orderBy(desc(clubs.id)).limit(100)});
  if(entity==="competition")return Response.json({rows:await db.select().from(competitions).orderBy(desc(competitions.startDate)).limit(100)});
  if(entity==="fight")return Response.json({rows:await db.select().from(fights).orderBy(desc(fights.id)).limit(100)});
  if(entity==="role")return Response.json({rows:await db.select().from(userRoles).orderBy(desc(userRoles.id)).limit(100)});
  if(entity==="duplicate")return Response.json({rows:await db.select().from(duplicateFlags).orderBy(desc(duplicateFlags.id)).limit(100)});
  return Response.json({rows:await db.select().from(auditLog).orderBy(desc(auditLog.id)).limit(100)});
 }catch(error){return Response.json({error:error instanceof Error?error.message:"Database unavailable"},{status:500})}
}
export async function POST(request:Request){
 try{
  const body=await request.json() as Record<string,unknown>&{entity?:Entity}; const db=getDb(); const who=actor(request); let row:unknown; const type=body.entity;
  if(type==="athlete"){const firstName=safe(body.firstName),lastName=safe(body.lastName);if(!firstName||!lastName)return Response.json({error:"First and last name are required"},{status:400});[row]=await db.insert(athletes).values({firstName,lastName,displayName:safe(body.displayName)||`${firstName} ${lastName}`,dateOfBirth:safe(body.dateOfBirth)||null,nationality:safe(body.nationality)||null,grade:safe(body.grade)||null,clubId:Number(body.clubId)||null}).returning()}
  else if(type==="club"){const name=safe(body.name);if(!name)return Response.json({error:"Club name is required"},{status:400});[row]=await db.insert(clubs).values({name,city:safe(body.city)||null,country:safe(body.country)||"GB",contactEmail:safe(body.contactEmail)||null}).returning()}
  else if(type==="competition"){const name=safe(body.name),startDate=safe(body.startDate);if(!name||!startDate)return Response.json({error:"Name and start date are required"},{status:400});[row]=await db.insert(competitions).values({name,startDate,endDate:safe(body.endDate)||null,venue:safe(body.venue)||null,city:safe(body.city)||null,country:safe(body.country)||null,sourceUrl:safe(body.sourceUrl)||null,status:"draft"}).returning()}
  else if(type==="role"){const userEmail=safe(body.userEmail),role=safe(body.role) as "athlete"|"parent"|"coach"|"club_admin"|"system_admin";if(!userEmail||!role)return Response.json({error:"Email and role are required"},{status:400});[row]=await db.insert(userRoles).values({userEmail,role,clubId:Number(body.clubId)||null,athleteId:Number(body.athleteId)||null}).returning()}
  else return Response.json({error:"Unsupported entity"},{status:400});
  const entityId=Number((row as {id?:number})?.id)||null;await db.insert(auditLog).values({actorEmail:who,action:"create",entityType:type||"unknown",entityId,afterJson:JSON.stringify(row),requestId:crypto.randomUUID()});
  return Response.json({row},{status:201});
 }catch(error){return Response.json({error:error instanceof Error?error.message:"Write failed"},{status:500})}
}
export async function PATCH(request:Request){
 try{const body=await request.json() as {id?:number,status?:"merged"|"not_duplicate"};if(!body.id||!body.status)return Response.json({error:"id and status required"},{status:400});const db=getDb();const [row]=await db.update(duplicateFlags).set({status:body.status,resolvedBy:actor(request),resolvedAt:new Date().toISOString(),updatedAt:new Date().toISOString()}).where(eq(duplicateFlags.id,body.id)).returning();await db.insert(auditLog).values({actorEmail:actor(request),action:"resolve_duplicate",entityType:"duplicate",entityId:body.id,afterJson:JSON.stringify(row),requestId:crypto.randomUUID()});return Response.json({row})}catch(error){return Response.json({error:error instanceof Error?error.message:"Update failed"},{status:500})}
}
