import { ReactNode } from 'react';
import NextHead from 'next/head';
import { spaces } from 'spaces';

import { useSpace } from './SpaceContext';

const siteUrl = 'https://www.holium.com';
const siteTitle = 'Holium';
const siteDescription =
  'Holium Realm is a crypto OS that has a wallet, collaborative primitives, voice and cursor sharing, Urbit apps, and more. Compute together.';
const siteKeywords =
  'Holium, urbit, p2p, decentralized, crypto, community, realm, collaboration';
const siteImage = `${siteUrl}/og-image.png`;

type Props = {
  title: string;
  children: ReactNode;
};

export const Page = ({ title = siteTitle, children }: Props) => {
  const { space } = useSpace();
  const themeColor = spaces[space].theme.backgroundColor;

  return (
    <>
      <NextHead>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta name="description" content={siteDescription} />
        <meta name="keywords" content={siteKeywords} />
        <meta name="author" content="Holium" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />

        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={siteImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@HoliumCorp" />
        <meta name="twitter:creator" content="@HoliumCorp" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={siteImage} />

        <meta name="theme-color" content={themeColor} />
        <meta name="msapplication-navbutton-color" content={themeColor} />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content={themeColor}
        />
      </NextHead>

      {children}
    </>
  );
};
