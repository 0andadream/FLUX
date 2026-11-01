import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { Providers } from "@/components/providers";
import { Shell } from "@/components/shell";
import { config } from "@/lib/wagmi";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flux",
  description: "Generate image, video, music, and voice. Pay with stablecoins on Celo.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const headerList = await headers();
  const initialState = cookieToInitialState(config, headerList.get("cookie"));
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers initialState={initialState}>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
