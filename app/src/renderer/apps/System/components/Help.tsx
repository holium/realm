import { observer } from 'mobx-react';
import { Flex, Text, Card, Anchor } from '@holium/design-system';

const HelpPanelPresenter = () => {
  return (
    <Flex flex={1} flexDirection="column" p={3}>
      <Text.Custom fontSize={7} fontWeight={600} mb={3}>
        Help
      </Text.Custom>
      <Card p="20px" width="100%" elevation={0}>
        <Text.Custom fontSize={2}>
          Send a DM to{' '}
          <Anchor
            href="https://twitter.com/HoliumCorp"
            rel="noreferrer"
            target="_blank"
            // m={0}
          >
            @HoliumCorp
          </Anchor>{' '}
          or check out our{' '}
          <Anchor
            href="https://holium.gitbook.io/realm"
            rel="noreferrer"
            target="_blank"
            // m={0}
          >
            documentation
          </Anchor>
          . We are usually pretty quick to respond.
        </Text.Custom>
      </Card>
    </Flex>
  );
};

export const HelpPanel = observer(HelpPanelPresenter);
