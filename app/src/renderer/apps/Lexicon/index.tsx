import { observer } from 'mobx-react';

import { App } from '@holium/lexicon';

import { useAppState } from 'renderer/stores/app.store';
import { LexiconIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

const LexiconAppPresenter = () => {
  const { loggedInAccount } = useAppState();
  const { lexiconStore, spacesStore } = useShipStore();
  const selectedSpace = spacesStore.selected;

  return (
    <App
      shipName={loggedInAccount?.serverId ?? ''}
      update={lexiconStore.update}
      lexiconApi={LexiconIPC}
      selectedSpace={selectedSpace?.path ?? ''}
    />
  );
};

export const LexiconApp = observer(LexiconAppPresenter);
