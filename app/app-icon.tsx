import type {SVGProps} from "react";

type IconName="home"|"athletes"|"coaching"|"events"|"live"|"club"|"manage"|"more";
const paths:Record<IconName,React.ReactNode>={
 home:<><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5M9 21v-7h6v7"/></>,
 athletes:<><circle cx="12" cy="7" r="3"/><path d="M5.5 21v-2.5a6.5 6.5 0 0 1 13 0V21M4 5.5l2.5-2M20 5.5l-2.5-2"/></>,
 coaching:<><path d="M4 20V9l8-5 8 5v11"/><path d="m8 13 2.5 2.5L16.5 9"/></>,
 events:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h3M14 14h3M7 18h3"/></>,
 live:<><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.6 4.6a10.5 10.5 0 0 0 0 14.8M19.4 4.6a10.5 10.5 0 0 1 0 14.8"/></>,
 club:<><path d="M4 21v-9l8-5 8 5v9M9 7V4h6v3M9 21v-5h6v5"/><circle cx="7" cy="13" r="1"/><circle cx="17" cy="13" r="1"/></>,
 manage:<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></>,
 more:<><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></>,
};
export default function AppIcon({name,...props}:{name:IconName}&SVGProps<SVGSVGElement>){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{paths[name]}</svg>}
