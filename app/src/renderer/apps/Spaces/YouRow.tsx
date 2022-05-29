import { FC, useMemo } from 'react';

import { Flex, Sigil, Text } from 'renderer/components';
import { useShip, useMst } from 'renderer/logic/store';
import { ShipModelType } from 'core/ship/stores/ship';
import { SpaceRowStyle } from './SpaceRow';

type SpaceRowProps = {
  ship: ShipModelType;
  selected?: boolean;
  onSelect: (spaceKey: string) => void;
};

export const YouRow: FC<SpaceRowProps> = (props: SpaceRowProps) => {
  const { selected, onSelect } = props;
  const { ship } = useShip();
  const { themeStore } = useMst();
  const currentShip = ship!;
  const theme = useMemo(() => themeStore.theme, [themeStore.theme]);
  return (
    <SpaceRowStyle
      data-close-tray="true"
      style={{ width: '100%' }}
      className="realm-cursor-hover"
      selected={selected}
      customBg={theme.dockColor}
      onClick={() => {
        onSelect(ship!.patp);
      }}
    >
      <Flex gap={8} alignItems="center" style={{ pointerEvents: 'none' }}>
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
            fontSize={3}
            fontWeight={500}
            variant="body"
          >
            {currentShip.nickname || currentShip.patp}
          </Text>
        </Flex>
      </Flex>
    </SpaceRowStyle>
  );
};
