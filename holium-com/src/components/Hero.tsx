import { useEffect, useState } from 'react';

import { Flex, Icon, Text } from '@holium/design-system/general';

import { GET_REALM_HREF, MOBILE_WIDTH } from '../consts';
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
import { UnstyledNextLink } from './UnstyledNextLink';

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
        <UnstyledNextLink href={GET_REALM_HREF}>
          <GetRealmButton>
            <Text.Body fontWeight={500} style={{ color: '#fff' }}>
              Get Realm
            </Text.Body>
            <RoundArrow>
              <Icon name="ArrowRightLine" />
            </RoundArrow>
          </GetRealmButton>
        </UnstyledNextLink>
      </H1Container>
      <Flex flex={1} width="100%" justify="center" padding="16px">
        {isMobile ? <HoveringCursorsStatic /> : <HoveringCursors />}
      </Flex>
    </HeroContainer>
  );
};
