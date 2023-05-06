import { Button } from '@holium/design-system/general';

import {
  HeaderContainer,
  HeaderCTAs,
  HeaderMenuLink,
  HeaderNavigation,
  UnstyledLink,
} from './Header.styles';

export const Header = () => {
  const onClickLogin = () => {
    window.location.href = 'https://hosting.holium.com/login';
  };

  return (
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
        <Button.Primary>Get Realm</Button.Primary>
      </HeaderCTAs>
    </HeaderContainer>
  );
};
