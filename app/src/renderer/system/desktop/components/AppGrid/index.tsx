import { FC, useEffect, useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { Flex, Input, Icons } from 'renderer/components';
import { AppTile } from 'renderer/components/AppTile';
import { AppModelType } from 'os/services/ship/models/docket';
import { NativeAppList } from 'renderer/apps';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { PassportsActions } from 'renderer/logic/actions/passports';
import { Members } from './Members';

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
  const { ship, spaces, shell } = useServices();
  const { desktop } = shell;
  const [passports, setPassports] = useState([]);

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
        customBg={desktop.theme.dockColor}
      >
        <Flex flexDirection="row">
          <Flex
            flex={8}
            overflowY="auto"
            height="100%"
            flexDirection="column"
            alignItems="center"
            justifyContent="flex-start"
            pt="100px"
          >
            <Input
              className="realm-cursor-text-cursor"
              type="text"
              placeholder="Search for apps"
              bgOpacity={0.3}
              borderColor={'input.borderHover'}
              bg="bg.blendedBg"
              wrapperStyle={{
                borderRadius: 25,
                height: 44,
                maxWidth: 400,
                marginBottom: 50,
                paddingLeft: 12,
                paddingRight: 16,
              }}
              rightIcon={
                <Flex>
                  <Icons name="Search" opacity={0.5} />
                </Flex>
              }
            />
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
          </Flex>
          {/* <Flex flexDirection="column" flex={2}>
            <Members />
          </Flex> */}
        </Flex>
      </HomeWindow>
    </AnimatePresence>
  );
});
