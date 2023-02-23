import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Card } from 'renderer/components';
import { lighten } from 'polished';
import { useServices } from 'renderer/logic/store';

const AboutPanelPresenter = () => {
  const { theme } = useServices();
  const { windowColor } = theme.currentTheme;
  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);

  return (
    <Flex flex={1} gap={12} flexDirection="column" p={3}>
      <Text fontSize={7} fontWeight={600} mb={6}>
        About
      </Text>
      <Card p="20px" elevation="none" customBg={cardColor}>
        <Text>Coming Soon</Text>
      </Card>
    </Flex>
  );
};

export const AboutPanel = observer(AboutPanelPresenter);
