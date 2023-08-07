import { useRouter } from 'next/router';

import { Button, Text } from '@holium/design-system/general';

import { Holium } from '../../public/Holium';
import { hostingHrefs } from '../consts';
import { ConnectWalletButton } from './ConnectWalletButton';
import {
  HeaderContainer,
  HeaderCTAs,
  HeaderMenuLink,
  HeaderNavigation,
} from './Header.styles';
import { UnstyledNextLink } from './UnstyledNextLink';

export const Header = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <HeaderContainer>
      <UnstyledNextLink href="/" id="holium-logo">
        <Holium />
      </UnstyledNextLink>
      <HeaderNavigation>
        <ul>
          <li>
            <HeaderMenuLink href="/" current={currentPath === '/'}>
              Realm
            </HeaderMenuLink>
          </li>
          <li>
            <HeaderMenuLink
              target="_blank"
              rel="noreferrer"
              href="https://docs.holium.com"
            >
              Documentation
            </HeaderMenuLink>
          </li>
          <li>
            <HeaderMenuLink href="/about" current={currentPath === '/about'}>
              About
            </HeaderMenuLink>
          </li>
        </ul>
      </HeaderNavigation>
      <HeaderCTAs>
        <UnstyledNextLink href={hostingHrefs.LOGIN}>
          <Button.Secondary>
            <Text.Body color="text" fontWeight={500}>
              Login with Email
            </Text.Body>
          </Button.Secondary>
        </UnstyledNextLink>
        <ConnectWalletButton />
      </HeaderCTAs>
    </HeaderContainer>
  );
};
