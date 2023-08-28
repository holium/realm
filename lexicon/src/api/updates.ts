import { useStore } from '../store';
import { log } from '../utils';
const store = useStore.getState();

export const updateHandler = (update: any) => {
  log('main update handler => ', update);
  let actionName;
  try {
    //add row type (probably other ones too)
    actionName = update[0].change + update[0].row.type;
  } catch (e) {
    //delete row type
    actionName = update[0].change + update[0].type;
  }
  /*
   These "row-types" (ex: /lexicon-word/0v4.fao37.8424p.trcih.kr5je.80jnn) 
   are predefined in lexicon.services.ts as enum LEXICON_BEDROCK_TYPES
   and are treated as static strings
  */

  if (actionName) {
    switch (actionName) {
      case 'add-row/lexicon-word/0v4.fao37.8424p.trcih.kr5je.80jnn': {
        store.addWordRow(update[0].row);
        break;
      }
      case 'del-row/lexicon-word/0v4.fao37.8424p.trcih.kr5je.80jnn': {
        store.removeWordRow(update[0].id);
        break;
      }
      case 'add-row/vote/0v3.hirga.bspbd.edlma.dfk59.gtu38': {
        store.addVoteRow(update[0].row);
        break;
      }
      case 'del-row/vote/0v3.hirga.bspbd.edlma.dfk59.gtu38': {
        store.removeVoteRow(update[0].id);
        break;
      }
      case 'add-row/lexicon-definition/0v3.omons.hajqb.643gt.jd474.8qoj1': {
        store.addDefinitionRow(update[0].row);
        break;
      }
      case 'add-row/lexicon-sentence/0v948nd.km7ue.1brbd.vqei5.hktbo': {
        store.addSentenceRow(update[0].row);
        break;
      }
    }
  }
};
