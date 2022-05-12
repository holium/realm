import { FC } from 'react';
import { observer } from 'mobx-react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar';
import { useShip, useAuth } from '../../../logic/store';
import { AnimatePresence } from 'framer-motion';
import { WindowManager } from './WindowManager';

type OSFrameProps = {
  hasLoaded?: boolean;
  isFullscreen?: boolean;
  hasWallpaper?: boolean;
};

export const Desktop: FC<OSFrameProps> = observer((props: OSFrameProps) => {
  const { hasLoaded } = props;
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
});

export default Desktop;
