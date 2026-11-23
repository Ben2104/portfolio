import type { Metadata, Viewport } from "next";
import { Anton, JetBrains_Mono, Poppins } from "next/font/google";
import type { ReactNode } from "react";

import { MotionProvider } from "@/components/deck/motion-provider";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbm", display: "swap" });

export const metadata: Metadata = {
  title: "Khoi Do | Portfolio",
  description:
    "Portfolio of Hoang Khoi Do, a Computer Science student and full stack developer. Work experience, selected projects and case studies, from the first idea to the shipped product.",
  icons: {
    icon: "/profile/favicon.png",
    shortcut: "/profile/favicon.png",
    apple: "/profile/favicon.png",
  },
};

export const viewport: Viewport = { themeColor: "#17181d" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${poppins.variable} ${mono.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
