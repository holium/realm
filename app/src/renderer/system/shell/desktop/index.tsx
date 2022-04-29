import { FC, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Bottom, Layer, Fill, Top } from 'react-spaces';
import { SystemBar } from './components/SystemBar';
import { AppGrid } from './components/AppGrid';
import { useMst } from '../../../logic/store';
import AppWindow from './components/AppWindow';
import { clone } from 'mobx-state-tree';
import { Browser } from '../../apps/Browser';
import { AnimatePresence } from 'framer-motion';

type OSFrameProps = {
  isFullscreen?: boolean;
  hasWallpaper?: boolean;
};

export const Desktop: FC<OSFrameProps> = observer((props: OSFrameProps) => {
  const { shipStore } = useMst();
  const [showDesktop, setShowDesktop] = useState(false);

  const ship = useMemo(() => clone(shipStore.session!), [shipStore.session]);

  const theme = {
    backgroundColor: ship.theme.backgroundColor,
    textColor: '#EDE6E1',
  };
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
            {/* @ts-expect-error */}
            <Browser theme={theme} />
          </AppWindow>
        )}
      </AnimatePresence>

      <Layer zIndex={1}>
        <Bottom size={58}>
          <SystemBar onHome={() => setShowDesktop(!showDesktop)} />
        </Bottom>
      </Layer>
    </Fill>
  );
});

export default Desktop;
