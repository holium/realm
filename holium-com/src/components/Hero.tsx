import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/router';

import { Flex, Icon, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { GET_REALM_HREF } from '../consts';
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
  const router = useRouter();
  const [email, setEmail] = useState('');

  const onChangeEmail = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail((e.target as HTMLInputElement).value);
  };

  return (
    <HeroContainer>
      <H1Container>
        <H1 className="hideonmobile" />
        <H1Text className="hideondesktop">
          Realm is the future of P2P networks
        </H1Text>
        <P>
          A home for communities, a platform for building new social
          experiences, and a crypto user's dream.
        </P>
        <Flex
          as="form"
          alignItems="center"
          flexDirection="column"
          gap="8px"
          maxWidth="320px"
          marginTop="16px"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`${GET_REALM_HREF}?email=${email}`);
          }}
        >
          <TextInput
            id="email"
            name="email"
            placeholder="Enter your email"
            type="email"
            width="100%"
            value={email}
            onChange={onChangeEmail}
            style={{
              borderRadius: 999,
              padding: '8px 8px 8px 12px',
            }}
            rightAdornment={
              <GetRealmButton type="submit">
                <Text.Body fontWeight={500} style={{ color: '#fff' }}>
                  Get Realm
                </Text.Body>
                <RoundArrow>
                  <Icon name="ArrowRightLine" />
                </RoundArrow>
              </GetRealmButton>
            }
          />
          <Text.Body
            as="label"
            htmlFor="email"
            style={{
              opacity: 0.85,
              fontSize: '12px',
              width: '100%',
              textAlign: 'left',
            }}
          >
            By entering your email, you agree to receive updates via email
            regarding Realm access.
          </Text.Body>
        </Flex>
      </H1Container>
      <Flex flex={1} width="100%" justify="center" padding="16px">
        <HoveringCursors className="hideonmobile" />
        <HoveringCursorsStatic className="hideondesktop" />
      </Flex>
    </HeroContainer>
  );
};
