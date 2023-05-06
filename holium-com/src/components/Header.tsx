import { Button } from '@holium/design-system/general';

import { onClickGetRealm, onClickLogin } from '../consts';
import {
  HeaderContainer,
  HeaderCTAs,
  HeaderMenuLink,
  HeaderNavigation,
  UnstyledLink,
} from './Header.styles';

export const Header = () => (
  <HeaderContainer>
    <UnstyledLink href="/" id="holium-logo">
      <img src="/wordmark.svg" alt="Holium" />
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
      <Button.Secondary onClick={onClickLogin}>Login</Button.Secondary>
      <Button.Primary onClick={onClickGetRealm}>Get Realm</Button.Primary>
    </HeaderCTAs>
  </HeaderContainer>
);
