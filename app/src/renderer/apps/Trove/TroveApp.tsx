import { observer } from 'mobx-react';

import { Trove } from '@holium/trove';

import { useStorage } from 'renderer/lib/useStorage';
import { useAppState } from 'renderer/stores/app.store';
import { ShipIPC, TroveIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

const TroveAppPresenter = () => {
  const { loggedInAccount } = useAppState();
  const { troveStore, spacesStore } = useShipStore();
  const selectedSpace = spacesStore.selected;
  return (
    <Trove
      shipName={loggedInAccount?.serverId ?? ''}
      selectedSpace={selectedSpace?.path ?? ''}
      update={troveStore.update}
      TroveIPC={TroveIPC}
      useStorage={useStorage}
      uploadFile={ShipIPC.uploadFile}
    />
  );
};

export const TroveApp = observer(TroveAppPresenter);
