import { ChangeEvent, useState } from 'react';

import { Flex, Icon, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

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
import { UnstyledNextLink } from './UnstyledNextLink';

export const Hero = () => {
  const [email, setEmail] = useState('');

  const validEmail = useToggle(false);

  const onChangeEmail = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = (e.target as HTMLInputElement).value;
    setEmail(newValue);

    const validEmailRegex = /\S+@\S+\.\S+/;
    validEmail.setToggle(validEmailRegex.test(newValue));
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
          flexDirection="column"
          alignItems="center"
          maxWidth="320px"
          gap="16px"
          marginTop="16px"
          as="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (validEmail.isOn) {
              window.location.href = `${GET_REALM_HREF}?email=${email}`;
            }
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
              <UnstyledNextLink
                href={
                  validEmail.isOn ? `${GET_REALM_HREF}?email=${email}` : '#'
                }
              >
                <GetRealmButton type="button">
                  <Text.Body fontWeight={500} style={{ color: '#fff' }}>
                    Get Realm
                  </Text.Body>
                  <RoundArrow>
                    <Icon name="ArrowRightLine" />
                  </RoundArrow>
                </GetRealmButton>
              </UnstyledNextLink>
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
