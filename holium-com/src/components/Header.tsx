import { useRouter } from 'next/router';

import { Button, Text } from '@holium/design-system/general';

import { Holium } from '../../public/Holium';
import { hostingHrefs } from '../constants';
import { ConnectWalletButton } from './courier/ConnectWalletButton';
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

  const routes = [
    {
      href: '/',
      text: 'Home',
    },
    {
      href: '/realm',
      text: 'Realm',
    },
    {
      href: 'https://docs.holium.com',
      text: 'Docs',
    },
    {
      href: '/about',
      text: 'About',
    },
  ];

  return (
    <HeaderContainer>
      <UnstyledNextLink href="/" id="holium-logo">
        <Holium />
      </UnstyledNextLink>
      <HeaderNavigation>
        <ul>
          {routes.map(({ href, text }) => (
            <li key={href}>
              <HeaderMenuLink href={href} current={currentPath === href}>
                {text}
              </HeaderMenuLink>
            </li>
          ))}
        </ul>
      </HeaderNavigation>
      <HeaderCTAs>
        {currentPath === '/realm' ? (
          <UnstyledNextLink href={hostingHrefs.LOGIN}>
            <Button.Secondary>
              <Text.Body color="text" fontWeight={500}>
                Get Realm
              </Text.Body>
            </Button.Secondary>
          </UnstyledNextLink>
        ) : (
          <>
            {/* <UnstyledNextLink href={hostingHrefs.LOGIN}>
              <Button.Secondary>
                <Text.Body color="text" fontWeight={500}>
                  Login with Email
                </Text.Body>
              </Button.Secondary>
            </UnstyledNextLink> */}
            <ConnectWalletButton />
          </>
        )}
      </HeaderCTAs>
    </HeaderContainer>
  );
};
