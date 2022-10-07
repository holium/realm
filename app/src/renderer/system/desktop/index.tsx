import { FC, useEffect, useMemo } from 'react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar/SystemBar';
import { WindowManager } from './WindowManager';
import { HomePane } from './components/Home';
// import { useMst } from 'renderer/logic/store';
import { useServices } from 'renderer/logic/store';
import { observer } from 'mobx-react';
import { LiveRoom } from 'renderer/apps/store';
import { TrayManager } from './TrayManager';

type OSFrameProps = {
  isFullscreen?: boolean;
};

export const Desktop: FC<OSFrameProps> = observer((props: OSFrameProps) => {
  const { desktop } = useServices();

  useEffect(() => {
    () => {
      LiveRoom.leave();
    };
  }, []);
  return (
    <Fill>
      <Layer zIndex={0}>
        <WindowManager isOpen={!desktop.showHomePane} />
      </Layer>
      <Layer zIndex={1}>
        {desktop.showHomePane && <HomePane isOpen={desktop.showHomePane} />}
      </Layer>
      <Layer zIndex={12}>
        <Bottom size={58}>
          <SystemBar />
        </Bottom>
      </Layer>
      <Layer zIndex={13}>
        <TrayManager />
      </Layer>
    </Fill>
  );
});

export default Desktop;
