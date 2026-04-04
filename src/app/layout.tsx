import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reimagined Guidebook MVP",
  description: "Explore the hidden story of your city",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://cesium.com/downloads/cesiumjs/releases/1.115/Build/Cesium/Widgets/widgets.css" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        {/* Load CesiumJS before React hydration to ensure window.Cesium is available */}
        <Script 
          src="https://cesium.com/downloads/cesiumjs/releases/1.115/Build/Cesium/Cesium.js" 
          strategy="beforeInteractive" 
        />
        {children}
      </body>
    </html>
  );
}
