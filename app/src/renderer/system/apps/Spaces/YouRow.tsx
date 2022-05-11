import { FC } from 'react';

import { Flex, Sigil, Text } from '../../../components';
import { useMst, useShip } from '../../../logic/store';

import { ShipModelType } from '~realm/ship/stores/ship';
import { SpaceRowStyle } from './SpaceRow';

type SpaceRowProps = { ship: ShipModelType; selected?: boolean };

export const YouRow: FC<SpaceRowProps> = (props: SpaceRowProps) => {
  const { selected } = props;
  const { ship } = useShip();
  const currentShip = ship!;
  const theme = currentShip!.theme;
  return (
    <SpaceRowStyle
      style={{ width: '100%' }}
      className="dynamic-mouse-hover"
      selected={selected}
      customBg={theme.dockColor}
    >
      <Sigil
        simple
        borderRadiusOverride="6px"
        size={32}
        avatar={currentShip.avatar}
        patp={currentShip.patp}
        color={[currentShip.color || '#000000', 'white']}
      />
      <Flex ml={2} flexDirection="column">
        <Text
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
          // color={selected ? 'initial' : 'initial'}
          fontSize={3}
          fontWeight={500}
          variant="body"
        >
          {currentShip.nickname || currentShip.patp}
        </Text>
      </Flex>
    </SpaceRowStyle>
  );
};
