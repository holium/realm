import { FC, useMemo } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { useMst, useShip } from '../../../../../logic/store';
import { Flex } from '../../../../../components';
import { AppTile } from '../../../../../components/AppTile';
import { AppModelType } from 'core/ship/stores/docket';

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

  const apps = ship ? ship!.apps : [];

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
            initial="hidden"
            animate={isOpen ? 'show' : 'exit'}
            exit="hidden"
            gap={16}
            width="888px"
            flexWrap="wrap"
            flexDirection="row"
          >
            {apps.map((app: any, index: number) => (
              <AppTile
                key={app.title + index}
                isVisible={isOpen}
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
                tileSize="xxl"
                app={app}
                // selected={app.id === activeWindowId}
                onAppClick={
                  (selectedApp: AppModelType) => {
                    const formAppUrl = `${ship!.url}/apps/${app.id!}`;
                    const windowPayload = {
                      name: app.id!,
                      url: formAppUrl,
                      customCSS: {},
                      theme: themeStore,
                      cookies: {
                        url: formAppUrl,
                        name: `urbauth-${ship!.patp}`,
                        value: ship!.cookie!.split('=')[1].split('; ')[0],
                      },
                    };
                    desktopStore.openBrowserWindow(selectedApp, windowPayload);
                  }
                  // desktopStore.o
                }
              />
            ))}
          </Flex>
        </Flex>
      </HomeWindow>
    </AnimatePresence>
  );
});
