import "./globals.css";
import AppShell from "../components/AppShell";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "CCRS CRM - Auto Excel Report System",
  description: "Automated Command & Control Room System Complaints CRM & PowerPoint Report Generator",
  icons: {
    icon: "/AMC Logo.webp",
    shortcut: "/AMC Logo.webp",
    apple: "/AMC Logo.webp",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased selection:bg-blue-600 selection:text-white">
        <AppShell>{children}</AppShell>
        <SpeedInsights />
      </body>
    </html>
  );
}
