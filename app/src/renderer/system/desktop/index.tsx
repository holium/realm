import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar/SystemBar';
import { WindowManager } from './WindowManager';
import { HomePane } from './components/Home';
import { useServices } from 'renderer/logic/store';
import { observer } from 'mobx-react';
import { TrayManager } from './TrayManager';
import { RoomsProvider, useRooms } from 'renderer/apps/Rooms/useRooms';

export const Desktop = observer(() => {
  const { ship, desktop } = useServices();
  const our = ship!.patp;
  const manager = useRooms(our);

  return (
    <RoomsProvider value={manager}>
      <Fill>
        <Layer zIndex={0}>
          <WindowManager />
        </Layer>
        <Layer zIndex={1}>{desktop.showHomePane && <HomePane />}</Layer>
        <Layer zIndex={12}>
          <Bottom size={56}>
            <SystemBar />
          </Bottom>
        </Layer>
        <Layer zIndex={13}>
          <TrayManager />
        </Layer>
      </Fill>
    </RoomsProvider>
  );
});

export default Desktop;
