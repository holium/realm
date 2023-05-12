import { useEffect, useState } from 'react';
import { MOBILE_WIDTH, onClickGetRealm } from 'consts';

import { Flex, Icon, Text } from '@holium/design-system/general';

import { H1, H1Text } from './H1';
import {
  GetRealmButton,
  H1Container,
  HeroContainer,
  P,
  RoundArrow,
} from './Hero.styles';
import { HoveringCursors } from './HoveringCursors';
import { HoveringCursorsStatic } from './HovertingCursorsStatic';

export const Hero = () => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < MOBILE_WIDTH);
  }, []);

  return (
    <HeroContainer>
      <H1Container>
        {isMobile ? (
          <H1Text>Realm is the future of P2P networks</H1Text>
        ) : (
          <H1 />
        )}
        <P>
          A home for communities, a platform for building new social
          experiences, and a crypto user's dream.
        </P>
        <GetRealmButton onClick={onClickGetRealm}>
          <Text.Body fontWeight={500} style={{ color: '#fff' }}>
            Get Realm
          </Text.Body>
          <RoundArrow>
            <Icon name="ArrowRightLine" />
          </RoundArrow>
        </GetRealmButton>
      </H1Container>
      <Flex flex={1} width="100%" justify="center" padding="16px">
        {isMobile ? <HoveringCursorsStatic /> : <HoveringCursors />}
      </Flex>
    </HeroContainer>
  );
};
