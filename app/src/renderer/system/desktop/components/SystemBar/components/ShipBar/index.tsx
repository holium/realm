import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { observer } from 'mobx-react';

import {
  BarStyle,
  Box,
  Button,
  Flex,
  Icon,
  NoScrollBar,
  NotificationList,
  NotificationType,
} from '@holium/design-system';

import { nativeApps } from 'renderer/apps/nativeApps';
import { useTrayApps } from 'renderer/apps/store';
import { trackEvent } from 'renderer/lib/track';
import { openChatToPath } from 'renderer/lib/useTrayControls';
import { useAppState } from 'renderer/stores/app.store';
import { AppType } from 'renderer/stores/models/bazaar.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { AccountTray } from './AccountTray';
import { MessagesTray } from './MessagesTray';
import { RoomTray } from './Rooms';
import { WalletTray } from './WalletTray';

type ExpandBarStyles = {
  height: number | 'fit-content';
  position: 'fixed' | 'relative';
  right: number;
  bottom: number;
};

export const ShipBarPresenter = () => {
  const { loggedInAccount, shellStore, authStore } = useAppState();
  const { chatStore, notifStore } = useShipStore();
  const {
    unreadCount,
    initNotifications,
    undismissedNotifications,
    dismissOne,
    dismissApp,
    dismissPath,
  } = notifStore;
  const { setActiveApp, activeApp } = useTrayApps();

  const [isAccountExpanded, setIsAccountExpanded] = useState(false);

  const [showInnerContent, setShowInnerContent] = useState(false);
  const [isAccountTrayOpen, setAccountTrayOpen] = useState(false);
  const [expandStyle, setExpandStyle] = useState<ExpandBarStyles>({
    height: 40,
    position: 'fixed',
    right: 8,
    bottom: 8,
  });

  const onNotifLinkClick = (app: string, path: string, link?: string) => {
    trackEvent('CLICK_NOTIFICATION', 'DESKTOP_SCREEN', { app });
    console.log('clicked notification', app, path, link);
    switch (app) {
      case 'os-settings':
        shellStore.openWindow(nativeApps['os-settings'] as AppType);
        break;
      case 'os-browser':
        shellStore.openWindow(nativeApps['os-browser'] as AppType);
        break;
      case 'realm-chat':
        openChatToPath(chatStore, setActiveApp, path, link);
        break;
      default:
        break;
    }
  };

  const onAccountTrayClick = (evt: any) => {
    if (isAccountTrayOpen) {
      setAccountTrayOpen(false);
      evt.stopPropagation();
      return;
    }
    initNotifications();
    if (chatStore.inbox.length === 0) {
      chatStore.loadChatList();
    }
    setAccountTrayOpen(true);
  };

  useEffect(() => {
    initNotifications();
  }, [loggedInAccount?.patp]);

  useEffect(() => {
    if (isAccountTrayOpen) {
      // calculate height of window and set it to the height of the tray
      const height = 'fit-content';

      setExpandStyle({
        height,
        position: 'fixed',
        right: 8,
        bottom: 8,
      });
    } else {
      setExpandStyle({
        height: 40,
        position: 'fixed',
        right: 8,
        bottom: 8,
      });
    }
  }, [isAccountTrayOpen]);

  useEffect(() => {
    if (activeApp) {
      setAccountTrayOpen(false);
      return;
    }
  }, [activeApp !== null]);

  const id = 'systembar-ship-bar';

  // handle click outside of tray
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const bar = document.getElementById(id);
      if (bar && bar.contains(e.target as Node)) return;
      if (isAccountTrayOpen) {
        setAccountTrayOpen(false);
        setIsAccountExpanded(false);
      }
    },
    [id, isAccountTrayOpen]
  );

  // Setup click handler to close the tray
  const root = document.getElementById('root');
  useEffect(() => {
    if (!root) return;
    root.addEventListener('mousedown', handleClickOutside);

    return () => {
      root.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside, root]);

  if (!loggedInAccount) return null;
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

  const width = 390;
  const minHeight = 138;
  return (
    <BarStyle
      id={id}
      pl="3px"
      pr="3px"
      flexDirection="column"
      justifyContent="flex-end"
      width={width}
      maxHeight={document.body.clientHeight - 16}
      style={
        isAccountTrayOpen
          ? {
              minHeight,
              borderTopRightRadius: 9,
              borderTopLeftRadius: 9,
            }
          : {}
      }
      initial={expandStyle}
      animate={expandStyle}
      exit={expandStyle}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      onAnimationStart={() => {
        isAccountTrayOpen
          ? setShowInnerContent(true)
          : setShowInnerContent(false);
      }}
    >
      <AnimatePresence>
        {isAccountTrayOpen && (
          <Flex
            flexDirection="column"
            minHeight={minHeight - 40}
            pt="8px"
            pb="6px"
            pl="3px"
            gap={10}
            width={width - 12}
            justifyContent="flex-end"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: showInnerContent ? 1 : 0,
              transition: { duration: 0.1, ease: 'easeInOut' },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.1, ease: 'easeInOut' },
            }}
          >
            <NoScrollBar
              justifyContent="flex-start"
              overflowY="auto"
              overflowX="hidden"
              width={width - 15}
            >
              <NotificationList
                justifyContent="flex-end"
                onPathLookup={(app: string, path: string) => {
                  if (app === 'realm-chat') {
                    let { title, sigil, image } = chatStore.getChatHeader(path);
                    return {
                      title,
                      sigil,
                      image,
                    };
                  }
                  return null;
                  // return getNotificationPath(app, path);
                }}
                onAppLookup={(app: string) => {
                  return apps[app];
                }}
                onDismiss={(app: string, path: string, id: number) => {
                  console.log(`dismissed - ${app} ${path} ${id}`);
                  dismissOne(id);
                }}
                onDismissAll={(app: string, path?: string) => {
                  if (path) {
                    dismissPath(app, path);
                  } else {
                    dismissApp(app);
                  }
                }}
                onLinkClick={onNotifLinkClick}
                containerWidth={width - 15}
                notifications={undismissedNotifications as NotificationType[]}
              />
            </NoScrollBar>
            <Flex
              animate={{
                opacity: 1,
              }}
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              pl="3px"
              gap={8}
              height={34}
              justifyContent="center"
              // alignItems="flex-end"
            >
              <Button.IconButton
                size={28}
                className="realm-cursor-hover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                onClick={() => {
                  shellStore.setIsBlurred(true);
                  shellStore.openDialog('shutdown-dialog');
                  setActiveApp(null);
                }}
              >
                <Icon name="Shutdown" size={22} />
              </Button.IconButton>
              <Button.IconButton
                size={28}
                className="realm-cursor-hover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                onClick={() => {
                  authStore.logout();
                  setActiveApp(null);
                }}
              >
                <Icon name="Logout" size={22} />
              </Button.IconButton>
              <Button.IconButton
                className="realm-cursor-hover"
                data-close-tray="true"
                size={28}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                onClick={() =>
                  shellStore.openWindow(nativeApps['os-settings'] as AppType)
                }
              >
                <Icon name="Settings" size={22} />
              </Button.IconButton>
            </Flex>
          </Flex>
        )}
      </AnimatePresence>
      <Flex
        gap={8}
        py={'3px'}
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        onHoverEnd={() => {
          if (!isAccountTrayOpen) {
            setIsAccountExpanded(false);
          }
        }}
      >
        <Flex
          layout="preserve-aspect"
          layoutId="account-bar-buttons"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isAccountExpanded ? 0 : 1,
            width: isAccountExpanded ? '50%' : '100%',
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <Flex gap={6} height={34} alignItems="center">
            <RoomTray />
            <Box
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
            >
              <WalletTray />
            </Box>
            <Box
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
            >
              <MessagesTray />
            </Box>
          </Flex>
        </Flex>
        <AccountTray unreadCount={unreadCount} onClick={onAccountTrayClick} />
      </Flex>
    </BarStyle>
  );
};

export const ShipBar = observer(ShipBarPresenter);
