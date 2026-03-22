import type { Metadata } from 'next';
import { Cormorant_Garamond, Josefin_Sans, DM_Sans } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['100', '300', '400', '600'],
  variable: '--font-josefin',
  display: 'swap',
});

const dm = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Picadilly Tailors — Bespoke Tailoring Since 1930',
  description: 'Distinguished and experienced bespoke tailors with nearly a century of tailoring heritage. Located at Far East Plaza, Singapore.',
  keywords: 'bespoke tailor, singapore tailor, custom suit, wedding suit, luxury tailoring',
  openGraph: {
    title: 'Picadilly Tailors — Crafted for Distinction',
    description: 'Nearly a century of bespoke tailoring heritage in Singapore.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${josefin.variable} ${dm.variable}`}>
      <body className="bg-obsidian text-cream antialiased">
        {children}
      </body>
    </html>
  );
}
