import React, { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Card, RadioGroup, Checkbox} from 'renderer/components';
import { lighten } from 'polished';
import { useServices } from 'renderer/logic/store';


export const SystemPanel: FC<any> = observer(() => {

  const { desktop, ship, contacts } = useServices();

  const { windowColor, textColor, accentColor, inputColor } = desktop.theme;

  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);

    
  type mouseOptionType = 'system' | 'realm' ;

  const [mouseOption, setMouseOption] =
  useState<mouseOptionType>('realm');

  return (

    <Flex gap={12}  flexDirection="column" p="12px" width='100%'>

      <Text
        fontSize={8}
        fontWeight={600}
        mb={6}
      >
        System
      </Text>

    {/*     
    <Text opacity={0.7} fontSize={3} fontWeight={500}>
      INTERFACE
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

    </Card> */}

    <Text opacity={0.7} fontSize={3} fontWeight={500}>
      MOUSE
    </Text>
    <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
      >
        <Text mb={4}>
          Cursor Type:
        </Text>
        <Flex >
            {/* menu / list  */}
            <RadioGroup
                customBg={windowColor}
                textColor={textColor}
                selected={mouseOption}
                options={[
                  { label: 'System', value: 'system' },
                  { label: 'Realm', value: 'realm' },
                ]}
                onClick={(value: mouseOptionType) => {
                  setMouseOption(value);
                }}
              />
              
          </Flex>
        <Flex mt={6} gap={6} justifyContent="flex-start">
          {/* TODO there is no way to set an initial value to this checkbox component */}
          <Checkbox defaultValue='' mr={16} />
          <Text>Use profile color for cursor</Text>
        </Flex>

    </Card>
    <Text opacity={0.7} fontSize={3} fontWeight={500} mt={2}>
      SOUNDS
    </Text>
    <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
      >
       <Flex mt={2} justifyContent="flex-start">
          <Checkbox mr={16} defaultValue="false" />
          <Flex flexDirection='column' justifyContent='center' gap={4}>
        <Text>Disable OS System Sounds</Text>
          <Text fontWeight='200'>These sounds play on login, logout, etc.</Text>
          </Flex>
        </Flex>
    </Card>
    </Flex>
  )
})