import { FC } from 'react';
import { observer } from 'mobx-react';
import { Bottom, Layer, Fill, Top } from 'react-spaces';
import { SystemBar } from './components/system-bar';

type OSFrameProps = {
  isFullscreen: boolean;
  hasWallpaper?: boolean;
};

export const Desktop: FC<OSFrameProps> = observer((props: OSFrameProps) => {
  const { isFullscreen } = props;
  // const { shipStore, configStore } = useMst();

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
