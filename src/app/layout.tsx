import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Poppins, Fraunces } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Scoped to the landing page's redesigned hero (see src/app/page.tsx) — the
// rest of the app keeps the Geist system fonts above.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Soft, rounded display serif for the hero headline — matches the Replit
// reference's treatment.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: "Troy Adventist Academy Preschool | Parent Handbook & Forms",
  description: "Digital admission and student forms for Troy Adventist Academy Preschool.",
  appleWebApp: {
    capable: true,
    // "black-translucent" overlays the status bar directly on top of page
    // content (no reserved space) — without matching safe-area-inset CSS
    // everywhere, that clips/overlaps the header instead of looking
    // immersive. "default" keeps iOS reserving normal space for it, which
    // this app never accounted for otherwise.
    statusBarStyle: "default",
    title: "TAA Preschool",
  },
};

export const viewport: Viewport = {
  themeColor: "#241a5e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex h-screen flex-col overflow-hidden">
        <AuthProvider>
          <CartProvider>
            <ServiceWorkerRegister />
            <SiteHeader />
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
            <SiteFooter />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
