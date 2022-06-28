import { FC } from 'react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar';
import { WindowManager } from './WindowManager';
import { AppGrid } from './components/AppGrid';
// import { useMst } from 'renderer/logic/store';
import { useServices } from 'renderer/logic/store';
import { Observer } from 'mobx-react';

type OSFrameProps = {
  hasLoaded?: boolean;
  isFullscreen?: boolean;
  hasWallpaper?: boolean;
};

export const Desktop: FC<OSFrameProps> = (props: OSFrameProps) => {
  const { hasLoaded } = props;
  const { shell } = useServices();
  const { desktop } = shell;

  return hasLoaded ? (
    <Fill>
      <Layer zIndex={1}>
        <Observer>
          {() => (
            <Layer zIndex={1}>
              <Layer zIndex={0}>
                <WindowManager isOpen={!desktop.showHomePane} />
              </Layer>
              <Layer zIndex={1}>
                {desktop.showHomePane && (
                  <AppGrid isOpen={desktop.showHomePane} />
                )}
              </Layer>
            </Layer>
          )}
        </Observer>
      </Layer>
      <Layer zIndex={12}>
        <Bottom size={58}>
          <SystemBar />
        </Bottom>
      </Layer>
    </Fill>
  ) : null;
};

export default Desktop;
