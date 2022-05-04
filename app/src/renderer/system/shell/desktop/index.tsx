import { FC, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar';
import { useShip, useAuth, useMst } from '../../../logic/store';
import AppWindow from './components/AppWindow';
import { Browser } from '../../apps/Browser';
import { AnimatePresence } from 'framer-motion';

type OSFrameProps = {
  hasLoaded?: boolean;
  isFullscreen?: boolean;
  hasWallpaper?: boolean;
};

export const Desktop: FC<OSFrameProps> = observer((props: OSFrameProps) => {
  const { hasLoaded } = props;
  const { desktopStore } = useMst();
  const { authStore } = useAuth();
  const { ship } = useShip();

  let theme;
  if (!hasLoaded) {
    theme = authStore.selected!.theme;
  } else {
    theme = ship!.theme;
  }

  return (
    <Fill>
      <AnimatePresence>
        {desktopStore.hasOpenWindow && (
          <AppWindow theme={theme}>
            <Browser theme={theme} />
          </AppWindow>
        )}
      </AnimatePresence>
      <Layer zIndex={1}>
        <Bottom size={58}>
          <SystemBar
            onHome={() =>
              desktopStore.activeApp
                ? desktopStore.closeApp(desktopStore.activeApp?.id)
                : {}
            }
          />
        </Bottom>
      </Layer>
    </Fill>
  );
});

export default Desktop;
