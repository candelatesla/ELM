import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ELM Progress Tracker",
  description: "Config-driven child progress and assessment entry app for ELM domains.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
