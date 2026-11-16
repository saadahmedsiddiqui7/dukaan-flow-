import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "DukaanFlow",
  description: "One platform for every business across India.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
