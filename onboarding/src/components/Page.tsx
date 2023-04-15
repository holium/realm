import { ReactNode, useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { useToggle } from '@holium/design-system/util';
import { AccountDialogSkeleton, OnboardDialogSkeleton } from '@holium/shared';
import NextHead from 'next/head';
import styled from 'styled-components';

import { api } from '../util/api';
import { useNavigation } from '../util/useNavigation';

const Main = styled.main`
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

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

    const refreshAndStoreToken = async (token: string) => {
      try {
        const response = await api.refreshToken(token);
        localStorage.setItem('email', response.email);
        localStorage.setItem('token', response.token);
        authenticated.toggleOn();
      } catch (error) {
        console.error(error);
        logout();
      }
    };

    const token = localStorage.getItem('token');

    if (!token) goToPage('/');
    else refreshAndStoreToken(token);
  }, [isProtected]);

  return (
    <>
      <NextHead>
        <title>{title}</title>
        <meta name="description" content="Get on the Holium network." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
