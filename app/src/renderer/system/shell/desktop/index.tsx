import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Bottom, Layer, Fill, Top } from 'react-spaces';
import { SystemBar } from './components/system-bar';
import { AppGrid } from './components/app-grid';
import { useMst } from '../../../logic/store';

type OSFrameProps = {
  isFullscreen: boolean;
  hasWallpaper?: boolean;
};

export const Desktop: FC<OSFrameProps> = observer((props: OSFrameProps) => {
  const { isFullscreen } = props;
  // const { shipStore } = useMst();
  useEffect(() => {
    // !shipStore.isLoading && spaceStore.getApps();
  }, []);

  return (
    <Fill>
      {!isFullscreen && (
        <Top
          size={30}
          // @ts-expect-error this error should be disabled
          style={{ WebkitAppRegion: 'drag', appRegion: 'drag' }}
        />
      )}
      <Fill></Fill>
      <Layer zIndex={1}>
        <Bottom size={58}>
          <SystemBar />
        </Bottom>
      </Layer>
    </Fill>
  );
});

export default Desktop;
