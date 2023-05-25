import { useEffect } from 'react';
import { motion } from 'framer-motion';

import { Avatar, Flex, Icon, Text } from '@holium/design-system/general';
import {
  BarButton,
  BarStyle,
  HoliumButton,
  RoomsDock,
} from '@holium/design-system/os';

import { rooms, spaces } from '../spaces';
import { SpaceKeys, TrayAppType } from '../types';
import { SelectedSpaceRow } from './SelectedSpace';
import { chatConfig } from './TrayApps/Chat';
import { notifConfig } from './TrayApps/Notifications';
import { roomConfig } from './TrayApps/Rooms';
import { spaceConfig } from './TrayApps/Spaces';
import { walletConfig } from './TrayApps/Wallet';

type SystemBarProps = {
  currentSpace: SpaceKeys;
  setCurrentApp: (app: TrayAppType) => void;
};

export const calculateAnchorPointById = (
  appId: string,
  anchorOffset: any,
  position: any,
  dimensions: any
) => {
  const el = document.getElementById(`${appId}-icon`);
  if (!el) return null;

  const {
    left: buttonLeft,
    width: buttonWidth,
    height,
  } = el?.getBoundingClientRect();
  const buttonTop = el.offsetHeight + height;
  let style: any = {};

  let left = null;
  if (position.includes('-left')) {
    left = Math.round(
      buttonLeft - dimensions.width + buttonWidth - anchorOffset.x
    );
    style = { ...style, left };
  }
  if (position.includes('-right')) {
    left = Math.round(buttonLeft - anchorOffset.x);
    style = { ...style, left };
  }

  if (!position.includes('-right') && !position.includes('-left')) {
    left = Math.round(buttonLeft - anchorOffset.x - dimensions.width / 2);
    style = { ...style, left };
  }
  const bottom = Math.round(buttonTop - height + anchorOffset.y);
  style = { ...style, bottom };
  return style;
};

export const SystemBar = ({ currentSpace, setCurrentApp }: SystemBarProps) => {
  const currentRoom = rooms[currentSpace];

  useEffect(() => {
    // Preload all space pictures.
    Object.values(spaces).forEach((space) => {
      const img = new Image();
      img.src = space.picture;
    });
  }, []);

  return (
    <Flex flex={1} position="relative" width="auto" gap={8}>
      <BarStyle style={{ justifyContent: 'center' }} width={40}>
        <HoliumButton />
      </BarStyle>
      <BarStyle
        flex={1}
        px={1}
        pr={2}
        style={{ justifyContent: 'space-between' }}
      >
        <SelectedSpaceRow
          gap={8}
          id="spaces-icon"
          whileTap={{ scale: 0.975 }}
          transition={{ scale: 0.2 }}
          onClick={() => {
            const coords = calculateAnchorPointById(
              'spaces',
              spaceConfig.anchorOffset,
              spaceConfig.position,
              spaceConfig.dimensions
            );
            const height = document.body.clientHeight;
            setCurrentApp({
              id: 'spaces',
              coords: {
                x: coords.left,
                y: height - spaceConfig.dimensions.height - coords.bottom,
                ...spaceConfig.dimensions,
              },
            });
          }}
        >
          <motion.img
            style={{
              borderRadius: 6,
              objectFit: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              pointerEvents: 'none',
            }}
            height="26px"
            width="26px"
            src={spaces[currentSpace].picture}
          />
          <Flex
            style={{ flexDirection: 'column', pointerEvents: 'none' }}
            justify="center"
            align="flex-start"
          >
            <Text.Custom
              style={{
                lineHeight: '14px',
                textTransform: 'capitalize',
                pointerEvents: 'none',
              }}
              transition={{ color: { duration: 0.2 } }}
              fontSize="12px"
              fontWeight={500}
              opacity={0.5}
            >
              Space
            </Text.Custom>
            <Text.Custom
              style={{ pointerEvents: 'none' }}
              transition={{ color: { duration: 0.2 } }}
              fontSize={1}
              fontWeight={500}
            >
              {spaces[currentSpace].title}
            </Text.Custom>
          </Flex>
        </SelectedSpaceRow>
      </BarStyle>
      <BarStyle pl="3px" pr={1} style={{ justifyContent: 'space-between' }}>
        <Flex gap={8} align="center">
          <RoomsDock
            participants={currentRoom ? currentRoom.present : []}
            live={
              currentRoom && {
                rid: 1,
                title: currentRoom.roomName,
                present: currentRoom.present.map((p: any) => p.patp),
                capacity: 6,
              }
            }
            hasMicPermissions
            onCreate={() => {}}
            onMute={() => {}}
            onCursor={() => {}}
            onLeave={() => {}}
            onOpen={() => {
              if (currentRoom) {
                const coords = calculateAnchorPointById(
                  'rooms-tray',
                  roomConfig.anchorOffset,
                  roomConfig.position,
                  roomConfig.dimensions
                );
                const height = document.body.clientHeight;
                setCurrentApp({
                  id: 'rooms-tray',
                  coords: {
                    x: coords.left,
                    y: height - roomConfig.dimensions.height - coords.bottom,
                    ...roomConfig.dimensions,
                  },
                });
              }
            }}
          />
          <BarButton
            id="wallet-icon"
            height={26}
            width={26}
            onClick={() => {
              const coords = calculateAnchorPointById(
                'wallet',
                walletConfig.anchorOffset,
                walletConfig.position,
                walletConfig.dimensions
              );
              const height = document.body.clientHeight;
              setCurrentApp({
                id: 'wallet',
                coords: {
                  x: coords.left,
                  y: height - walletConfig.dimensions.height - coords.bottom,
                  ...walletConfig.dimensions,
                },
              });
            }}
          >
            <Icon name="WalletTray" size={22} />
          </BarButton>
          <BarButton
            id="chat-icon"
            height={26}
            width={26}
            onClick={() => {
              const coords = calculateAnchorPointById(
                'chat',
                chatConfig.anchorOffset,
                chatConfig.position,
                chatConfig.dimensions
              );
              const height = document.body.clientHeight;
              setCurrentApp({
                id: 'chat',
                coords: {
                  x: coords.left,
                  y: height - chatConfig.dimensions.height - coords.bottom,
                  ...chatConfig.dimensions,
                },
              });
            }}
          >
            <Icon name="Messages" size={22} />
          </BarButton>
          <Flex
            id="notifications-icon"
            onClick={(evt) => {
              evt.stopPropagation();
              const coords = calculateAnchorPointById(
                'notifications',
                notifConfig.anchorOffset,
                notifConfig.position,
                notifConfig.dimensions
              );
              const height = document.body.clientHeight;
              setCurrentApp({
                id: 'notifications',
                coords: {
                  x: coords.left,
                  y: height - notifConfig.dimensions.height - coords.bottom,
                  ...notifConfig.dimensions,
                },
              });
            }}
          >
            <Avatar
              simple
              clickable
              patp="~lomder-librun"
              size={26}
              borderRadiusOverride="4px"
              sigilColor={['#F08735', '#FFF']}
            />
          </Flex>
        </Flex>
      </BarStyle>
    </Flex>
  );
};
