import styled from 'styled-components';
import { Sigil } from 'renderer/components';
import { ShipModelType } from 'os/services/ship/models/ship';
import { useServices } from 'renderer/logic/store';
import { Box, Row, Text, Flex } from '@holium/design-system';

const Wrapper = styled(Box)`
  position: absolute;
  z-index: 3;
  bottom: -12px;
  left: -12px;
  right: -12px;
  padding: 12px;
  height: 70px;
  width: calc(100% + 24px);
  /* background-color: var(--rlm-window-bg); */
  /* backdrop-filter: blur(24px); */
`;
interface SpaceRowProps {
  colorTheme: string;
  ship: ShipModelType;
  selected?: boolean;
  onSelect: (spaceKey: string) => void;
}

export const YouRow = (props: SpaceRowProps) => {
  const { selected, onSelect } = props;
  const { ship } = useServices();
  const currentShip = ship!;

  return (
    <Wrapper>
      <Row
        data-close-tray="true"
        style={{ width: '100%' }}
        className="realm-cursor-hover"
        selected={selected}
        onClick={() => {
          onSelect(`/${ship!.patp}/our`);
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
            <Text.Custom fontSize={3} fontWeight={500}>
              {currentShip.nickname || currentShip.patp}
            </Text.Custom>
          </Flex>
        </Flex>
      </Row>
    </Wrapper>
  );
};
