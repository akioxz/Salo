import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { PhoneWrapper } from "@/components/ui/PhoneWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Salo - Tahanan ng Pamilya",
  description: "Private household feed and budget space for OFWs and their families",
  applicationName: "Salo",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Salo",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Salo - Tahanan ng Pamilya",
    description: "Private household feed and budget space for OFWs and their families",
    url: "https://salo.app",
    siteName: "Salo",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Salo - Tahanan ng Pamilya",
      },
    ],
    locale: "fil_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salo - Tahanan ng Pamilya",
    description: "Private household feed and budget space for OFWs and their families",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFBFA" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fil"
      className={`${inter.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Salo - Tahanan ng Pamilya",
              description: "Private household feed and budget space for OFWs and their families",
              url: "https://salo.app",
              applicationCategory: "SocialNetworkingApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "PHP",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-100 dark:bg-[#0A0A0A] text-foreground font-sans transition-colors duration-300">
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
          >
            <ErrorBoundary>
              <PhoneWrapper>
                {children}
              </PhoneWrapper>
            </ErrorBoundary>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
