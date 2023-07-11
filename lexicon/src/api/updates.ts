import { useStore } from '../store';
import { log } from '../utils';
const store = useStore.getState();

export const updateHandler = (update: any) => {
  log('main update handler => ', update);
  let actionName;
  try {
    //add row type (probably other ones too)
    actionName = update[0].change + '-' + update[0].row.type;
  } catch (e) {
    //delete row type
    actionName = update[0].change + '-' + update[0].type;
  }

  if (actionName) {
    switch (actionName) {
      case 'add-row-lexicon-word': {
        store.addWordRow(update[0].row);
        break;
      }
      case 'del-row-lexicon-word': {
        store.removeWordRow(update[0].id);
        break;
      }
      case 'add-row-vote': {
        store.addVoteRow(update[0].row);
        break;
      }
      case 'del-row-vote': {
        store.removeVoteRow(update[0].id);
        break;
      }
      case 'add-row-lexicon-definition': {
        store.addDefinitionRow(update[0].row);
        break;
      }
      case 'add-row-lexicon-sentence': {
        store.addSentenceRow(update[0].row);
        break;
      }
    }
  }
};
