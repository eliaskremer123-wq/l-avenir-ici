import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PostHogProvider } from "./providers/posthog-provider";
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
  metadataBase: new URL("https://lavenirici.org"),
  title: "L'Avenir Ici — Lorraine",
  description:
    "Découvrez comment vous pourriez vous inscrire dans l'avenir industriel de Lorraine.",
  openGraph: {
    title: "L'Avenir Ici — Lorraine",
    description:
      "Découvrez comment vous pourriez vous inscrire dans l'avenir industriel de Lorraine.",
    url: "https://lavenirici.org",
    siteName: "L'Avenir Ici",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "L'Avenir Ici — Lorraine",
    description:
      "Découvrez comment vous pourriez vous inscrire dans l'avenir industriel de Lorraine.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased bg-zinc-950 text-zinc-50`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
