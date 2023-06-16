import { observer } from 'mobx-react';

import { Lexicon } from '@holium/lexicon';

import { useAppState } from 'renderer/stores/app.store';
import { LexiconIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

const LexiconAppPresenter = () => {
  const { loggedInAccount } = useAppState();
  const { lexiconStore, spacesStore } = useShipStore();
  const selectedSpace = spacesStore.selected;

  return (
    <Lexicon
      shipName={loggedInAccount?.serverId ?? ''}
      update={lexiconStore.update}
      lexiconIPC={LexiconIPC}
      selectedSpace={selectedSpace?.path ?? ''}
    />
  );
};

export const LexiconApp = observer(LexiconAppPresenter);
