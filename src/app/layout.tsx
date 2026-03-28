import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

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
      <head>
        {/* Fontshare: Clash Display (headlines) + Satoshi (body) */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,600,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
