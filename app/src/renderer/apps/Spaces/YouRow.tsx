import styled from 'styled-components';
import { Avatar, Box, Row, Text, Flex } from '@holium/design-system';
import { ShipMobxType, useShipStore } from 'renderer/stores/ship.store';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';

const Wrapper = styled(Box)`
  position: absolute;
  z-index: 3;
  bottom: -12px;
  left: -12px;
  right: -12px;
  padding: 12px;
  height: 70px;
  width: calc(100% + 24px);
`;
interface SpaceRowProps {
  ship: ShipMobxType;
  space: SpaceModelType;
  selected?: boolean;
  onSelect: (spaceKey: string) => void;
}

export const YouRow = (props: SpaceRowProps) => {
  const { selected, onSelect, space } = props;
  const { ship } = useShipStore();

  if (!ship) return null;

  return (
    <Wrapper>
      <Row
        data-close-tray="true"
        style={{ width: '100%' }}
        className="realm-cursor-hover"
        selected={selected}
        onClick={() => {
          onSelect(space.path);
        }}
      >
        <Flex gap={8} alignItems="center" style={{ pointerEvents: 'none' }}>
          <Avatar
            simple
            borderRadiusOverride="6px"
            size={32}
            avatar={ship.avatar}
            patp={ship.patp}
            sigilColor={[ship.color || '#000000', 'white']}
          />
          <Flex ml={2} flexDirection="column">
            <Text.Custom fontSize={3} fontWeight={500}>
              {ship.nickname || ship.patp}
            </Text.Custom>
          </Flex>
        </Flex>
      </Row>
    </Wrapper>
  );
};
