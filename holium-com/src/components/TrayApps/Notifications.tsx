import {
  Avatar,
  Button,
  Flex,
  Icon,
  Text,
} from '@holium/design-system/general';
import { TrayApp } from '@holium/design-system/os';

import { SpaceKeys } from '../../types';

type ChatAppProps = {
  isOpen: boolean;
  coords: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  currentSpace: SpaceKeys;
  setIsOpen: (isOpen: boolean) => void;
  setCurrentSpace: (space: SpaceKeys) => void;
};

const position = 'top-left';
const anchorOffset = { x: -4, y: 24 };
const dimensions = { height: 370, width: 400 };

export const notifConfig = {
  position,
  anchorOffset,
  dimensions,
};

export const NotificationApp = ({
  isOpen = false,
  setIsOpen,
  coords,
}: ChatAppProps) => {
  return (
    <TrayApp
      id="notifications"
      isOpen={isOpen}
      coords={coords}
      closeTray={() => {
        setIsOpen(false);
      }}
    >
      <Flex p={1} flexDirection="column">
        <Flex flexDirection="row" alignItems="center">
          <Text.Custom fontWeight={500} fontSize="17px">
            Notifications
          </Text.Custom>
          <Text.Custom ml={2} fontSize={2} opacity={0.5}>
            0
          </Text.Custom>
        </Flex>
        <Flex mt={3} flexDirection="column">
          <Text.Custom fontWeight={400} opacity={0.8} fontSize={2}>
            Unseen
          </Text.Custom>
          <Flex
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height={70}
          >
            <Text.Custom
              textAlign="center"
              justifyContent="center"
              verticalAlign="middle"
              ml={2}
              fontSize={2}
              opacity={0.3}
            >
              No notifications
            </Text.Custom>
          </Flex>
        </Flex>
        <Flex mt={3} flexDirection="column">
          <Text.Custom fontWeight={400} opacity={0.8} fontSize={2}>
            Seen
          </Text.Custom>
          <Flex
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height={100}
          >
            <Text.Custom
              textAlign="center"
              justifyContent="center"
              verticalAlign="middle"
              ml={2}
              fontSize={2}
              opacity={0.3}
            >
              No notifications
            </Text.Custom>
          </Flex>
        </Flex>
        <Flex
          mt="50px"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Flex gap={8} alignItems="center">
            <Avatar
              simple
              clickable
              patp="~lomder-librun"
              size={26}
              borderRadiusOverride="4px"
              sigilColor={['#F08735', '#FFF']}
            />
            <Text.Custom fontWeight={500} fontSize={2}>
              ~lomder-librun
            </Text.Custom>
          </Flex>
          <Flex gap={12} alignItems="center">
            <Button.IconButton size={24}>
              <Icon name="Lock" size={20} opacity={0.5} />
            </Button.IconButton>
            <Button.IconButton size={24}>
              <Icon name="Settings" size={20} opacity={0.5} />
            </Button.IconButton>
          </Flex>
        </Flex>
      </Flex>
    </TrayApp>
  );
};
