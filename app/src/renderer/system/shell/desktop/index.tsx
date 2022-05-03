import { FC, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar';
import { useShip, useAuth } from '../../../logic/store';
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
  const { authStore } = useAuth();
  const { ship } = useShip();
  const [showDesktop, setShowDesktop] = useState(false);

  // const ship = useMemo(() => clone(shipStore.session!), [shipStore.session]);
  let theme;
  if (!hasLoaded) {
    theme = authStore.selected!.theme;
  } else {
    theme = ship!.theme;
  }
  const onHome = useMemo(
    () => () => setShowDesktop(!showDesktop),
    [showDesktop]
  );
  // {
  //   showDesktop && (
  //     <AppWindow theme={theme}>
  //       {/* @ts-expect-error */}
  //       <Browser theme={theme} />
  //     </AppWindow>
  //   );
  // }
  return (
    <Fill>
      <AnimatePresence>
        {showDesktop && (
          <AppWindow theme={theme}>
            <Browser theme={theme} />
          </AppWindow>
        )}
      </AnimatePresence>
      <Layer zIndex={1}>
        <Bottom size={58}>
          <SystemBar onHome={onHome} />
        </Bottom>
      </Layer>
    </Fill>
  );
});

export default Desktop;
