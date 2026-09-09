import type { Metadata } from "next";
import { AppNav } from "@/components/app-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finalsite Project Desk",
  description: "School lifecycle email automation prototype",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-frame">
          <AppNav />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
