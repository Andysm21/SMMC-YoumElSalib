import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Event Website",
    template: "%s | Event Website",
  },
  description: "A production-ready event website built with Next.js, TypeScript, and Tailwind CSS",
  keywords: ["event", "website", "next.js", "typescript", "tailwind"],
  authors: [
    {
      name: "Your Name",
      url: "https://yourwebsite.com",
    },
  ],
  creator: "Your Name",
  publisher: "Your Name",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourwebsite.com",
    title: "Event Website",
    description: "A production-ready event website built with Next.js",
    images: [
      {
        url: "https://yourwebsite.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Event Website",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Website",
    description: "A production-ready event website built with Next.js",
    creator: "@yourhandle",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 font-sans">
        {children}
      </body>
    </html>
  );
}
