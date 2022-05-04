import { FC } from 'react';
import { Flex, Box, Grid } from '../../../../../../../../components';
import { AppModelType } from '../../../../../../../../../core/ship/stores/docket';
import { AppTile } from '../AppTile';
import { useMst } from '../../../../../../../../logic/store';

import { compose } from 'styled-system';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

interface AppTileProps {
  selected?: AppModelType;
  apps: AppModelType[];
}

export const AppDock: FC<AppTileProps> = observer((props: AppTileProps) => {
  const { apps, selected } = props;
  const { desktopStore } = useMst();

  const activeAppId = desktopStore.activeApp?.id;

  const onAppClick = (app: AppModelType) => {
    // console.log(toJS(app));
    desktopStore.setActiveApp(app);
  };
  console.log('activeAppId', activeAppId);

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
