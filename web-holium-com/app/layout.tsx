import type { Metadata } from 'next';
import Script from 'next/script';
import { Rubik } from 'next/font/google';

import './globals.css';

const rubik = Rubik({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Passport Profile',
  description: 'Passport profile.',
  // metadataBase: new URL('{og-ship-url}'),
  openGraph: {
    title: '{og-title}',
    description: '{og-description}',
    siteName: '{og-site}',
    // https://ogp.me/#type_profile
    type: 'profile',
    images: [
      {
        url: '{og-image-small}',
        width: 800,
        height: 600,
      },
      {
        url: '{og-image-large}',
        width: 1800,
        height: 1600,
        alt: '{og-image-alt}',
      },
    ],
    locale: 'en_US',
    url: '{og-url}',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Script id="show-banner">
        {`window.__INITIAL_STATE__ = "{ discoverable: {passport-discoverable} };"`}
      </Script>
      <body className={rubik.className}>{children}</body>
    </html>
  );
}
