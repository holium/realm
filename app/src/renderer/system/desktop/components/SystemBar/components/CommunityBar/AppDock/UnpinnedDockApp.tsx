import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';

import { AppTile, AppTileType, bgIsLightOrDark } from '@holium/design-system';

import { useContextMenu } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import {
  AppMobxType,
  InstallStatus,
} from 'renderer/stores/models/bazaar.model';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';
import { useShipStore } from 'renderer/stores/ship.store';

type Props = {
  tileId: string;
  app: AppMobxType;
  space?: SpaceModelType;
  isActive: boolean;
  isMinimized: boolean;
  onClick: (app: AppMobxType) => void;
};

export const UnpinnedDockAppPresenter = ({
  tileId,
  app,
  space,
  isActive,
  isMinimized,
  onClick,
}: Props) => {
  const { shellStore } = useAppState();
  const { bazaarStore } = useShipStore();

  const appRef = bazaarStore.catalog.get(app.id);
  // TODO need to cleanup and use a ref for the app here

  const { getOptions, setOptions, getColors, setColors } = useContextMenu();

  const contextMenuOptions = useMemo(
    () => [
      {
        id: `${app.id}-pin}`,
        label: 'Pin',
        onClick: () => {
          space?.pinApp(app.id);
        },
      },
      {
        id: isMinimized ? `${app.id}-show}` : `${app.id}-hide}`,
        label: isMinimized ? 'Show' : 'Hide',
        section: 2,
        onClick: () => shellStore.toggleMinimized(app.id),
      },
      {
        id: `${app.id}-close}`,
        label: 'Close',
        section: 2,
        onClick: () => app && shellStore.closeWindow(app.id),
      },
    ],
    [isActive, isMinimized]
  );

  const contextMenuColors = useMemo(() => {
    const isLight = bgIsLightOrDark(app.color) === 'light';
    const textColor = isLight
      ? 'rgba(51, 51, 51, 0.8)'
      : 'rgba(255, 255, 255, 0.8)';
    return { textColor, backgroundColor: app.color };
  }, [app.color]);

  useEffect(() => {
    if (contextMenuOptions && contextMenuOptions !== getOptions(tileId)) {
      setOptions(tileId, contextMenuOptions);
    }

    if (contextMenuColors && contextMenuColors !== getColors(tileId)) {
      setColors(tileId, contextMenuColors);
    }
  }, [
    contextMenuColors,
    contextMenuOptions,
    getColors,
    getOptions,
    setColors,
    setOptions,
    tileId,
  ]);
  return (
    <AppTile
      key={app.id}
      tileId={tileId}
      tileSize="sm"
      app={app}
      installStatus={appRef?.installStatus as InstallStatus}
      isOpen={true}
      isActive={isActive}
      onAppClick={(app: AppTileType) => onClick(app as AppMobxType)}
    />
  );
};
export const UnpinnedDockApp = observer(UnpinnedDockAppPresenter);
