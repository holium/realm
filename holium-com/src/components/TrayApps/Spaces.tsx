import { motion } from 'framer-motion';

import { Button, Flex, Icon, Row, Text } from '@holium/design-system/general';
import { TrayApp } from '@holium/design-system/os';

import { useSpace } from 'components/SpaceContext';

import { spaces } from '../../spaces';
import { SpaceKeys } from '../../types';

type SpacesAppProps = {
  isOpen: boolean;
  coords: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  closeTray: () => void;
};

const position = 'top-right';
const anchorOffset = { x: 4, y: 16 };
// const anchorOffset = { x: 0, y: 0 }
const dimensions = { height: 500, width: 380 };

export const spaceConfig = {
  position,
  anchorOffset,
  dimensions,
};

export const SpacesApp = ({
  isOpen = false,
  coords,
  closeTray,
}: SpacesAppProps) => {
  const { space, setSpace } = useSpace();

  return (
    <TrayApp id="spaces" isOpen={isOpen} coords={coords} closeTray={closeTray}>
      <Flex style={{ flexDirection: 'column' }}>
        <Flex align="center" justify="space-between" mb={2}>
          <Text.Custom
            pl={1}
            opacity={0.7}
            style={{ textTransform: 'uppercase' }}
          >
            Spaces
          </Text.Custom>
          <Flex gap={8}>
            <Button.IconButton
              style={{ pointerEvents: 'none' }}
              width={26}
              height={26}
            >
              <Icon name="Search" size={20} opacity={0.7} />
            </Button.IconButton>
            <Button.IconButton
              style={{ pointerEvents: 'none' }}
              width={26}
              height={26}
            >
              <Icon name="Plus" size={24} opacity={0.7} />
            </Button.IconButton>
          </Flex>
        </Flex>
        <Flex
          className="no-scrollbar"
          height={500 - 46}
          gap={4}
          style={{
            flexDirection: 'column',
            overflowY: 'scroll',
            overflowX: 'hidden',
          }}
        >
          {Object.values(spaces).map((s, index) => (
            <Row
              key={`${s.id}-s-row`}
              data-close-tray="true"
              selected={s.id === space}
              onClick={() => setSpace(s.id as SpaceKeys)}
              mb={index === Object.values(spaces).length - 1 ? 2 : 0}
            >
              <Flex gap={8} align="flex-start" pointerEvents="none">
                <motion.img
                  style={{
                    borderRadius: 6,
                    pointerEvents: 'none',
                    objectFit: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  height="32px"
                  width="32px"
                  src={s.picture}
                />
                <Flex style={{ flexDirection: 'column' }} pointerEvents="none">
                  <Text.Custom
                    fontWeight={500}
                    fontSize={2}
                    pointerEvents="none"
                  >
                    {s.title}
                  </Text.Custom>
                  <Flex align="center" gap={4} pointerEvents="none">
                    <Icon
                      name="Members"
                      size={14}
                      opacity={0.7}
                      pointerEvents="none"
                    />
                    <Text.Custom opacity={0.6} pointerEvents="none">
                      {s.members} members
                    </Text.Custom>
                  </Flex>
                </Flex>
              </Flex>
            </Row>
          ))}
        </Flex>
      </Flex>
    </TrayApp>
  );
};
