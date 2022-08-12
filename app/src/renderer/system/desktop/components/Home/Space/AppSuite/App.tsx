import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ShellActions } from 'renderer/logic/actions/shell';
import { toJS } from 'mobx';
import { Flex, Text, Box, AppTile } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { AppModelType } from 'os/services/ship/models/docket';
import { DesktopActions } from 'renderer/logic/actions/desktop';

const AppEmpty = styled(Box)`
  border-radius: 16px;
  border: 2px dotted white;
  transition: 0.2s ease;
  &:hover {
    transition: 0.2s ease;
    background: ${rgba('#FFFFFF', 0.12)};
  }
`;

type SuiteAppProps = {
  space: SpaceModelType;
  highlightColor?: string;
  app?: AppModelType;
};

export const SuiteApp: FC<SuiteAppProps> = (props: SuiteAppProps) => {
  const { app, space } = props;
  if (app) {
    return (
      <AppTile
        tileSize="xxl"
        app={app}
        // allowContextMenu
        contextMenu={
          [
            // {
            //   label: isAppPinned ? 'Unpin app' : 'Pin to taskbar',
            //   onClick: (evt: any) => {
            //     evt.stopPropagation();
            //     isAppPinned
            //       ? SpacesActions.unpinApp(spacePath, app.id)
            //       : SpacesActions.pinApp(spacePath, app.id);
            //   },
            // },
            // {
            //   label: 'App info',
            //   disabled: true,
            //   onClick: (evt: any) => {
            //     // evt.stopPropagation();
            //     console.log('open app info');
            //   },
            // },
            // {
            //   label: 'Uninstall app',
            //   section: 2,
            //   disabled: true,
            //   onClick: (evt: any) => {
            //     // evt.stopPropagation();
            //     console.log('start uninstall');
            //   },
            // },
          ]
        }
        variants={{
          hidden: {
            opacity: 0,
            top: 30,
            transition: { top: 3, opacity: 1 },
          },
          show: {
            opacity: 1,
            top: 0,
            transition: { top: 3, opacity: 1, background: { duration: 0.25 } },
          },
          exit: { opacity: 0, top: 100 },
        }}
        onAppClick={(selectedApp: AppModelType) => {
          DesktopActions.openAppWindow(space.path, toJS(selectedApp));
          DesktopActions.setHomePane(false);
        }}
      />
    );
  }
  return <AppEmpty height={148} width={148}></AppEmpty>;
};
