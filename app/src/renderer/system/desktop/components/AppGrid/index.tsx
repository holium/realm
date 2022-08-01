import { FC, useState, useEffect, useMemo } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { Flex, Input, Icons, IconButton, Sigil } from 'renderer/components';
import { AppTile } from 'renderer/components/AppTile';
import { AppModelType } from 'os/services/ship/models/docket';
import { NativeAppList } from 'renderer/apps';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { Members } from './Members';
import { PassportsActions } from 'renderer/logic/actions/passports';

type HomeWindowProps = {};

type SidebarType = 'people' | null;

const HomeWindow = styled(motion.div)<HomeWindowProps>`
  height: 100%;
`;

type AppGridProps = {
  isOpen?: boolean;
};

export const AppGrid: FC<AppGridProps> = observer((props: AppGridProps) => {
  const { isOpen } = props;
  const { ship, spaces, shell } = useServices();
  const { desktop } = shell;
  const [passports, setPassports] = useState([]);
  // const [sidebar, setSidebar] = useState<SidebarType>('people');
  const [sidebar, setSidebar] = useState<SidebarType>(null);

  const apps: any = ship
    ? [...ship!.apps, ...NativeAppList]
    : [...NativeAppList];

  useEffect(() => {
    if (spaces.selected?.path) {
      PassportsActions.getPassports(spaces.selected!.path!).then(
        (passes: any) => {
          console.log(passes);
          setPassports(passes);
        }
      );
    }
  }, [spaces.selected?.path]);

  // console.log(passports);

  const sidebarComponent = useMemo(() => {
    return (
      <AnimatePresence>
        {sidebar !== null && (
          <Flex
            position="absolute"
            right="8px"
            top="8px"
            bottom={58}
            initial={{ opacity: 0, width: 40 }}
            animate={{ opacity: 1, width: 330 }}
            exit={{ opacity: 0, width: 40 }}
            transition={{ duration: 0.25 }}
            flexDirection="column"
            flex={2}
          >
            {sidebar === 'people' && (
              <Members
                our={true}
                friends={[
                  {
                    nickname: 'DrunkPlato',
                    patp: '~lomder-librun',
                    color: '#F08735',
                    pinned: true,
                    description:
                      'Building a community OS experience on Urbit. Works at Holium.',
                  },
                  { patp: '~lodlev-migdev', color: '#2469BD', pinned: true },
                  { patp: '~ronseg-hacsym', color: '#D48BFB' },
                ]}
              />
            )}
          </Flex>
        )}
      </AnimatePresence>
    );
  }, [sidebar, passports]);

  return (
    <AnimatePresence>
      <HomeWindow
        key="home-window"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          display: isOpen ? 'block' : 'none',
          background: rgba(
            desktop.theme.mode === 'light' ? '#FFFFFF' : '#000000',
            desktop.theme.mode === 'light' ? 0.25 : 0.25
          ),
        }}
        transition={{ background: { duration: 0.25 } }}
        exit={{ opacity: 0 }}
        // customBg={desktop.theme.dockColor}
      >
        <Flex flexDirection="row" height="calc(100vh - 58px)">
          <Flex
            flex={8}
            overflowY="auto"
            height="100%"
            flexDirection="column"
            alignItems="center"
            justifyContent="flex-start"
          >
            <Flex
              flex={8}
              style={{ position: 'relative' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              maxHeight={42}
              height={42}
              gap={12}
              mb={40}
              mt={40}
              flexDirection="row"
              alignItems="center"
            >
              <Flex flex={1}>
                {ship && (
                  <Sigil
                    simple
                    size={32}
                    avatar={ship.avatar}
                    patp={ship.patp}
                    color={[ship.color || '#000000', 'white']}
                  />
                )}
              </Flex>
              <Input
                flex={8}
                className="realm-cursor-text-cursor"
                type="text"
                placeholder="Search for apps"
                bgOpacity={0.3}
                borderColor={'input.borderHover'}
                bg="bg.blendedBg"
                wrapperStyle={{
                  borderRadius: 25,
                  height: 42,
                  width: 500,
                  paddingLeft: 12,
                  paddingRight: 16,
                }}
                rightIcon={
                  <Flex>
                    <Icons name="Search" size="18px" opacity={0.5} />
                  </Flex>
                }
              />
              <Flex flex={1} justifyContent="flex-end">
                <IconButton
                  size={3}
                  customBg={desktop.theme.windowColor}
                  onClick={() => {
                    setSidebar(!sidebar ? 'people' : null);
                  }}
                >
                  <Icons name="Members" size="22px" opacity={0.8} />
                </IconButton>
              </Flex>
            </Flex>
            <Flex flexDirection="row" justifyContent="space-between" gap={36}>
              <Flex
                variants={{
                  hidden: {
                    opacity: 0,
                    transition: {
                      opacity: 0.3,
                      staggerChildren: 0,
                      delayChildren: 0,
                    },
                  },
                  show: {
                    opacity: 1,
                    x: sidebar ? -80 : 0,
                    transition: {
                      x: { duration: 0.25 },
                      opacity: 0.3,
                      staggerChildren: 0.1,
                      delayChildren: 0.1,
                    },
                  },
                  exit: {
                    opacity: 0,
                    transition: {
                      opacity: 0.3,
                      staggerChildren: 0,
                      delayChildren: 0,
                    },
                  },
                }}
                style={{ position: 'relative' }}
                initial="hidden"
                animate={isOpen ? 'show' : 'exit'}
                exit="hidden"
                gap={16}
                width="888px"
                mb="180px"
                flexWrap="wrap"
                flexDirection="row"
              >
                {apps.map((app: any, index: number) => {
                  const spacePath = spaces.selected?.path!;
                  const isAppPinned = spaces.selected?.isAppPinned(app.id);
                  return (
                    <AppTile
                      key={app.title + index + 'grid'}
                      isPinned={isAppPinned}
                      allowContextMenu
                      tileSize="xxl"
                      app={app}
                      isVisible={isOpen}
                      contextMenu={[
                        {
                          label: isAppPinned ? 'Unpin app' : 'Pin to taskbar',
                          onClick: (evt: any) => {
                            evt.stopPropagation();
                            isAppPinned
                              ? SpacesActions.unpinApp(spacePath, app.id)
                              : SpacesActions.pinApp(spacePath, app.id);
                          },
                        },
                        {
                          label: 'App info',
                          disabled: true,
                          onClick: (evt: any) => {
                            // evt.stopPropagation();
                            console.log('open app info');
                          },
                        },
                        {
                          label: 'Uninstall app',
                          section: 2,
                          disabled: true,
                          onClick: (evt: any) => {
                            // evt.stopPropagation();
                            console.log('start uninstall');
                          },
                        },
                      ]}
                      variants={{
                        hidden: {
                          opacity: 0,
                          top: 30,
                          transition: { top: 3, opacity: 1 },
                        },
                        show: {
                          opacity: 1,
                          top: 0,
                          transition: { top: 3, opacity: 1 },
                        },
                        exit: { opacity: 0, top: 100 },
                      }}
                      onAppClick={(selectedApp: AppModelType) => {
                        DesktopActions.openAppWindow(
                          spaces.selected!.path,
                          toJS(selectedApp)
                        );
                        // DesktopActions.setBlur(false);
                        DesktopActions.setHomePane(false);
                      }}
                    />
                  );
                })}
              </Flex>
              {sidebarComponent}
            </Flex>
          </Flex>
        </Flex>
      </HomeWindow>
    </AnimatePresence>
  );
});
