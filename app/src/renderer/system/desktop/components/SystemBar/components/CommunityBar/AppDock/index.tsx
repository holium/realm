import { FC, useMemo } from 'react';
import { Flex, Divider } from 'renderer/components';
import { AppModelType } from 'os/services/ship/models/docket';
import { AppTile } from 'renderer/components/AppTile';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';
import { Reorder, AnimatePresence } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { DesktopActions } from 'renderer/logic/actions/desktop';

interface AppDockProps {}

export const AppDock: FC<AppDockProps> = observer(() => {
  const { desktop, spaces, bazaar, ship } = useServices();

  const dividerBg = useMemo(
    () => rgba(lighten(0.2, desktop.theme.dockColor), 0.4),
    [desktop.theme]
  );
  const currentBazaar = spaces.selected
    ? bazaar.getBazaar(spaces.selected?.path!)
    : null;

  const orderedList = useMemo(
    () => (currentBazaar ? currentBazaar.pinnedApps! : []),
    [currentBazaar && currentBazaar.pinnedApps]
  );

  const pinnedApps = useMemo(() => {
    console.log('pinnedApps updated. rerendering...');
    return (
      <Reorder.Group
        axis="x"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
        }}
        values={orderedList}
        onReorder={(newOrder: any) => {
          const newPinList = newOrder.map((app: any) => app.id);
          SpacesActions.setPinnedOrder(spaces.selected!.path, newPinList);
        }}
      >
        {orderedList.map((app: AppModelType | any, index: number) => {
          const selected = desktop.isActiveWindow(app.id);
          const open = !selected && desktop.isOpenWindow(app.id);
          return (
            <Reorder.Item
              key={`pinned-${app.id}-${spaces.selected?.path}`}
              value={app}
              style={{ zIndex: 1 }}
              initial={{
                opacity: 0.0,
              }}
              animate={{
                opacity: 1,
                transition: {
                  opacity: { duration: 0.25, delay: 0.5 },
                },
              }}
              exit={{
                opacity: 0.5,
                transition: {
                  opacity: { duration: 1, delay: 0 },
                },
              }}
              onClick={(evt: any) => {
                const selectedApp = app;
                if (desktop.isOpenWindow(selectedApp.id)) {
                  DesktopActions.setActive(
                    spaces.selected!.path,
                    selectedApp.id
                  );
                } else {
                  DesktopActions.openAppWindow(
                    spaces.selected!.path,
                    JSON.parse(JSON.stringify(selectedApp))
                  );
                }
              }}
              whileDrag={{ zIndex: 20 }}
            >
              <AppTile
                allowContextMenu
                contextPosition="above"
                tileSize="sm"
                app={app}
                selected={selected}
                open={open}
                onAppClick={(evt: any) => {
                  const selectedApp = app;
                  if (desktop.isOpenWindow(selectedApp.id)) {
                    DesktopActions.setActive(
                      spaces.selected!.path,
                      selectedApp.id
                    );
                  } else {
                    DesktopActions.openAppWindow(
                      spaces.selected!.path,
                      JSON.parse(JSON.stringify(selectedApp))
                    );
                  }
                }}
                contextMenu={[
                  {
                    label: 'Unpin',
                    onClick: (evt: any) => {
                      evt.stopPropagation();
                      SpacesActions.unpinApp(spaces.selected?.path!, app.id);
                    },
                  },
                  {
                    label: 'Close',
                    section: 2,
                    disabled: !open,
                    onClick: (evt: any) => {
                      DesktopActions.closeAppWindow(
                        spaces.selected?.path!,
                        JSON.parse(JSON.stringify(app))
                      );
                      evt.stopPropagation();
                    },
                  },
                ]}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    );
  }, [
    desktop.activeWindow?.id,
    desktop.openAppIds,
    spaces.selected?.path,
    currentBazaar && currentBazaar.pinnedApps,
  ]);

  const activeAndUnpinned = desktop.openApps.filter(
    (appWindow: any) =>
      currentBazaar &&
      currentBazaar.pinnedApps.findIndex(
        (pinned: any) => appWindow.id === pinned.id
      ) === -1
  );

  return (
    <Flex position="relative" flexDirection="row" alignItems="center">
      <AnimatePresence>
        {pinnedApps}
        {activeAndUnpinned.length ? (
          <Divider key="app-dock-divider" customBg={dividerBg} ml={2} mr={2} />
        ) : (
          []
        )}
      </AnimatePresence>
      <Flex position="relative" flexDirection="row" gap={8} alignItems="center">
        {activeAndUnpinned.map((unpinnedApp: any) => {
          const app = currentBazaar!.getAppData(unpinnedApp.id)!;
          const selected = desktop.isActiveWindow(app.id);
          const open = !selected && desktop.isOpenWindow(app.id);
          return (
            <AppTile
              key={`unpinned-${app.id}`}
              allowContextMenu
              contextPosition="above"
              tileSize="sm"
              app={app}
              selected={selected}
              open={open}
              contextMenu={[
                {
                  label: 'Pin',
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    SpacesActions.pinApp(spaces.selected?.path!, app.id);
                  },
                },
                {
                  label: 'Close',
                  disabled: !open,
                  section: 2,
                  onClick: (evt: any) => {
                    DesktopActions.closeAppWindow(
                      spaces.selected?.path!,
                      toJS(app)
                    );
                    evt.stopPropagation();
                  },
                },
              ]}
              onAppClick={(selectedApp: any) => {
                if (desktop.isOpenWindow(selectedApp.id)) {
                  DesktopActions.setActive(
                    spaces.selected!.path,
                    selectedApp.id
                  );
                } else {
                  DesktopActions.openAppWindow(
                    spaces.selected!.path,
                    JSON.parse(JSON.stringify(selectedApp))
                  );
                }
              }}
            />
          );
        })}
      </Flex>
    </Flex>
  );
});
