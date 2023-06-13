import { observer } from 'mobx-react';

import { App } from '@holium/lexicon';

const LexiconAppPresenter = () => {
  return <App />;
};

export const LexiconApp = observer(LexiconAppPresenter);
