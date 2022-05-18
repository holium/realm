import { FC, useState } from 'react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar';
import { AnimatePresence } from 'framer-motion';
import { WindowManager } from './WindowManager';
import { AppGrid } from './components/AppGrid';
import { useMst } from 'renderer/logic/store';
import { Observer } from 'mobx-react';

type OSFrameProps = {
  hasLoaded?: boolean;
  isFullscreen?: boolean;
  hasWallpaper?: boolean;
};

export const Desktop: FC<OSFrameProps> = (props: OSFrameProps) => {
  const { hasLoaded } = props;
  const { desktopStore } = useMst();

  return (
    <Fill>
      <Layer zIndex={1}>
        <Observer>
          {() => (
            <Layer zIndex={1}>
              <Layer zIndex={0}>
                <WindowManager isOpen={!desktopStore.showHomePane} />
              </Layer>
              <Layer zIndex={1}>
                <AppGrid isOpen={desktopStore.showHomePane} />
              </Layer>
            </Layer>
          )}
        </Observer>
        {/* {desktopStore.showHomePane ? <AppGrid /> : <WindowManager />} */}
      </Layer>
      <Layer zIndex={2}>
        <Bottom size={58}>
          <SystemBar />
        </Bottom>
      </Layer>
    </Fill>
  );
};

export default Desktop;
