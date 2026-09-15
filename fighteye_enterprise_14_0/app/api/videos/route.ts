import { getDb, getRuntimeBindings } from "../../../db";
import { auditLog, videos } from "../../../db/schema";

export async function POST(request:Request){
 try{
  const form=await request.formData();const file=form.get("file");if(!(file instanceof File))return Response.json({error:"Video file required"},{status:400});
  if(!file.type.startsWith("video/"))return Response.json({error:"Only video files are accepted"},{status:415});
  const key=`fights/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
  await getRuntimeBindings().BUCKET.put(key,file.stream(),{httpMetadata:{contentType:file.type},customMetadata:{originalName:file.name}});
  const who=request.headers.get("oai-authenticated-user-email")||"phase1-admin@fighteye.local";const db=getDb();
  const [row]=await db.insert(videos).values({fightId:Number(form.get("fightId"))||null,objectKey:key,filename:file.name,contentType:file.type,sizeBytes:file.size,visibility:"private",processingStatus:"uploaded",uploadedBy:who}).returning();
  await db.insert(auditLog).values({actorEmail:who,action:"upload",entityType:"video",entityId:row.id,afterJson:JSON.stringify({filename:file.name,size:file.size,key}),requestId:crypto.randomUUID()});
  return Response.json({video:row,analysisUrl:"/api/analysis"},{status:201});
 }catch(error){return Response.json({error:error instanceof Error?error.message:"Upload failed"},{status:500})}
}
