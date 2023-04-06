import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { getSnapshot } from 'mobx-state-tree';
import { LinkPreview } from 'renderer/components';
import styled from 'styled-components';
import {
  Box,
  Flex,
  Button,
  Icon,
  Text,
  InstallStatus,
  IconPathsType,
} from '@holium/design-system';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { useAppInstaller } from 'renderer/system/desktop/components/Home/AppInstall/store';
import { normalizeBounds } from 'os/services/shell/lib/window-manager';
import { useShipStore } from 'renderer/stores/ship.store';
import {
  AppMobxType,
  AppTypes,
  UrbitApp,
  GlobMobxType,
} from 'renderer/stores/models/bazaar.model';
import { useAppState, appState } from 'renderer/stores/app.store';

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
  hover?: string;
}
const KPI: FC<KPIProps> = (props: KPIProps) => {
  let valueContent: React.ReactNode;
  if (typeof props.value === 'string') {
    valueContent = (
      <Text.Custom flex={3} title={props.hover}>
        {props.value}
      </Text.Custom>
    );
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
      <Text.Custom flex={1} fontWeight={500}>
        {props.title}
      </Text.Custom>
      {valueContent}
    </Flex>
  );
};

const AppDetailDialogComponentPresenter = ({ appId, type }: AppDetailProps) => {
  const { shellStore } = useAppState();
  const { bazaarStore } = useShipStore();
  const { selectedApp, setSearchMode } = useAppInstaller();
  const [copied, setCopied] = useState<boolean>(false);
  const [deskHash, setDeskHash] = useState<string | null>(null);

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000);
    }
  }, [copied]);

  useEffect(() => {
    if (appId) {
      bazaarStore
        .scryHash(appId)
        .then((result) => result && setDeskHash(result['app-hash']));
    }
  }, [appId]);

  let app: AppMobxType | null = null;
  let onClose: any = shellStore.closeDialog;
  if (type === 'app-install') {
    if (!selectedApp) return null;
    onClose = () => setSearchMode('none');
    const catalogEntry = bazaarStore.getApp(selectedApp.id.split('/')[1]);
    app = getSnapshot(
      UrbitApp.create({
        ...selectedApp,
        title: selectedApp?.title || selectedApp.id.split('/')[1],
        type: AppTypes.Urbit,
        href: getSnapshot(selectedApp.href),
        config: {
          size: [10, 10],
          showTitlebar: true,
          titlebarBorder: true,
        },
        id: selectedApp.id.split('/')[1],
        host: selectedApp.id.split('/')[0],
        installStatus:
          (catalogEntry && catalogEntry.installStatus) ||
          InstallStatus.uninstalled,
      })
    ) as AppMobxType;
  } else if (appId) {
    app = bazaarStore.getApp(appId) as AppMobxType;
  } else {
    return null;
  }
  const isInstalled = app && app.installStatus === 'installed';

  let graphic;
  let title = app.title;
  let kpis: React.ReactNode = [];
  const tileSize = 110;
  if (app.type === 'urbit') {
    app as AppMobxType;
    graphic = app.image && (
      <img
        alt={app.title}
        style={{ pointerEvents: 'none' }}
        draggable="false"
        height={tileSize}
        width={tileSize}
        src={app.image}
      />
    );
    const href = app.href as GlobMobxType;
    if (app && !app.image && href && href.site) {
      // for the case an image is served by the ship
      // we wont have it until install, so set to null
      graphic = null;
    }
    if (app && app.href && !app.title) {
      title = app.id.split('/')[1];
    }
    const glob = href && href.glob;
    kpis = (
      <>
        <KPI title="Developer desk" value={`${app.host || ''}/${app.id}`} />
        {glob && glob['glob-reference'] && (
          <KPI title="Glob Hash" value={glob['glob-reference'].hash} />
        )}
        {isInstalled && (
          <KPI
            title="Desk Hash"
            hover={deskHash || 'loading...'}
            value={
              deskHash &&
              `${deskHash.split('.')[0]}...${
                deskHash.split('.')[deskHash.split('.').length - 1]
              }`
            }
          />
        )}
        <KPI title="Version" value={app.version} />
        <KPI
          title="Installed to"
          value={
            <Text.Custom fontByType="monospace">{`%${app.id}`}</Text.Custom>
          }
        />
        {app.website && (
          <KPI
            title="Website"
            value={
              <LinkPreview
                fontSize={15}
                link={app.website}
                onClick={() => {
                  shellStore.closeDialog();
                }}
              />
            }
          />
        )}
      </>
    );
  }

  if (app.type === 'native') {
    graphic = app.icon && <Icon name={app.icon as IconPathsType} size={50} />;
    kpis = (
      <>
        <KPI title="App type" value="Native app" />
        <KPI title="Installed to" value={`%${app.id}`} />
        <KPI
          title="Website"
          value={
            <LinkPreview
              fontSize={15}
              link="https://holium.com"
              onClick={() => {
                shellStore.closeDialog();
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
            backgroundColor: app.color || '#F2F3EF',
          }}
          height={tileSize}
          width={tileSize}
        >
          {graphic}
        </TileStyle>
        <Flex flexDirection="column" justifyContent="center" flex={1}>
          <Text.Custom
            mt={1}
            fontWeight={500}
            fontSize={6}
            style={{
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Text.Custom>
          <Text.Custom mt={2} fontSize={3} opacity={0.4}>
            {app.info}
          </Text.Custom>
          {app.type === 'urbit' && (
            <Flex
              mt={3}
              flexDirection="row"
              justifyContent="flex-start"
              gap={10}
            >
              <Button.Primary
                borderRadius={6}
                paddingTop="6px"
                paddingBottom="6px"
                disabled={isInstalled}
                fontWeight={500}
                onClick={(e) => {
                  e.stopPropagation();
                  const a = app as AppMobxType;
                  if (!isInstalled && a && a.host) {
                    bazaarStore.installApp(a.host, a.id);
                  }
                  // TODO should we close on install?
                  onClose();
                }}
              >
                {isInstalled ? 'Installed' : 'Install'}
              </Button.Primary>

              <Button.Secondary
                borderRadius={6}
                paddingTop="6px"
                paddingBottom="6px"
                // variant="disabled"
                fontWeight={500}
                onClick={(e) => {
                  e.stopPropagation();
                  if (app) {
                    const content = `web+urbitgraph://${
                      (app as AppMobxType).host || ''
                    }/${app.id}`;
                    navigator.clipboard.writeText(content);
                    setCopied(true);
                  }
                }}
              >
                <>
                  <div style={{ marginRight: '3px', fontWeight: '500' }}>
                    Copy app link
                  </div>
                  {!copied ? <Icon name="Copy" /> : <Icon name="CheckCircle" />}
                </>
              </Button.Secondary>
            </Flex>
          )}
        </Flex>
      </Flex>
      <Flex mt={40} gap={40} flex={1} flexDirection="column">
        {kpis}
      </Flex>
    </Flex>
  );
};

const AppDetailDialogComponent = observer(AppDetailDialogComponentPresenter);

export const AppDetailDialog: (dialogProps: AppDetailProps) => DialogConfig = (
  dialogProps: AppDetailProps
) =>
  ({
    component: () => <AppDetailDialogComponent {...dialogProps} />,
    onClose: () => {
      appState.shellStore.closeDialog();
    },
    getWindowProps: (desktopDimensions) => ({
      appId: 'app-detail-dialog',
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 600,
          height: 540,
        },
        desktopDimensions
      ),
    }),
    hasCloseButton: true,
    unblurOnClose: false,
    draggable: false,
  } as DialogConfig);
