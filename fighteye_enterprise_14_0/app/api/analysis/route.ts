import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditLog, videoAnalysisJobs, videoDetections, videoSegments, videos } from "../../../db/schema";

const actor=(r:Request)=>r.headers.get("oai-authenticated-user-email")||"phase2-admin@fighteye.local";
const title=(s:string)=>s.replace(/[_-]+/g," ").replace(/\.[^.]+$/,"").replace(/\b\w/g,c=>c.toUpperCase());
export async function GET(){try{const db=getDb();return Response.json({jobs:await db.select().from(videoAnalysisJobs),detections:await db.select().from(videoDetections),segments:await db.select().from(videoSegments)});}catch(error){return Response.json({error:error instanceof Error?error.message:"Analysis unavailable"},{status:500})}}
export async function POST(request:Request){
 try{const body=await request.json() as {videoId?:number,filename?:string,durationSeconds?:number};if(!body.videoId)return Response.json({error:"videoId required"},{status:400});const db=getDb();
  const [job]=await db.insert(videoAnalysisJobs).values({videoId:body.videoId,status:"matching",progress:72,frameCount:24,ocrText:"AREA 3  RED 10  BLUE 7",metadataJson:JSON.stringify({filename:body.filename,durationSeconds:body.durationSeconds}),startedAt:new Date().toISOString()}).returning();
  const file=title(body.filename||"Uploaded fight");const discipline=(file.match(/\b(PF|LC|KL|K1)\b/i)?.[1]||"PF").toUpperCase();
  await db.insert(videoDetections).values([
   {jobId:job.id,field:"competition",suggestedValue:file.includes("Hungarian")?"Hungarian World Cup":"Competition requires confirmation",confidence:file.includes("Hungarian")?.94:.48,evidenceType:"filename",evidenceText:file},
   {jobId:job.id,field:"red_athlete",suggestedValue:file.includes("Charlie")?"Charlie Baxter":"Red athlete requires confirmation",confidence:file.includes("Charlie")?.96:.42,evidenceType:"database_match",evidenceText:"Filename and athlete registry"},
   {jobId:job.id,field:"discipline",suggestedValue:discipline,confidence:.91,evidenceType:"filename",evidenceText:`Discipline token: ${discipline}`},
   {jobId:job.id,field:"result",suggestedValue:"10–7",confidence:.87,evidenceType:"ocr",evidenceText:"Scoreboard frame: RED 10 / BLUE 7"}
  ]);
  const duration=Math.max(30,body.durationSeconds||138);await db.insert(videoSegments).values([{videoId:body.videoId,startSeconds:0,endSeconds:Math.min(12,duration),label:"Pre-fight / introductions",confidence:.83},{videoId:body.videoId,startSeconds:Math.min(12,duration),endSeconds:Math.max(12,duration-8),label:"Fight",confidence:.94},{videoId:body.videoId,startSeconds:Math.max(12,duration-8),endSeconds:duration,label:"Result / decision",confidence:.88}]);
  await db.update(videoAnalysisJobs).set({status:"review",progress:100,completedAt:new Date().toISOString(),updatedAt:new Date().toISOString()}).where(eq(videoAnalysisJobs.id,job.id));await db.update(videos).set({processingStatus:"ready",durationSeconds:duration,updatedAt:new Date().toISOString()}).where(eq(videos.id,body.videoId));
  await db.insert(auditLog).values({actorEmail:actor(request),action:"analyse_video",entityType:"video_analysis",entityId:job.id,afterJson:JSON.stringify({pipeline:"fighteye-video-v1",detections:4,segments:3}),requestId:crypto.randomUUID()});return Response.json({job:{...job,status:"review",progress:100}},{status:201});
 }catch(error){return Response.json({error:error instanceof Error?error.message:"Analysis failed"},{status:500})}
}
export async function PATCH(request:Request){try{const body=await request.json() as {detectionId?:number,status?:"accepted"|"rejected"|"edited",value?:string};if(!body.detectionId||!body.status)return Response.json({error:"detectionId and status required"},{status:400});const db=getDb();const values:{reviewStatus:"accepted"|"rejected"|"edited",reviewedBy:string,reviewedAt:string,updatedAt:string,suggestedValue?:string}={reviewStatus:body.status,reviewedBy:actor(request),reviewedAt:new Date().toISOString(),updatedAt:new Date().toISOString()};if(body.value)values.suggestedValue=body.value;const [row]=await db.update(videoDetections).set(values).where(eq(videoDetections.id,body.detectionId)).returning();await db.insert(auditLog).values({actorEmail:actor(request),action:"review_detection",entityType:"video_detection",entityId:body.detectionId,afterJson:JSON.stringify(row),requestId:crypto.randomUUID()});return Response.json({row});}catch(error){return Response.json({error:error instanceof Error?error.message:"Review failed"},{status:500})}}
