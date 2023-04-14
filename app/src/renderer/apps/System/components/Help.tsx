import { observer } from 'mobx-react';
import { Flex, Text, Card, Anchor } from '@holium/design-system';

const HelpPanelPresenter = () => {
  return (
    <Flex flex={1} gap={12} flexDirection="column" p={3}>
      <Text.Custom fontSize={7} fontWeight={600} mb={6}>
        Help
      </Text.Custom>
      <Card p="20px" width="100%" elevation={0}>
        <Text.Custom>
          Reach out to{' '}
          <Anchor
            href="https://twitter.com/HoliumCorp"
            rel="noreferrer"
            target="_blank"
            // m={0}
          >
            @HoliumCorp
          </Anchor>{' '}
          on Twitter.
        </Text.Custom>
      </Card>
    </Flex>
  );
};

export const HelpPanel = observer(HelpPanelPresenter);
