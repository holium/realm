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
  const { desktop, spaces } = useServices();

  const dividerBg = useMemo(
    () => rgba(lighten(0.2, desktop.theme.dockColor), 0.4),
    [desktop.theme]
  );

  const orderedList = useMemo(
    () => (spaces.selected ? spaces.selected.pinnedApps! : []),
    [
      spaces.selected?.path,
      spaces.selected?.apps.pinned,
      spaces.selected?.pinnedApps,
    ]
  );

  const pinnedApps = useMemo(() => {
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
          SpacesActions.setPinnedOrder(newPinList);
        }}
      >
        {orderedList.map((app: AppModelType | any, index: number) => {
          const selected = desktop.isActiveWindow(app.id);
          const open = !selected && desktop.isOpenWindow(app.id);
          return (
            <Reorder.Item
              key={`${app.id}-${spaces.selected?.path}`}
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
                  // desktop.setActive(selectedApp.id);
                } else {
                  DesktopActions.openAppWindow(
                    spaces.selected!.path,
                    toJS(selectedApp)
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
                    onClick: (evt: any) => {
                      DesktopActions.closeAppWindow(
                        spaces.selected?.path!,
                        toJS(app)
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
    spaces.selected?.apps.pinned,
    spaces.selected?.pinnedApps,
  ]);

  const activeAndUnpinned = desktop.openApps.filter(
    (appWindow: any) =>
      spaces.selected &&
      spaces.selected.pinnedApps.findIndex(
        (pinned: any) => appWindow.id === pinned.id
      ) === -1
  );

  return (
    <Flex position="relative" flexDirection="row" alignItems="center">
      <AnimatePresence>
        {pinnedApps}
        {activeAndUnpinned.length ? (
          <Divider customBg={dividerBg} ml={2} mr={2} />
        ) : (
          []
        )}
      </AnimatePresence>
      <Flex position="relative" flexDirection="row" gap={8} alignItems="center">
        {activeAndUnpinned.map((unpinnedApp: any) => {
          const app = spaces.selected?.getAppData(unpinnedApp.id)!;
          console.log(toJS(spaces.selected));
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
                  label: 'Unpin',
                  onClick: (evt: any) => {
                    evt.stopPropagation();
                    SpacesActions.unpinApp(spaces.selected?.path!, app.id);
                  },
                },
                {
                  label: 'Close',
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
                    selectedApp
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
