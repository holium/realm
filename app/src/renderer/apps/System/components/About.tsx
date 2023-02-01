import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Card } from 'renderer/components';
import { lighten } from 'polished';
import { useServices } from 'renderer/logic/store';

const AboutPanelPresenter = () => {
  const { theme, ship, contacts } = useServices();

  const { windowColor, textColor, accentColor, inputColor } =
    theme.currentTheme;

  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);

  return (
    <Flex gap={12} flexDirection="column" p="12px" width="100%">
      <Text fontSize={7} fontWeight={600} mb={6}>
        About
      </Text>
      <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
      >
        <Text>Coming Soon</Text>
      </Card>
    </Flex>
  );
};

export const AboutPanel = observer(AboutPanelPresenter);
