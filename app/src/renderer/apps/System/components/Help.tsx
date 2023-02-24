import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Card, Anchor } from 'renderer/components';
import { lighten } from 'polished';
import { useServices } from 'renderer/logic/store';

const HelpPanelPresenter = () => {
  const { theme } = useServices();
  const { windowColor } = theme.currentTheme;
  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);

  return (
    <Flex flex={1} gap={12} flexDirection="column" p={3}>
      <Text fontSize={7} fontWeight={600} mb={6}>
        Help
      </Text>
      <Card p="20px" width="100%" elevation="none" customBg={cardColor}>
        <Text>
          Reach out to{' '}
          <Anchor
            href="https://twitter.com/HoliumCorp"
            rel="noreferrer"
            target="_blank"
            m={0}
          >
            @HoliumCorp
          </Anchor>{' '}
          on Twitter.
        </Text>
      </Card>
    </Flex>
  );
};

export const HelpPanel = observer(HelpPanelPresenter);
