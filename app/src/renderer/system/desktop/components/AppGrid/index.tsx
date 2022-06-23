import { FC } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { useMst, useShip, useSpaces } from 'renderer/logic/store';
import { Flex } from 'renderer/components';
import { AppTile } from 'renderer/components/AppTile';
import { AppModelType } from 'core/ship/stores/docket';
import { NativeAppList } from 'renderer/apps';

type HomeWindowProps = {
  customBg: string;
};

const HomeWindow = styled(motion.div)<HomeWindowProps>`
  background: ${(props: HomeWindowProps) => rgba(props.customBg, 0.1)};
  height: 100%;
`;

type AppGridProps = {
  isOpen?: boolean;
};

export const AppGrid: FC<AppGridProps> = observer((props: AppGridProps) => {
  const { isOpen } = props;
  const { ship } = useShip();
  const { desktopStore, themeStore } = useMst();
  const spacesStore = useSpaces();

  const apps: any = ship
    ? [...ship!.apps, ...NativeAppList]
    : [...NativeAppList];

  return (
    <AnimatePresence>
      <HomeWindow
        key="home-window"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          display: isOpen ? 'block' : 'none',
        }}
        exit={{ opacity: 0 }}
        customBg={themeStore.theme.dockColor}
      >
        <Flex
          flex={1}
          height="100%"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
        >
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
                transition: {
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
            flexWrap="wrap"
            flexDirection="row"
          >
            {apps.map((app: any, index: number) => {
              const isAppPinned = spacesStore.selected?.isAppPinned(app.id);
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
                          ? spacesStore.selected?.unpinApp(app.id)
                          : spacesStore.selected?.pinApp(app.id);
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
                    desktopStore.openBrowserWindow(selectedApp);
                  }}
                />
              );
            })}
          </Flex>
        </Flex>
      </HomeWindow>
    </AnimatePresence>
  );
});
