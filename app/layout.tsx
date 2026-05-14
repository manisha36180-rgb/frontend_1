import type { Metadata } from "next";
import { Inter, Roboto, Poppins, Open_Sans, Geist, Geist_Mono, Lexend } from "next/font/google";
import { AuthProvider } from "@/hooks/use-auth";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ["400", "700", "900"],
  variable: "--font-roboto",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "600", "800"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sellamsoft Inspection Report System",
  description: "Professional shipping inspection and vessel management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} ${openSans.variable} ${lexend.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <AuthProvider>
          <AccessibilityProvider>
            {children}
          </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
