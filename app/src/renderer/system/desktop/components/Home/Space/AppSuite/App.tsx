import { FC, useEffect } from 'react';
import styled from 'styled-components';
import { rgba } from 'polished';
import { toJS } from 'mobx';

import { Box, AppTile, Icons } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { AppModelType } from 'os/services/ship/models/docket';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { BazaarApi } from 'os/api/bazaar';
import { SpacesActions } from 'renderer/logic/actions/spaces';

const AppEmpty = styled(Box)`
  border-radius: 16px;
  /* border: 2px dotted white; */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
  background: ${rgba('#FBFBFB', 0.4)};
  &:hover {
    transition: 0.2s ease;
    background: ${rgba('#FFFFFF', 0.5)};
  }
`;

type SuiteAppProps = {
  space: SpaceModelType;
  highlightColor?: string;
  app?: any; // AppModelType;
  isAdmin?: boolean;
  onClick?: (e: React.MouseEvent<any, MouseEvent>, app: any) => void;
};

export const SuiteApp: FC<SuiteAppProps> = (props: SuiteAppProps) => {
  const { app, space, isAdmin, onClick } = props;
  if (app) {
    // lighten app if not installed on this ship
    app.color = app.tags.includes('installed')
      ? app.color
      : rgba(app.color, 0.7);
    return (
      <AppTile
        tileSize="xl"
        app={app}
        allowContextMenu={isAdmin}
        contextMenu={
          isAdmin
            ? [
                {
                  label: 'Remove from suite',
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    onClick && onClick();
                  },
                },
                {
                  label: 'Recommend this app',
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    SpacesActions.recommendApp(space.path, app.id);
                  },
                },
                {
                  label: 'Install app',
                  disabled: !app.tags.includes('installed'),
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    // console.log('install app => %o', app);
                    SpacesActions.installApp(app);
                  },
                },
              ]
            : undefined
        }
        onAppClick={(selectedApp: AppModelType) => {
          // QUESTION: should this open the app listing or the actual app?
          // const app = toJS(selectedApp);
          DesktopActions.openAppWindow(space.path, selectedApp);
          DesktopActions.setHomePane(false);
          // desktop.setHomePane(false);
        }}
      />
    );
  }
  return (
    <AppEmpty
      height={148}
      width={148}
      onClick={(e) => onClick && onClick(e, undefined)}
    >
      <Icons size={24} name="Plus" fill="#FFFFFF" opacity={0.4} />
    </AppEmpty>
  );
};
