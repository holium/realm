import styled from 'styled-components';

import { Button, Flex, Text } from '@holium/design-system/general';

import { DESKTOP_WIDTH, MOBILE_WIDTH } from '../consts';

export const GetRealmButton = styled(Button.Primary)`
  display: flex;
  font-size: 18px;
  padding: 4px 6px 4px 10px;
  border-radius: 999px;
  gap: 12px;
`;

export const RoundArrow = styled.div`
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    fill: var(--rlm-accent-color);
  }
`;

export const HeroContainer = styled(Flex)`
  width: 100%;
  max-width: ${DESKTOP_WIDTH}px;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  padding: 64px 16px 0px 16px;

  @media (max-width: ${DESKTOP_WIDTH}px) {
    flex-direction: column;
    text-align: center;
    max-width: 814px;
    width: 100%;
    max-height: 725px;

    svg {
      transform: scale(0.8) translateY(-64px);
    }
  }

  @media (max-width: 814px) {
    max-width: 100%;
  }

  @media (max-width: ${MOBILE_WIDTH}px) {
    #hovering-cursors {
      display: none;
    }
  }
`;

export const H1Container = styled(Flex)`
  flex: 1;
  flex-direction: column;
  align-self: flex-start;
  gap: 16px;

  @media (max-width: ${DESKTOP_WIDTH}px) {
    align-items: center;
    align-self: center;
    width: 100%;
  }
`;

export const P = styled(Text.Body)`
  font-size: 28px;
  width: 100%;
  max-width: 745px;

  @media (max-width: ${MOBILE_WIDTH}px) {
    font-size: 22px;
  }
`;
