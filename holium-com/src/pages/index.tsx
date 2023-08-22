import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

import { CourierWebButton } from 'components/courier/CourierWebButton';
import { Page } from 'components/Page';

import { IOSButton } from '../components/courier/IOSButton';

const HeroContainer = styled(Flex)`
  width: 100%;
  max-width: 1200px;
  padding: 0 16px;
  align-items: center;
  justify-content: flex-start;
`;

const TextContainer = styled(Flex)`
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 770px;

  @media screen and (max-width: 1200px) {
    max-width: 560px;
  }
`;

const ButtonsContainer = styled(Flex)`
  gap: 12px;

  @media screen and (max-width: 582px) {
    flex-direction: column;
  }
`;

const H1 = styled(Text.H1)`
  font-size: 66px;
  font-weight: 500;
  line-height: 1.2;
  color: rgba(var(--rlm-text-rgba));

  @media screen and (max-width: 1200px) {
    font-size: 48px;
  }
`;

const Body = styled(Text.Body)`
  font-size: 32px;
  font-weight: 300;
  line-height: 1.6;
  color: rgba(var(--rlm-text-rgba), 0.7);

  @media screen and (max-width: 1200px) {
    font-size: 24px;
  }
`;

const MobileGraphic = styled.img`
  position: fixed;
  width: auto;
  height: 125%;
  object-fit: contain;
  bottom: 0;
  right: 0;
  transform: translate(40%, 30%);
  z-index: -1;

  @media screen and (max-width: 1000px) {
    display: none;
  }
`;

export default function HomePage() {
  useEffect(() => {
    track('Home Page');
  }, []);

  return (
    <Page
      title="Secure Conversations, Your Way."
      wallpaper={false}
      forcedSpace="realm-forerunners"
      body={
        <HeroContainer>
          <Flex flexDirection="column" gap="60px">
            <TextContainer>
              <H1>Secure Conversations, Your Way.</H1>
              <Body>
                Leveraging end-to-end encryption, peer-to-peer nodes, and the
                ability to self-host, Courier enables truly private messaging.
              </Body>
            </TextContainer>
            <ButtonsContainer>
              <IOSButton subLabel="MacOS" label="Desktop" />
              <IOSButton subLabel="iOS" label="App Store" />
              <CourierWebButton />
            </ButtonsContainer>
          </Flex>
          <MobileGraphic src="/graphics/phone-mock.png" />
        </HeroContainer>
      }
    />
  );
}
