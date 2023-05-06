import styled from 'styled-components';

import { Button, Flex, Icon, Text } from '@holium/design-system/general';

import { H1 } from '../components/H1';
import { Page } from '../components/Page';

const GetRealmButton = styled(Button.Primary)`
  display: flex;
  font-size: 18px;
  padding: 10px 16px;
  border-radius: 999px;
  gap: 8px;
`;

export default function CreateAccount() {
  return (
    <Page title="Holium">
      <Flex width="100%" maxWidth="1200px" justifyContent="flex-start">
        <Flex
          flexDirection="column"
          alignSelf="flex-start"
          maxWidth="700px"
          gap="16px"
          padding="16px"
        >
          <H1 />
          <Text.Body fontSize={28}>
            A home for communities, a platform for building new social
            experiences, and a crypto user's dream.
          </Text.Body>
          <GetRealmButton>
            Get Realm
            <Icon name="ArrowRightLine" fill="accent" />
          </GetRealmButton>
        </Flex>
      </Flex>
    </Page>
  );
}
