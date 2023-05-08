import styled from 'styled-components';

import { Button, Flex, Icon, Text } from '@holium/design-system/general';

import { H1 } from '../components/H1';
import { HoveringCursors } from '../components/HoveringCursors';
import { Page } from '../components/Page';
import { DESKTOP_WIDTH, MOBILE_WIDTH, onClickGetRealm } from '../consts';

const GetRealmButton = styled(Button.Primary)`
  display: flex;
  font-size: 18px;
  padding: 10px 16px;
  border-radius: 999px;
  gap: 8px;
  margin-top: 16px;
`;

const HeroContainer = styled(Flex)`
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

const H1Container = styled(Flex)`
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

const P = styled(Text.Body)`
  font-size: 28px;

  @media (max-width: ${MOBILE_WIDTH}px) {
    font-size: 24px;
  }
`;

export default function HomePage() {
  return (
    <Page title="Holium">
      <HeroContainer>
        <H1Container>
          <H1 />
          <P>
            A home for communities, a platform for building new social
            experiences, and a crypto user's dream.
          </P>
          <GetRealmButton onClick={onClickGetRealm}>
            <Text.Body color="window" fontWeight={500}>
              Get Realm
            </Text.Body>
            <Icon name="ArrowRightLine" />
          </GetRealmButton>
        </H1Container>
        <Flex flex={1} justify="center" padding="16px">
          <HoveringCursors />
        </Flex>
      </HeroContainer>
    </Page>
  );
}
