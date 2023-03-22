import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { useEffect, useState } from 'react';
import {
  Button,
  Avatar,
  Flex,
  Icon,
  Text,
  NotificationList,
  NotificationType,
} from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
// import { displayDate } from 'renderer/logic/lib/time';
import { nativeApps } from '../nativeApps';
import { observer } from 'mobx-react';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { useTrayApps } from '../store';
import { AuthActions } from 'renderer/logic/actions/auth';
// import { SpacesActions } from 'renderer/logic/actions/spaces';
import { trackEvent } from 'renderer/logic/lib/track';
import { AppType } from 'os/services/spaces/models/bazaar';

const AccountTrayAppPresenter = () => {
  const { ship, beacon } = useServices();
  const { setActiveApp, dimensions } = useTrayApps();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const roomsManager = useRooms(ship?.patp);

  useEffect(() => {
    setNotifications([
      {
        id: 0,
        app: 'engram',
        path: '/engram/document/0/new-comment',
        title: 'New document created',
        content: '~fasnut-famden created "Tax Notes - 3/22/23"',
        type: 'message',
        link: 'realm://apps/engram/document/2',
        read: true,
        readAt: null,
        dismissed: false,
        dismissedAt: null,
        createdAt: 1679347373,
        updatedAt: new Date().getTime(),
      },
      {
        id: 1,
        app: 'engram',
        path: '/engram/document/0/new-comment',
        title: 'New comment on your document',
        content: 'I think you should change this line to say "goodbye world"',
        type: 'message',
        link: 'realm://apps/engram/document/0/comment/1',
        read: true,
        readAt: null,
        dismissed: false,
        dismissedAt: null,
        createdAt: 1679347373,
        updatedAt: new Date().getTime(),
      },
      {
        id: 2,
        app: 'realm-chat',
        path: '/realm-chat/0',
        title: 'Based chat',
        content: 'DrunkPlato - Where’s the flamethrower?',
        type: 'message',
        read: true,
        readAt: null,
        dismissed: false,
        dismissedAt: null,
        createdAt: 1679433073,
        updatedAt: new Date().getTime(),
      },
      {
        id: 3,
        app: 'realm-chat',
        path: '/realm-chat/0',
        title: 'Based chat',
        content: 'dimwit-codder - What do you think of my code?',
        type: 'message',
        read: true,
        readAt: null,
        dismissed: false,
        dismissedAt: null,
        createdAt: 1679423073,
        updatedAt: new Date().getTime(),
      },
      {
        id: 4,
        app: 'realm-chat',
        path: '/realm-chat/1',
        title: 'Holium chat',
        content: 'AidenSolaran - Looking at your PR.',
        type: 'message',
        read: true,
        readAt: null,
        dismissed: false,
        dismissedAt: null,
        createdAt: 1679333073,
        updatedAt: new Date().getTime(),
      },
    ]);

    return () => {};
  }, []);

  const openSettingsApp = () => {
    DesktopActions.openAppWindow(nativeApps['os-settings'] as AppType);
  };

  if (!ship) return null;

  let subtitle;
  if (ship.nickname) {
    subtitle = (
      <Text.Custom opacity={0.7} fontSize={2} fontWeight={400}>
        {ship.patp}
      </Text.Custom>
    );
  }
  const apps: any = {
    'realm-chat': {
      image: 'https://cdn-icons-png.flaticon.com/512/724/724715.png',
      name: 'Realm Chat',
      key: 'realm-chat',
    },
    engram: {
      image:
        'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/engram.svg',
      name: 'Engram',
      key: 'engram',
    },
  };

  return (
    <>
      <NotificationList
        appLookup={(app) => {
          return apps[app];
        }}
        onDismiss={(app, path, id) =>
          console.log(`dismissed - ${app} ${path} ${id}`)
        }
        onDismissAll={(app, path) =>
          console.log(`dismissed all ${app} ${path || ''}`)
        }
        containerWidth={dimensions.width - 24}
        notifications={notifications}
      />
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        justifyContent="space-between"
        pt={4}
        pb={3}
        pl={3}
        pr={2}
        style={{
          minHeight: 58,
          zIndex: 4,
        }}
      >
        <Flex alignItems="center">
          <Avatar
            simple
            borderRadiusOverride="4px"
            size={32}
            avatar={ship.avatar}
            patp={ship.patp}
            sigilColor={[ship.color || '#000000', 'white']}
          />
          <Flex ml={2} flexDirection="column">
            <Text.Custom
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
              fontSize={3}
              fontWeight={500}
              variant="body"
            >
              {ship.nickname || ship.patp}
            </Text.Custom>
            {subtitle}
          </Flex>
        </Flex>
        <Flex gap={10} alignItems="center">
          <Button.IconButton
            size={28}
            className="realm-cursor-hover"
            onClick={() => {
              roomsManager.cleanup();
              AuthActions.logout(ship.patp);
              setActiveApp(null);
              trackEvent('CLICK_LOG_OUT', 'DESKTOP_SCREEN');
            }}
          >
            <Icon name="Logout" size={22} opacity={0.7} />
          </Button.IconButton>
          <Button.IconButton
            size={28}
            className="realm-cursor-hover"
            onClick={() => {
              roomsManager.cleanup();
              AuthActions.logout(ship.patp);
              setActiveApp(null);
              // trackEvent('CLICK_LOG_OUT', 'DESKTOP_SCREEN');
            }}
          >
            <Icon name="Shutdown" size={22} opacity={0.7} />
          </Button.IconButton>
          <Button.IconButton
            className="realm-cursor-hover"
            data-close-tray="true"
            size={28}
            onClick={() => openSettingsApp()}
          >
            <Icon name="Settings" size={22} opacity={0.7} />
          </Button.IconButton>
        </Flex>
      </Flex>
    </>
  );
};

export const AccountTrayApp = observer(AccountTrayAppPresenter);
