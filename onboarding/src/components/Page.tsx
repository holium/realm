import { useEffect, ReactNode } from 'react';
import { track } from '@amplitude/analytics-browser';
import NextHead from 'next/head';
import { Rubik } from 'next/font/google';
import styled from 'styled-components';
import { useToggle } from '@holium/design-system';
import { api } from '../util/api';
import { useNavigation } from '../util/useNavigation';

const Main = styled.main`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const rubik = Rubik({ subsets: ['latin'], weight: 'variable' });

type Props = {
  title: string;
  isProtected?: boolean;
  children: ReactNode;
};

export const Page = ({ title, isProtected = false, children }: Props) => {
  const { goToPage, logout } = useNavigation();
  const authenticated = useToggle(false);

  useEffect(() => {
    track(title);
  });

  useEffect(() => {
    if (!isProtected) return;

    const refreshAndStoreToken = async (token: string) => {
      try {
        const response = await api.refreshToken(token);
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
      <Main className={rubik.className}>
        {isProtected ? (authenticated.isOn ? children : null) : children}
      </Main>
    </>
  );
};
