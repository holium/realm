import { FC, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { rgba } from 'polished';

import { Box, AppTile, Icons, BoxProps } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import {
  AppType,
  InstallStatus,
  UrbitAppType,
} from 'os/services/spaces/models/bazaar';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';

type AppEmptyProps = {
  isSelected: boolean;
  accentColor: string;
} & BoxProps;

const AppEmpty = styled(Box)<AppEmptyProps>`
  border-radius: 20px;
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
  ${(props: AppEmptyProps) =>
    props.isSelected &&
    css`
      border: 2px solid ${props.accentColor};
    `};
`;

type SuiteAppProps = {
  id: string;
  index: number;
  selected: boolean;
  space: SpaceModelType;
  highlightColor?: string;
  accentColor: string;
  app?: AppType;
  isAdmin?: boolean;
  onClick?: (e: React.MouseEvent<any, MouseEvent>, app?: any) => void;
};

export const SuiteApp: FC<SuiteAppProps> = observer((props: SuiteAppProps) => {
  const { id, selected, index, accentColor, app, space, isAdmin, onClick } =
    props;
  const { bazaar } = useServices();
  if (app) {
    const isPinned = bazaar.isPinned(space.path, app.id);
    const weRecommended = bazaar.isRecommended(app.id);

    let menu = [];
    if (isAdmin) {
      menu.push({
        label: 'Remove from suite',
        onClick: (evt: any) => {
          evt.stopPropagation();
          SpacesActions.removeFromSuite(space.path, index);
        },
      });
      menu.push({
        label: isPinned ? 'Unpin' : 'Pin',
        onClick: (evt: any) => {
          evt.stopPropagation();
          isPinned
            ? SpacesActions.unpinApp(space.path, app.id)
            : SpacesActions.pinApp(space.path, app.id, null);
        },
      });
    }
    menu.push({
      label: weRecommended ? 'Unrecommend app' : 'Recommend app',
      onClick: (evt: any) => {
        evt.stopPropagation();
        weRecommended
          ? SpacesActions.unrecommendApp(app.id)
          : SpacesActions.recommendApp(app.id);
      },
    });
    if (app.type === 'urbit') {
      menu.push({
        label:
          app.installStatus === InstallStatus.installed
            ? 'Uninstall app'
            : 'Install app',
        disabled: false,
        section: 2,
        onClick: (evt: any) => {
          evt.stopPropagation();
          // console.log('install app => %o', app);
          if (app.installStatus === InstallStatus.installed) {
            SpacesActions.uninstallApp(app.id);
          } else {
            // SpacesActions.installApp(app);
          }
        },
      });
    }

    return (
      <AppTile
        tileSize="xl1"
        app={app}
        isUninstalled={
          (app as UrbitAppType).installStatus === InstallStatus.uninstalled
        }
        isPinned={isPinned}
        isRecommended={weRecommended}
        allowContextMenu={true}
        contextMenu={menu}
        onAppClick={(selectedApp: AppType) => {
          DesktopActions.openAppWindow(space.path, selectedApp);
          DesktopActions.setHomePane(false);
        }}
      />
    );
  }
  return (
    <AppEmpty
      id={id}
      height={160}
      width={160}
      isSelected={selected}
      accentColor={accentColor}
      onClick={(e) => onClick && onClick(e, undefined)}
    >
      <Icons size={24} name="Plus" fill={'#FFFFFF'} opacity={0.4} />
    </AppEmpty>
  );
});
