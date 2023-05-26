import Link from 'next/link';

import { Button, Flex, Text } from '@holium/design-system/general';
import { defaultTheme } from '@holium/shared';

import { InviteCardContainer } from '../components/InviteCard';
import { GlobalStyle } from '../lib/GlobalStyle';

const FourOhFourPage = () => {
  return (
    <Flex
      width="100%"
      height="100vh"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <GlobalStyle theme={defaultTheme} />
      <InviteCardContainer>
        <Text.H1 style={{ fontSize: '24px' }}>Invite not found</Text.H1>
        <Link href="https://holium.com">
          <Button.Primary
            height="40px"
            width="216px"
            alignItems="center"
            justifyContent="center"
            borderRadius="10px"
            style={{ fontWeight: 500 }}
          >
            To holium.com
          </Button.Primary>
        </Link>
      </InviteCardContainer>
    </Flex>
  );
};

export default FourOhFourPage;
