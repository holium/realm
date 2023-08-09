import { ReactNode, useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import NextHead from 'next/head';

import { useToggle } from '@holium/design-system/util';
import {
  AccountDialogSkeleton,
  OnboardDialogSkeleton,
  OnboardingStorage,
} from '@holium/shared';

import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';
import { Main } from './Page.styles';

const siteDescription = 'Get on the Holium network.';
const siteKeywords = 'Holium, Hosting, Holium Hosting, Urbit, Urbit Hosting';
const siteUrl = 'https://hosting.holium.com';
const siteImage = `${siteUrl}/og-image.png`;
const siteColor = '#000000';

type Props = {
  title: string;
  isProtected?: boolean;
  children: ReactNode;
};

export const Page = ({ title, isProtected = false, children }: Props) => {
  const { currentAccountSection, goToPage, logout } = useNavigation();
  const authenticated = useToggle(false);

  useEffect(() => {
    track(title);
  });

  useEffect(() => {
    if (!isProtected) return;

    const refreshAndStoreToken = async (usedToken: string) => {
      try {
        const { email, token } = await thirdEarthApi.refreshToken(usedToken);
        OnboardingStorage.set({ email, token });

        authenticated.toggleOn();
      } catch (error) {
        console.error(error);

        logout();
      }
    };

    const usedToken = OnboardingStorage.get().token;

    if (!usedToken) goToPage('/');
    else refreshAndStoreToken(usedToken);
  }, [isProtected]);

  return (
    <>
      <NextHead>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta name="description" content={siteDescription} />
        <meta name="keywords" content={siteKeywords} />
        <meta name="author" content="Holium Hosting" />
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

        <meta name="theme-color" content={siteColor} />
        <meta name="msapplication-navbutton-color" content={siteColor} />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content={siteColor}
        />
      </NextHead>
      <Main>
        {isProtected && currentAccountSection ? (
          authenticated.isOn ? (
            children
          ) : (
            <AccountDialogSkeleton currentSection={currentAccountSection} />
          )
        ) : isProtected ? (
          authenticated.isOn ? (
            children
          ) : (
            <OnboardDialogSkeleton />
          )
        ) : (
          children
        )}
      </Main>
    </>
  );
};
