import { Avatar, Box, Flex, Row, Text } from '@holium/design-system';
import { ShipModelType } from 'os/services/ship/models/ship';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { useServices } from 'renderer/logic/store';
import styled from 'styled-components';

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
  colorTheme: string;
  ship: ShipModelType;
  space: SpaceModelType;
  selected?: boolean;
  onSelect: (spaceKey: string) => void;
}

export const YouRow = (props: SpaceRowProps) => {
  const { selected, onSelect, space } = props;
  const { ship } = useServices();

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
