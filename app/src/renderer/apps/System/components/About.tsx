import React, { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Card} from 'renderer/components';
import { lighten } from 'polished';
import { useServices } from 'renderer/logic/store';


export const AboutPanel: FC<any> = observer(() => {
  const { desktop, ship, contacts } = useServices();

  const { windowColor, textColor, accentColor, inputColor } = desktop.theme;

  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);

  return (

    <Flex gap={12} flexDirection="column" p="12px" width='100%'>

      <Text
        fontSize={8}
        fontWeight={600}
      >
        Account
      </Text>

    
    <Text opacity={0.7} fontSize={3} fontWeight={500}>
      Profile
    </Text>
    <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
      >
        <Text>
          Coming Soon
        </Text>

    </Card>
    </Flex>
  )
})