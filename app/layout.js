import './style.css';
export const metadata={title:'SET — Creative Production OS',description:'Creative production workspace',manifest:'/manifest.json',appleWebApp:{capable:true,title:'SET',statusBarStyle:'default'},viewport:'width=device-width, initial-scale=1, viewport-fit=cover'};
export default function RootLayout({children}){return <html lang="en"><body>{children}</body></html>}