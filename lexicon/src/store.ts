import create from 'zustand';

import {
  DefinitionRow,
  SentenceRow,
  VoteRow,
  WordRow,
} from './api/types/bedrock';

export interface Store {
  api: any;
  setApi: (api: any) => void;

  shipName: string;
  setShipName: (shipName: string) => void;

  addModalOpen: boolean;
  setAddModalOpen: (addModalOpen: boolean) => void;

  space: null | string;
  setSpace: (space: string) => void;

  wordRows: WordRow[];
  setWordRows: (wordRows: WordRow[]) => void;

  addWordRow: (newWordRow: WordRow) => void;

  removeWordRow: (rowId: any) => void;

  voteRows: VoteRow[];
  setVoteRows: (voteRows: VoteRow[]) => void;

  addVoteRow: (newVoteRow: VoteRow) => void;
  removeVoteRow: (rowId: string) => void;

  voteMap: any;
  setVoteMap: (voteMap: any) => void;

  definitionVoteMap: any;
  setDefinitionVoteMap: (definitionVoteMap: any) => void;

  sentenceVoteMap: any;
  setSentenceVoteMap: (sentenceVoteMap: any) => void;

  definitionRows: DefinitionRow[];
  setDefinitionRows: (definitionRows: DefinitionRow[]) => void;

  definitionMap: any;
  setDefinitionMap: (definitionMap: any) => void;

  addDefinitionRow: (newDefinitionRow: DefinitionRow) => void;

  sentenceRows: SentenceRow[];
  setSentenceRows: (sentenceRows: SentenceRow[]) => void;

  addSentenceRow: (newSentenceRow: SentenceRow) => void;

  sentenceMap: any;
  setSentenceMap: (sentenceMap: any) => void;

  wordMap: any;
  setWordMap: (wordMap: any) => void;

  mostVotedDefinitionMap: any;
  setMostVotedDefinitionMap: (mostVotedDefinitionMap: any) => void;

  wordList: any;
  setWordList: (wordList: any) => void;

  loadingMain: boolean;
  setLoadingMain: (loadingMain: boolean) => void;
}

export const useStore = create<Store>((set, get) => ({
  api: null, //set to the LexiconIPC passed down from Realm
  setApi: (api: any) => set({ api }),

  shipName: '',
  setShipName: (shipName: string) => set({ shipName }),

  addModalOpen: false,
  setAddModalOpen: (addModalOpen: boolean) => set({ addModalOpen }),

  space: null,
  setSpace: (space: string) => set({ space }),

  wordRows: [],
  setWordRows: (wordRows: any) => set({ wordRows }),

  addWordRow: (newWordRow: any) => {
    const newWordRows = [...get().wordRows];

    const fixedWordRow = {
      ...newWordRow,
      created_at: newWordRow['created-at'],
      received_at: newWordRow['received-at'],
      updated_at: newWordRow['updated-at'],
      word: newWordRow.data.word,
    };
    newWordRows.push(fixedWordRow);
    set({
      wordRows: newWordRows,
    });
  },

  removeWordRow: (rowId: string) => {
    const newWordRows = [...get().wordRows].filter(
      (item: any) => item.id !== rowId
    );
    set({
      wordRows: newWordRows,
    });
  },

  voteRows: [],
  setVoteRows: (voteRows: VoteRow[]) => set({ voteRows }),

  addVoteRow: (newVoteRow: any) => {
    const newVoteRows = [...get().voteRows];

    const fixedVoteRow = {
      ...newVoteRow,
      parent_id: newVoteRow.data['parent-id'],
      parent_type: newVoteRow.data['parent-type'],
      parent_path: newVoteRow.data['parent-path'],
      created_at: newVoteRow['created-at'],
      received_at: newVoteRow['received-at'],
      updated_at: newVoteRow['updated-at'],
      up: newVoteRow.data.up,
    };
    newVoteRows.push(fixedVoteRow);
    set({
      voteRows: newVoteRows,
    });
  },

  removeVoteRow: (rowId: string) => {
    const newVoteRows = [...get().voteRows].filter(
      (item: any) => item.id !== rowId
    );
    set({
      voteRows: newVoteRows,
    });
  },

  voteMap: new Map(),
  setVoteMap: (voteMap: any) => set({ voteMap }),

  definitionVoteMap: new Map(),
  setDefinitionVoteMap: (definitionVoteMap: any) => set({ definitionVoteMap }),

  sentenceVoteMap: new Map(),
  setSentenceVoteMap: (sentenceVoteMap: any) => set({ sentenceVoteMap }),

  definitionRows: [],
  setDefinitionRows: (definitionRows: DefinitionRow[]) =>
    set({ definitionRows }),

  addDefinitionRow: (newDefinitionRow: any) => {
    const newDefinitionRows = [...get().definitionRows];

    const fixedDefinitionRow = {
      ...newDefinitionRow,
      created_at: newDefinitionRow['created-at'],
      received_at: newDefinitionRow['received-at'],
      updated_at: newDefinitionRow['updated-at'],
      word_id: newDefinitionRow.data['word-id'],
      definition: newDefinitionRow.data.definition,
    };
    newDefinitionRows.push(fixedDefinitionRow);

    set({
      definitionRows: newDefinitionRows,
    });
  },
  definitionMap: new Map(),
  setDefinitionMap: (definitionMap: any) => set({ definitionMap }),

  sentenceRows: [],
  setSentenceRows: (sentenceRows: SentenceRow[]) => set({ sentenceRows }),

  addSentenceRow: (newSentenceRow: any) => {
    const newSentenceRows = [...get().sentenceRows];

    const fixedSentenceRow = {
      ...newSentenceRow,
      created_at: newSentenceRow['created-at'],
      received_at: newSentenceRow['received-at'],
      updated_at: newSentenceRow['updated-at'],
      word_id: newSentenceRow.data['word-id'],
      sentence: newSentenceRow.data.sentence,
    };
    newSentenceRows.push(fixedSentenceRow);

    set({
      sentenceRows: newSentenceRows,
    });
  },

  sentenceMap: new Map(),
  setSentenceMap: (sentenceMap: any) => set({ sentenceMap }),

  wordMap: new Map(),
  setWordMap: (wordMap: any) => set({ wordMap }),

  wordList: [],
  setWordList: (wordList: any) => set({ wordList }),

  mostVotedDefinitionMap: new Map(),
  setMostVotedDefinitionMap: (mostVotedDefinitionMap: any) =>
    set({ mostVotedDefinitionMap }),

  loadingMain: true,
  setLoadingMain: (loadingMain: boolean) => set({ loadingMain }),
}));
