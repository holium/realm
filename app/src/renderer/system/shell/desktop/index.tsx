import { FC, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar';
import { useShip, useAuth, useMst } from '../../../logic/store';
import AppWindow from './components/AppWindow';
import { AnimatePresence } from 'framer-motion';

type OSFrameProps = {
  hasLoaded?: boolean;
  isFullscreen?: boolean;
  hasWallpaper?: boolean;
};

export const Desktop: FC<OSFrameProps> = observer((props: OSFrameProps) => {
  const { hasLoaded, isFullscreen } = props;
  const { desktopStore } = useMst();
  const { authStore } = useAuth();
  const { ship } = useShip();

  let theme: any;
  if (!hasLoaded) {
    theme = authStore.selected!.theme;
  } else {
    theme = ship!.theme;
  }

  return (
    <Fill>
      <Layer zIndex={1}>
        <AnimatePresence>
          {desktopStore.hasOpenWindow && <AppWindow theme={theme} />}
          {/* <WinManager render={windowRenderer}> */}
          {/* {loading && <Loading />} */}
          {/* {statuses && (
            <Grid
              container
              spacing={3}
              direction="column"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                p: 2,
                width: 'auto',
                maxWidth: '100%',
              }}
            >
              {statuses.map((status) => (
                <Grid item key={status.system}>
                  <System systemId={status.system} />
                </Grid>
              ))}
            </Grid>
          )} */}
          {/* </WinManager> */}
        </AnimatePresence>
      </Layer>
      <Layer zIndex={2}>
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
