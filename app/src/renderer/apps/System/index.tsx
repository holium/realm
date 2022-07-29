import React, { FC, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Card, Flex, Box, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { darken, lighten } from 'polished';

export const SystemApp: FC<any> = observer(() => {
  const { desktop } = useServices();
  const { windowColor } = desktop.theme;
  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);
  return (
    <React.Fragment>
      <Box overflowY="auto">
        <Flex gap={12} flexDirection="column" p="12px">
          <Card
            p="12px"
            width="100%"
            minHeight="240px"
            elevation="none"
            customBg={cardColor}
          >
            <Text opacity={0.7} fontSize={2} fontWeight={500}>
              Desktop
            </Text>
          </Card>
          <Card
            p="12px"
            width="100%"
            minHeight="182px"
            elevation="none"
            customBg={cardColor}
          >
            <Text opacity={0.7} fontSize={2} fontWeight={500}>
              Mouse
            </Text>
          </Card>
          <Card
            p="12px"
            width="100%"
            minHeight="300px"
            elevation="none"
            customBg={cardColor}
          >
            <Text opacity={0.7} fontSize={2} fontWeight={500}>
              Privacy
            </Text>
          </Card>
        </Flex>
      </Box>
    </React.Fragment>
  );
});
