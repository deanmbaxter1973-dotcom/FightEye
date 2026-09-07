import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
type RuntimeBindings={DB:D1Database;BUCKET:R2Bucket};
export function getRuntimeBindings(){
 const bindings=(globalThis as typeof globalThis&{__FIGHTEYE_ENV?:RuntimeBindings}).__FIGHTEYE_ENV;
 if(!bindings?.DB)throw new Error("FightEye database binding is unavailable.");
 return bindings;
}
export function getDb(){return drizzle(getRuntimeBindings().DB,{schema})}
