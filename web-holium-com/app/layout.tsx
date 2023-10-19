import { Rubik } from 'next/font/google';

import './globals.css';

const rubik = Rubik({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <meta property="og:title" content="{og-title}"></meta>
      <meta property="og:description" content="{og-description}"></meta>
      <meta property="og:type" content="profile"></meta>
      <meta property="og:profile:username" content="{og-username}"></meta>
      <meta property="og:image" content="{og-image}"></meta>
      <meta property="og:url" content="{og-url}"></meta>
      <body className={rubik.className}>{children}</body>
    </html>
  );
}
