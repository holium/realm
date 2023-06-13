import { observer } from 'mobx-react';

import { App } from '../../../../../lexicon/src/App';

export const Lexicon = () => {
  return <App />;
};
export const LexiconApp = observer(Lexicon);
