import { ReactNode } from 'react';
import NextHead from 'next/head';
import styled from 'styled-components';

import { Footer } from './Footer';
import { Header } from './Header';

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

type Props = {
  title: string;
  children: ReactNode;
};

export const Page = ({ title, children }: Props) => {
  return (
    <>
      <NextHead>
        <title>{title}</title>
        <meta name="description" content="Holium" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </NextHead>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </>
  );
};
