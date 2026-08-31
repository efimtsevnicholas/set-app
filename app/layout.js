import './style.css';
export const metadata={title:'SET — Creative Production Workspace',description:'One workspace for creative productions.'};
export const viewport={width:'device-width',initialScale:1,maximumScale:1,viewportFit:'cover'};
export default function RootLayout({children}){return <html lang="en"><body>{children}</body></html>}
