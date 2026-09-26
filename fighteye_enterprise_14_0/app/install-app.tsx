"use client";

import {useEffect,useState} from "react";

type InstallPromptEvent=Event&{
  prompt:()=>Promise<void>;
  userChoice:Promise<{outcome:"accepted"|"dismissed";platform:string}>;
};

declare global{interface Navigator{standalone?:boolean}}

export default function InstallApp(){
  const[prompt,setPrompt]=useState<InstallPromptEvent|null>(null);
  const[open,setOpen]=useState(false);
  const[installed,setInstalled]=useState(()=>typeof window!=="undefined"&&(window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true));
  const[isIos]=useState(()=>typeof navigator!=="undefined"&&/iphone|ipad|ipod/i.test(navigator.userAgent));

  useEffect(()=>{
    const standalone=window.matchMedia("(display-mode: standalone)");
    const syncInstalled=()=>setInstalled(standalone.matches||navigator.standalone===true);
    const capture=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPromptEvent)};
    const complete=()=>{setInstalled(true);setPrompt(null);setOpen(false)};
    standalone.addEventListener("change",syncInstalled);
    window.addEventListener("beforeinstallprompt",capture);
    window.addEventListener("appinstalled",complete);
    const refreshOnUpdate=()=>{if(navigator.serviceWorker.controller&&!sessionStorage.getItem("fighteye-sw-refreshed")){sessionStorage.setItem("fighteye-sw-refreshed","1");window.location.reload()}};
    if("serviceWorker" in navigator){navigator.serviceWorker.addEventListener("controllerchange",refreshOnUpdate);navigator.serviceWorker.register("/sw.js").then(registration=>registration.update()).catch(()=>undefined)}
    return()=>{standalone.removeEventListener("change",syncInstalled);window.removeEventListener("beforeinstallprompt",capture);window.removeEventListener("appinstalled",complete);if("serviceWorker" in navigator)navigator.serviceWorker.removeEventListener("controllerchange",refreshOnUpdate)};
  },[]);

  async function install(){
    if(prompt){await prompt.prompt();const choice=await prompt.userChoice;if(choice.outcome==="accepted")setPrompt(null);return}
    setOpen(true);
  }

  if(installed)return <span className="installedPill" aria-label="FightEye is installed">✓ Installed</span>;
  return <>
    <button className="installLaunch" onClick={install} aria-label="Download FightEye app"><span aria-hidden="true">⇩</span><b>Install app</b></button>
    {open&&<div className="installBackdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false)}}>
      <section className="installSheet" role="dialog" aria-modal="true" aria-labelledby="install-title">
        <button className="installClose" onClick={()=>setOpen(false)} aria-label="Close install instructions">×</button>
        <div className="installMark">FE</div>
        <span className="eyebrow">FIGHTEYE ON YOUR HOME SCREEN</span>
        <h2 id="install-title">Download FightEye</h2>
        <p>{isIos?"Install from Safari for full-screen, one-tap access.":"Install FightEye from your browser for fast, app-like access."}</p>
        {isIos?<ol><li><i>1</i><span>Open this page in <b>Safari</b>.</span></li><li><i>2</i><span>Tap the <b>Share</b> button.</span></li><li><i>3</i><span>Choose <b>Add to Home Screen</b>, then tap Add.</span></li></ol>:<ol><li><i>1</i><span>Open your browser menu.</span></li><li><i>2</i><span>Choose <b>Install app</b> or <b>Add to Home screen</b>.</span></li><li><i>3</i><span>Confirm to add FightEye to your device.</span></li></ol>}
        <button className="primary installDone" onClick={()=>setOpen(false)}>Got it</button>
        <small>Your FightEye access controls stay the same after installation.</small>
      </section>
    </div>}
  </>;
}
