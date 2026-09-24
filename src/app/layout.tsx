import "./globals.css";
import { Inter } from "next/font/google";
import ThemeProvider from "@/components/layout/ThemeProvider";
import { ToastProvider } from "@/components/common/Toast";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Metadata } from "next";

import AppLayoutWrapper from "@/components/layout/AppLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InsightAI - AI-Powered Data Intelligence Platform",
  description:
    "Transform natural-language business requirements into clean, structured, source-backed datasets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
