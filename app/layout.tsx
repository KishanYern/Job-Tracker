import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Track your job applications from GitHub job boards",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "32px 24px",
            minHeight: "calc(100vh - 60px)",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
