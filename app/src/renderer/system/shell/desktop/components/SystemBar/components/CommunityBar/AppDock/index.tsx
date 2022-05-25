import { FC } from 'react';
import { Flex } from '../../../../../../../../components';
import { AppModelType } from '../../../../../../../../../core/ship/stores/docket';
import { AppTile } from '../../../../../../../../components/AppTile';
import {
  useMst,
  useShip,
  useSpaces,
} from '../../../../../../../../logic/store';

import { toJS } from 'mobx';
import { observer } from 'mobx-react';

interface AppTileProps {
  selected?: AppModelType;
}

export const AppDock: FC<AppTileProps> = observer(() => {
  const { desktopStore, themeStore } = useMst();
  const spacesStore = useSpaces();

  const { ship } = useShip();

  const activeWindowId = desktopStore.activeWindow
    ? desktopStore.activeWindow.id
    : null;

  const onAppClick = (app: AppModelType) => {
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

    desktopStore.openBrowserWindow(app, windowPayload);
  };

  // console.log('activeWindowId', activeWindowId);

  return (
    <Flex gap={8} flexDirection="row" alignItems="center">
      {spacesStore.selected
        ? spacesStore.selected.pinnedApps.map(
            (app: AppModelType, index: number) => {
              // console.log(
              //   'selected',
              //   app.href.glob.base,
              //   app.href.glob.base === activeWindowId
              // );
              return (
                <AppTile
                  key={app.title + index}
                  tileSize="sm"
                  app={app}
                  selected={app.id === activeWindowId}
                  onAppClick={(selectedApp: AppModelType) =>
                    onAppClick(selectedApp)
                  }
                />
              );
            }
          )
        : []}
    </Flex>
  );
});
