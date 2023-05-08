import { ReactNode } from 'react';
import NextHead from 'next/head';

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
      {children}
    </>
  );
};
