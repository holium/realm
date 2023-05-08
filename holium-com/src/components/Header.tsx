import { Button, Text } from '@holium/design-system/general';

import { onClickGetRealm, onClickLogin } from '../consts';
import {
  HeaderContainer,
  HeaderCTAs,
  HeaderMenuLink,
  HeaderNavigation,
  UnstyledLink,
} from './Header.styles';
import { Holium } from './Holium';

export const Header = () => (
  <HeaderContainer>
    <UnstyledLink href="/" id="holium-logo">
      <Holium />
    </UnstyledLink>
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
      <Button.Secondary onClick={onClickLogin}>
        <Text.Body color="text" fontWeight={500}>
          Login
        </Text.Body>
      </Button.Secondary>
      <Button.Primary onClick={onClickGetRealm}>
        <Text.Body fontWeight={500} style={{ color: '#fff' }}>
          Get Realm
        </Text.Body>
      </Button.Primary>
    </HeaderCTAs>
  </HeaderContainer>
);
