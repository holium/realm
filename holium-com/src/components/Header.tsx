import { Button, Text } from '@holium/design-system/general';

import { Holium } from '../../public/Holium';
import { GET_REALM_HREF, LOGIN_HREF } from '../consts';
import {
  HeaderContainer,
  HeaderCTAs,
  HeaderMenuLink,
  HeaderNavigation,
} from './Header.styles';
import { UnstyledNextLink } from './UnstyledNextLink';

export const Header = () => (
  <HeaderContainer>
    <UnstyledNextLink href="/" id="holium-logo">
      <Holium />
    </UnstyledNextLink>
    <HeaderNavigation>
      <ul>
        <li>
          <HeaderMenuLink href="/" current>
            Realm
          </HeaderMenuLink>
        </li>
        <li>
          <HeaderMenuLink
            target="_blank"
            rel="noreferrer"
            href="https://holium.gitbook.io/tomedb/"
          >
            Docs
          </HeaderMenuLink>
        </li>
        <li>
          <HeaderMenuLink
            target="_blank"
            rel="noreferrer"
            href="https://holium.gitbook.io/realm/"
          >
            Support
          </HeaderMenuLink>
        </li>
      </ul>
    </HeaderNavigation>
    <HeaderCTAs>
      <UnstyledNextLink href={LOGIN_HREF}>
        <Button.Secondary>
          <Text.Body color="text" fontWeight={500}>
            Login
          </Text.Body>
        </Button.Secondary>
      </UnstyledNextLink>
      <UnstyledNextLink href={GET_REALM_HREF}>
        <Button.Primary
          display="flex"
          width="90px"
          justifyContent="center"
          flexWrap="nowrap"
        >
          <Text.Body fontWeight={500} style={{ color: '#fff' }}>
            Get Realm
          </Text.Body>
        </Button.Primary>
      </UnstyledNextLink>
    </HeaderCTAs>
  </HeaderContainer>
);
