import { FC, useMemo } from 'react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar/SystemBar';
import { WindowManager } from './WindowManager';
import { AppGrid } from './components/AppGrid';
// import { useMst } from 'renderer/logic/store';
import { useServices } from 'renderer/logic/store';
import { observer } from 'mobx-react';
import { DialogManager } from '../modals/DialogManager';

type OSFrameProps = {
  hasLoaded?: boolean;
  isFullscreen?: boolean;
  hasWallpaper?: boolean;
};

export const Desktop: FC<OSFrameProps> = observer((props: OSFrameProps) => {
  const { hasLoaded } = props;
  const { shell } = useServices();
  const { desktop } = shell;

  const DialogLayer = useMemo(
    () => <DialogManager dialogId={desktop.dialogId} />,
    [desktop.dialogId]
  );

  return hasLoaded ? (
    <Fill>
      <Layer zIndex={1}>
        <Layer zIndex={2}>
          <Layer zIndex={2}>{DialogLayer}</Layer>
          <Layer zIndex={0}>
            <WindowManager isOpen={!desktop.showHomePane} />
          </Layer>
          <Layer zIndex={1}>
            {desktop.showHomePane && <AppGrid isOpen={desktop.showHomePane} />}
          </Layer>
        </Layer>
      </Layer>
      <Layer zIndex={12}>
        <Bottom size={58}>
          <SystemBar />
        </Bottom>
      </Layer>
    </Fill>
  ) : null;
});

export default Desktop;
