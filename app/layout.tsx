import type { Metadata } from "next";import "./globals.css";
export const metadata:Metadata={title:"HiFi Tower | High-End Audio",description:"40 years of high-fidelity audio, home cinema and expert system design."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><body>{children}</body></html>}