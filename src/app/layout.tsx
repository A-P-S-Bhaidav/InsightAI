import "./globals.css";
import { Inter } from "next/font/google";
import ThemeProvider from "@/components/layout/ThemeProvider";
import { ToastProvider } from "@/components/common/Toast";
import { Metadata } from "next";
import AppLayoutWrapper from "@/components/layout/AppLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "InsightAI - AI-Powered Data Intelligence Platform",
    template: "%s | InsightAI",
  },
  description:
    "Transform natural-language business requirements into clean, structured, source-backed datasets. AI-powered web scraping, data validation, and workflow automation.",
  keywords: [
    "AI data collection",
    "web scraping",
    "data intelligence",
    "workflow automation",
    "dataset generation",
    "business intelligence",
  ],
  authors: [{ name: "InsightAI Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "InsightAI",
    title: "InsightAI - AI-Powered Data Intelligence Platform",
    description:
      "Transform natural-language requirements into structured datasets with AI-powered scraping and validation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "InsightAI - AI-Powered Data Intelligence",
    description:
      "Transform natural-language requirements into structured datasets.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0a0a0f" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <ToastProvider>
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
