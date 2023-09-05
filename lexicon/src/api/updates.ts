import { useStore } from '../store';
import { log } from '../utils';

// Copied from lexicon.service.ts
enum LEXICON_BEDROCK_TYPES {
  WORD = '/lexicon-word/0v4.fao37.8424p.trcih.kr5je.80jnn', // in dojo (sham (limo [['word' 't'] ~]))
  DEFINITION = '/lexicon-definition/0v3.omons.hajqb.643gt.jd474.8qoj1', //(sham (limo [['definition' 't'] ['word-id' 'id'] ~]))
  SENTENCE = '/lexicon-sentence/0v948nd.km7ue.1brbd.vqei5.hktbo', //(sham (limo [['sentence' 't'] ['word-id' 'id'] ~]))
  RELATED = '/lexicon-related/0v4.j76bl.v9ue2.9u19u.1mma8.641jf', //(sham (limo [['related' 't'] ['word-id' 'id'] ~]))
  VOTE = '/vote/0v3.hirga.bspbd.edlma.dfk59.gtu38',
}

const store = useStore.getState();

export const updateHandler = (updates: any[]) => {
  log('main update handler updates => ', updates);
  // execute doUpdate for each update
  updates?.forEach((up: any) => {
    doUpdate(up);
  });
};

const doUpdate = (update: any) => {
  // this is where we do the indvidual updates
  log('do single update => ', update);
  let actionName;
  try {
    //add row type (probably other ones too)
    actionName = update.change + update.row.type;
  } catch (e) {
    //delete row type
    actionName = update.change + update.type;
  }
  if (actionName) {
    switch (actionName) {
      case 'add-row' + LEXICON_BEDROCK_TYPES.WORD: {
        store.addWordRow(update.row);
        break;
      }
      case 'del-row' + LEXICON_BEDROCK_TYPES.WORD: {
        store.removeWordRow(update.id);
        break;
      }
      case 'add-row' + LEXICON_BEDROCK_TYPES.VOTE: {
        store.addVoteRow(update.row);
        break;
      }
      case 'del-row' + LEXICON_BEDROCK_TYPES.VOTE: {
        store.removeVoteRow(update.id);
        break;
      }
      case 'add-row' + LEXICON_BEDROCK_TYPES.DEFINITION: {
        store.addDefinitionRow(update.row);
        break;
      }
      case 'add-row' + LEXICON_BEDROCK_TYPES.SENTENCE: {
        store.addSentenceRow(update[0].row);
        break;
      }
    }
  }
};
