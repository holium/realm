import { ReactNode } from 'react';
import NextHead from 'next/head';

const siteUrl = 'https://www.holium.com/';
const siteTitle = 'Holium';
const siteDescription =
  'Holium Realm is a crypto OS that has a wallet, collaborative primitives, voice and cursor sharing, Urbit apps, and more. Compute together.';
const siteKeywords =
  'Holium, urbit, p2p, decentralized, crypto, community, realm, collaboration';

type Props = {
  title: string;
  children: ReactNode;
};

export const Page = ({ title = siteTitle, children }: Props) => {
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

        <meta property="og:url" content="https://www.holium.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={`${siteUrl}og-twitter-image.png`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@HoliumCorp" />
        <meta name="twitter:creator" content="@HoliumCorp" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={`${siteUrl}og-twitter-image.png`} />
      </NextHead>

      {children}
    </>
  );
};
