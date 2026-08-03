import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FreshFlow — Stop Fresh Food Waste Before It Happens",
  description:
    "AI-powered demand forecasting and surplus matching for independent wholesalers, retailers and restaurants across Europe. Reduce waste, recover revenue.",
  keywords: ["food waste", "demand forecasting", "surplus matching", "food sustainability", "wholesale", "Europe"],
  openGraph: {
    title: "FreshFlow — Stop Fresh Food Waste Before It Happens",
    description:
      "AI-powered demand forecasting and surplus matching for independent food businesses across Europe.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}