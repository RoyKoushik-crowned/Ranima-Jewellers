import type { Metadata } from "next";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/inter/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://rmjewelers.com"
  ),
  title: {
    default: "Ranima Jewellers | Jewellery that carries a legacy",
    template: "%s | Ranima Jewellers",
  },
  description:
    "Ranima Jewellers — a heritage jewellery house in Guwahati, Assam, offering 22K gold jewellery, 925 silver and custom jewellery.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
