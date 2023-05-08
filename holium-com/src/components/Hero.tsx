import { onClickGetRealm } from 'consts';

import { Flex, Icon, Text } from '@holium/design-system/general';

import { H1 } from './H1';
import { GetRealmButton, H1Container, HeroContainer, P } from './Hero.styles';
import { HoveringCursors } from './HoveringCursors';

export const Hero = () => (
  <HeroContainer>
    <H1Container>
      <H1 />
      <P>
        A home for communities, a platform for building new social experiences,
        and a crypto user's dream.
      </P>
      <GetRealmButton onClick={onClickGetRealm}>
        <Text.Body fontWeight={500} style={{ color: '#fff' }}>
          Get Realm
        </Text.Body>
        <Icon name="ArrowRightLine" />
      </GetRealmButton>
    </H1Container>
    <Flex flex={1} justify="center" padding="16px">
      <HoveringCursors />
    </Flex>
  </HeroContainer>
);
