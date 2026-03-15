import type { Metadata } from "next";
import { Rubik, Syne } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Khoi Do | Portfolio",
  description:
    "Portfolio website of Khoi Do, a software engineer specializing in web development and design. Showcasing projects, skills, and experience in creating modern and responsive web applications.",
  icons: {
    icon: "/profile/favicon.png",
    shortcut: "/profile/favicon.png",
    apple: "/profile/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${rubik.variable}`}>{children}</body>
    </html>
  );
}
