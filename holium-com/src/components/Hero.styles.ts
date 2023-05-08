import styled from 'styled-components';

import { Button, Flex, Text } from '@holium/design-system/general';

import { DESKTOP_WIDTH, MOBILE_WIDTH } from '../consts';

export const GetRealmButton = styled(Button.Primary)`
  display: flex;
  font-size: 18px;
  padding: 10px 16px;
  border-radius: 999px;
  gap: 8px;
  margin-top: 16px;
`;

export const HeroContainer = styled(Flex)`
  width: 100%;
  max-width: ${DESKTOP_WIDTH}px;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${DESKTOP_WIDTH}px) {
    flex-direction: column;
    text-align: center;
    max-width: 814px;
  }

  @media (max-width: 814px) {
    max-width: 100%;
  }
`;

export const H1Container = styled(Flex)`
  flex: 1;
  flex-direction: column;
  align-self: flex-start;
  gap: 16px;
  padding: 32px 16px;

  @media (max-width: ${DESKTOP_WIDTH}px) {
    align-items: center;
    align-self: center;
    width: 100%;
  }
`;

export const P = styled(Text.Body)`
  font-size: 28px;

  @media (max-width: ${MOBILE_WIDTH}px) {
    font-size: 24px;
  }
`;
