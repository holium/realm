import { ReactNode } from 'react';
import NextHead from 'next/head';
import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

import { spaces } from '../spaces';
import { SpaceKeys } from '../types';
import { GlobalStyle } from './GlobalStyle';
import { Header } from './Header';
import { useSpace } from './SpaceContext';

export const siteUrl = 'https://www.holium.com';
const siteTitle = 'Holium';
const siteDescription =
  'Holium Realm is a crypto OS that has a wallet, collaborative primitives, voice and cursor sharing, Urbit apps, and more. Compute together.';
const siteKeywords =
  'Holium, urbit, p2p, decentralized, crypto, community, realm, collaboration';
const siteImage = `${siteUrl}/og-image.png`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

type Props = {
  title: string;
  description?: string;
  image?: string;
  wallpaper?: boolean;
  forcedSpace?: SpaceKeys;
  body: ReactNode;
  footer?: ReactNode;
};

export const Page = ({
  title = siteTitle,
  description = siteDescription,
  image = siteImage,
  wallpaper = true,
  forcedSpace,
  body,
  footer,
}: Props) => {
  const { space } = useSpace();
  const theme = spaces[forcedSpace ?? space].theme;

  return (
    <>
      <NextHead>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta name="description" content={description} />
        <meta name="keywords" content={siteKeywords} />
        <meta name="author" content="Holium" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />

        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@HoliumCorp" />
        <meta name="twitter:creator" content="@HoliumCorp" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />

        <meta name="theme-color" content={theme.backgroundColor} />
        <meta
          name="msapplication-navbutton-color"
          content={theme.backgroundColor}
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content={theme.backgroundColor}
        />
      </NextHead>

      <GlobalStyle theme={theme} />
      <Flex
        className="wallpaper"
        backgroundImage={wallpaper ? `url(${theme.wallpaper})` : undefined}
      />
      <Header />
      <Main>{body}</Main>
      {footer}
    </>
  );
};
