import { observer } from 'mobx-react';

import { Trove } from '@holium/trove';

import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

const TroveAppPresenter = () => {
  const { loggedInAccount } = useAppState();
  const { spacesStore } = useShipStore();
  const selectedSpace = spacesStore.selected;
  return (
    <Trove
      shipName={loggedInAccount?.serverId ?? ''}
      selectedSpace={selectedSpace?.path ?? ''}
    />
  );
};

export const TroveApp = observer(TroveAppPresenter);
