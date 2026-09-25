"use client";

import Image from "next/image";

export const organisationProfileKey="fighteye-club-profile-v1";
export type OrganisationBrand={name:string;logoDataUrl?:string};

export const defaultOrganisationBrand:OrganisationBrand={name:"Prestige Martial Arts",logoDataUrl:""};

export function readOrganisationBrand():OrganisationBrand{
 if(typeof window==="undefined")return defaultOrganisationBrand;
 try{const saved=JSON.parse(localStorage.getItem(organisationProfileKey)||"null");return{name:saved?.name?.trim()||defaultOrganisationBrand.name,logoDataUrl:saved?.logoDataUrl||""}}catch{return defaultOrganisationBrand}
}

export function OrganisationMark({brand=defaultOrganisationBrand,compact=false}:{brand?:OrganisationBrand;compact?:boolean}){
 const initials=brand.name.split(" ").filter(Boolean).map(part=>part[0]).join("").slice(0,3).toUpperCase();
 return <div className={`organisation-mark ${compact?"compact":""}`} aria-label={`${brand.name} organisation logo`}>
  <span className="organisation-mark-image">{brand.logoDataUrl?<Image src={brand.logoDataUrl} alt={`${brand.name} logo`} width={58} height={58} unoptimized/>:<b>{initials}</b>}</span>
  <span><small>CLUB ORGANISATION</small><strong>{brand.name}</strong></span>
 </div>;
}

export async function optimiseLogo(file:File):Promise<string>{
 if(!file.type.startsWith("image/"))throw new Error("Choose an image file");
 const source=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("Could not read that logo"));reader.readAsDataURL(file)});
 return await new Promise<string>(resolve=>{const image=new window.Image();image.onload=()=>{const limit=512,scale=Math.min(1,limit/Math.max(image.width,image.height)),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const context=canvas.getContext("2d");if(!context){resolve(source);return}context.drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/webp",.86))};image.onerror=()=>resolve(source);image.src=source});
}
