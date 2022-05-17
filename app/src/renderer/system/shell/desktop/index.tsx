import { FC } from 'react';
import { observer } from 'mobx-react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar';
import { AnimatePresence } from 'framer-motion';
import { WindowManager } from './WindowManager';

type OSFrameProps = {
  hasLoaded?: boolean;
  isFullscreen?: boolean;
  hasWallpaper?: boolean;
};

export const Desktop: FC<OSFrameProps> = (props: OSFrameProps) => {
  const { hasLoaded } = props;

  return (
    <Fill>
      <Layer zIndex={1}>
        <AnimatePresence>
          <WindowManager />
        </AnimatePresence>
      </Layer>
      <Layer zIndex={2}>
        <Bottom size={58}>
          <SystemBar onHome={() => {}} />
        </Bottom>
      </Layer>
    </Fill>
  );
};

export default Desktop;
