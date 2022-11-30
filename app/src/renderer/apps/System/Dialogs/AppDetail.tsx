import { FC, useMemo } from 'react';
import { observer } from 'mobx-react';
import { getSnapshot } from 'mobx-state-tree';
import {
  Button,
  Flex,
  Icons,
  Text,
  Box,
  LinkPreview,
} from 'renderer/components';
import styled from 'styled-components';

import { ShellActions } from 'renderer/logic/actions/shell';
import { useServices } from 'renderer/logic/store';
import {
  UrbitApp,
  AppType,
  NativeAppType,
  UrbitAppType,
  AppTypes,
  InstallStatus,
} from 'os/services/spaces/models/bazaar';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { rgba } from 'polished';
import { IconPathsType } from 'renderer/components/Icons/icons';
import { useAppInstaller } from 'renderer/system/desktop/components/Home/AppInstall/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';

const TileStyle = styled(Box)`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  user-select: none;
  border: 1px solid #00000010;
  img {
    --webkit-user-select: none;
    --khtml-user-select: none;
    --moz-user-select: none;
    --o-user-select: none;
    user-select: none;
  }
`;

interface AppDetailProps {
  loading: boolean;
  appId?: string;
  type: 'app-install' | 'app-grid' | null;
}

interface KPIProps {
  title: string;
  value: string | React.ReactNode;
}
const KPI: FC<KPIProps> = (props: KPIProps) => {
  let valueContent: React.ReactNode;
  if (typeof props.value === 'string') {
    valueContent = <Text flex={3}>{props.value}</Text>;
  } else {
    valueContent = <Flex flex={3}>{props.value}</Flex>;
  }
  return (
    <Flex
      flex={4}
      flexDirection="row"
      justifyContent="flex-start"
      alignItems="center"
    >
      <Text flex={1} fontWeight={500}>
        {props.title}
      </Text>
      {valueContent}
    </Flex>
  );
};

export const AppDetailDialog: (dialogProps: AppDetailProps) => DialogConfig = (
  dialogProps: AppDetailProps
) => {
  return {
    component: observer(() => {
      const { theme, bazaar } = useServices();
      const { loading, appId, type } = dialogProps;
      let app: AppType;
      let onClose: any = ShellActions.closeDialog;
      if (type === 'app-install') {
        const { selectedApp, setSearchMode } = useAppInstaller();
        onClose = () => {
          setSearchMode('none');
        };
        const catalogEntry = bazaar.getApp(selectedApp!.id.split('/')[1]);
        app = getSnapshot(
          UrbitApp.create({
            ...selectedApp!,
            title: selectedApp?.title || selectedApp!.id.split('/')[1],
            type: AppTypes.Urbit,
            href: getSnapshot(selectedApp!.href),
            config: {
              size: [10, 10],
              showTitlebar: true,
              titlebarBorder: true,
            },
            id: selectedApp!.id.split('/')[1]!,
            host: selectedApp!.id.split('/')[0],
            installStatus:
              (catalogEntry && catalogEntry.installStatus) ||
              InstallStatus.uninstalled,
          })
        ) as AppType;
      } else if (appId) {
        app = bazaar.getApp(appId)! as AppType;
      } else {
        return null;
      }

      return useMemo(() => {
        let graphic;
        let title = app.title;
        let kpis: React.ReactNode = [];
        const tileSize = 110;
        if (app.type === 'urbit') {
          app as UrbitAppType;
          graphic = app.image && (
            <img
              style={{ pointerEvents: 'none' }}
              draggable="false"
              height={tileSize}
              width={tileSize}
              src={app.image}
            />
          );
          if (app && app.href && app.href.site) {
            // for the case an image is served by the ship
            // we wont have it until install, so set to null
            graphic = null;
          }
          if (app && app.href && !app.title) {
            title = app.id.split('/')[1];
          }
          kpis = (
            <>
              <KPI
                title="Developer desk"
                value={`${app.host || ''}/${app.id}`}
              />
              <KPI title="Version" value={app.version} />
              <KPI
                title="Installed to"
                value={<Text fontByType="monospace">{`%${app.id}`}</Text>}
              />
              <KPI
                title="Website"
                value={
                  <LinkPreview
                    fontSize={15}
                    textColor={theme.currentTheme.accentColor}
                    link={app.website}
                    onClick={() => {
                      ShellActions.closeDialog();
                    }}
                  />
                }
              />
            </>
          );
        }

        const isInstalled = app.installStatus === 'installed';

        if (app.type === 'native') {
          app as NativeAppType;
          graphic = app.icon && (
            <Icons name={app.icon as IconPathsType} height={50} width={50} />
          );
          kpis = (
            <>
              <KPI title="App type" value="Native app" />
              <KPI title="Installed to" value={`%${app.id}`} />
              <KPI
                title="Website"
                value={
                  <LinkPreview
                    fontSize={15}
                    textColor={theme.currentTheme.accentColor}
                    link="https://holium.com"
                    onClick={() => {
                      ShellActions.closeDialog();
                    }}
                  />
                }
              />
            </>
          );
        }

        return (
          <Flex flex={1} flexDirection="column" justifyContent="flex-start">
            <Flex flexDirection="row" gap={20}>
              <TileStyle
                onContextMenu={(evt: any) => {
                  evt.stopPropagation();
                }}
                minWidth={tileSize}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
                height={tileSize}
                width={tileSize}
                backgroundColor={app.color || '#F2F3EF'}
              >
                {graphic}
              </TileStyle>
              <Flex flexDirection="column" justifyContent="center" flex={1}>
                <Text
                  mt={1}
                  fontWeight={500}
                  fontSize={6}
                  color={theme.currentTheme.textColor}
                  style={{
                    textOverflow: 'ellipsis',
                  }}
                >
                  {title}
                </Text>
                <Text
                  mt={2}
                  fontSize={3}
                  color={rgba(theme.currentTheme.textColor, 0.4)}
                >
                  {app.info}
                </Text>
                <Flex
                  mt={3}
                  flexDirection="row"
                  justifyContent="flex-start"
                  gap={10}
                >
                  <Button
                    borderRadius={6}
                    paddingTop="6px"
                    paddingBottom="6px"
                    variant={isInstalled ? 'disabled' : 'primary'}
                    fontWeight={500}
                    onClick={(e) => {
                      e.stopPropagation();
                      !isInstalled &&
                        SpacesActions.installApp(
                          (app as UrbitAppType).host!,
                          app.id
                        );
                      // TODO should we close on install?
                      onClose();
                    }}
                  >
                    {isInstalled ? 'Installed' : 'Install'}
                  </Button>
                  <Button
                    borderRadius={6}
                    paddingTop="6px"
                    paddingBottom="6px"
                    // variant="disabled"
                    fontWeight={500}
                    onClick={(e) => {
                      e.stopPropagation();
                      const content = `web+urbitgraph://${app.host || ''}/${
                        app.id
                      }`;
                      navigator.clipboard.writeText(content);
                    }}
                  >
                    Copy app link
                  </Button>
                </Flex>
              </Flex>
            </Flex>
            <Flex mt={40} gap={40} flex={1} flexDirection="column">
              {kpis}
            </Flex>
          </Flex>
        );
      }, [
        app,
        theme.currentTheme.textColor,
        theme.currentTheme.accentColor,
        onClose,
      ]);
    }),
    onClose: () => {
      ShellActions.closeDialog();
    },
    window: {
      id: 'app-detail-dialog',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 600,
        height: 480,
      },
    },
    hasCloseButton: true,
    unblurOnClose: false,
    draggable: false,
  } as DialogConfig;
};
