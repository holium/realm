import { useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { AppTile, AppTileSize } from 'renderer/components/AppTile/AppTile';
import {
  AppType,
  AppTypes,
  InstallStatus,
  UrbitAppType,
  WebAppType,
} from 'os/services/spaces/models/bazaar';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { ShellActions } from 'renderer/logic/actions/shell';
import {
  handleInstallation,
  handleResumeSuspend,
  installLabel,
  resumeSuspendLabel,
} from '../AppInstall/helpers';
import {
  GridContextProvider,
  GridDropZone,
  GridItem,
  swap,
} from 'react-grid-dnd';
import disableScroll from 'disable-scroll';
import { getWebContentsPosition } from 'main/helpers/mouse';

interface AppGridProps {
  tileSize: AppTileSize;
  maxWidth: number;
}

const AppGridPresenter = ({
  tileSize = 'xxl',
  maxWidth = 880,
}: AppGridProps) => {
  const { spaces, bazaar } = useServices();
  const currentSpace = spaces.selected;
  const apps = [...bazaar.installed, ...bazaar.installed, ...bazaar.devApps] as
    | AppType[]
    | WebAppType[];
  const [items, setItems] = useState(apps);

  if (!currentSpace) return null;

  const onChange = (sourceId, sourceIndex, targetIndex, targetId) => {
    const nextState = swap(items, sourceIndex, targetIndex);
    console.log(nextState);
    setItems(nextState);
  };

  return (
    <GridContextProvider onChange={onChange}>
      <GridDropZone
        id="items"
        boxesPerRow={4}
        rowHeight={maxWidth / 4}
        style={{
          height: (maxWidth / 4) * Math.ceil(items.length / 4),
          // overflow: 'hidden',
          width: maxWidth,
        }}
      >
        {items.map((app, index: number) => {
          const isAppPinned = bazaar.isPinned(currentSpace.path, app.id);
          const weRecommended = bazaar.isRecommended(app.id);
          const installStatus = app.installStatus as InstallStatus;

          const canSuspend =
            (installStatus === InstallStatus.installed ||
              installStatus === InstallStatus.suspended) &&
            app.type === 'urbit';

          const suspendRow = canSuspend
            ? [
                {
                  label: resumeSuspendLabel(installStatus),
                  section: 2,
                  disabled: false,
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    return handleResumeSuspend(app.id, installStatus);
                  },
                },
              ]
            : [];

          const installRow =
            app.type === 'urbit'
              ? [
                  {
                    label: installLabel(installStatus),
                    section: 2,
                    disabled: false,
                    onClick: (evt: any) => {
                      evt.stopPropagation();
                      const appHost = (app as UrbitAppType).host;
                      return handleInstallation(appHost, app.id, installStatus);
                    },
                  },
                ]
              : [];
          const tileId = `${app.title}-${index}-grid`;

          return (
            <GridItem
              key={tileId}
              onMouseMove={() => {
                console.log(getWebContentsPosition());
              }}
              onMouseDownCapture={() => {
                disableScroll.on();
              }}
              onMouseUpCapture={() => {
                disableScroll.off();
              }}
            >
              <AppTile
                tileId={tileId}
                isAnimated={
                  installStatus !== InstallStatus.suspended &&
                  installStatus !== InstallStatus.failed
                }
                installStatus={installStatus}
                tileSize={tileSize}
                app={app as AppType}
                contextMenuOptions={[
                  {
                    label: isAppPinned ? 'Unpin app' : 'Pin app',
                    disabled: app.type === AppTypes.Web,
                    onClick: (evt: any) => {
                      evt.stopPropagation();
                      isAppPinned
                        ? SpacesActions.unpinApp(currentSpace.path, app.id)
                        : SpacesActions.pinApp(currentSpace.path, app.id);
                    },
                  },
                  {
                    label: weRecommended ? 'Unrecommend app' : 'Recommend app',
                    disabled: app.type === AppTypes.Web,
                    onClick: (evt: any) => {
                      evt.stopPropagation();
                      weRecommended
                        ? SpacesActions.unrecommendApp(app.id)
                        : SpacesActions.recommendApp(app.id);
                    },
                  },
                  {
                    label: 'App info',
                    disabled: app.type === AppTypes.Web,
                    onClick: (evt: any) => {
                      evt.stopPropagation();
                      ShellActions.openDialogWithStringProps(
                        'app-detail-dialog',
                        {
                          appId: app.id,
                        }
                      );
                    },
                  },
                  ...suspendRow,
                  ...installRow,
                ]}
                onAppClick={(selectedApp) => {
                  DesktopActions.openAppWindow(toJS(selectedApp));
                  DesktopActions.closeHomePane();
                }}
              />
            </GridItem>
          );
        })}
      </GridDropZone>
    </GridContextProvider>
  );
};

export const AppGrid = observer(AppGridPresenter);
