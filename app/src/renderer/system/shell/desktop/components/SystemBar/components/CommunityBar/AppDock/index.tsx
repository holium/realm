import { FC, useCallback, useContext } from 'react';
import { Flex, Box, Grid } from '../../../../../../../../components';
import { AppModelType } from '../../../../../../../../../core/ship/stores/docket';
import { AppTile } from '../AppTile';
import { useMst, useShip } from '../../../../../../../../logic/store';

import { compose } from 'styled-system';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

interface AppTileProps {
  selected?: AppModelType;
  apps: AppModelType[];
}

export const AppDock: FC<AppTileProps> = observer((props: AppTileProps) => {
  const { apps, selected } = props;
  const { desktopStore, themeStore } = useMst();
  const { ship } = useShip();

  const activeAppId = desktopStore.activeApp?.id;

  const onAppClick = (app: AppModelType) => {
    // console.log(toJS(app));
    desktopStore.setActiveApp(app);
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
    console.log('open new window', windowPayload);
    // openNewWindow(windowPayload);
  };

  // console.log('activeAppId', activeAppId);

  return (
    <Flex gap={8} flexDirection="row" alignItems="center">
      {apps.map((app: AppModelType, index: number) => {
        console.log(
          'selected',
          app.href.glob.base,
          app.href.glob.base === activeAppId
        );
        return (
          <AppTile
            key={app.title + index}
            tileSize="sm"
            app={app}
            selected={app.href.glob.base === activeAppId}
            onAppClick={(selectedApp: AppModelType) => onAppClick(selectedApp)}
          />
        );
      })}
    </Flex>
  );
});
