import type { Metadata } from "next";
import { Source_Serif_4, Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "JobTracker",
  description: "Multi-tenant roofing job management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${serif.variable} ${sans.variable} min-h-screen bg-stone-50 font-sans text-stone-900 antialiased`}
      >
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
          <header className="mb-8 flex items-center justify-between border-b border-stone-200 pb-4">
            <Link
              href="/jobs"
              className="font-serif text-xl font-semibold text-stone-900"
            >
              JobTracker
            </Link>
            <nav aria-label="Primary">
              <Link
                href="/jobs"
                className="text-sm font-medium text-stone-700 hover:text-stone-900"
              >
                Jobs
              </Link>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
