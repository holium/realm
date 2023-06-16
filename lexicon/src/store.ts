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
    newWordRows.push(newWordRow);
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

  addVoteRow: (newVoteRow: VoteRow) => {
    const newVoteRows = [...get().voteRows];
    newVoteRows.push(newVoteRow);
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

  addDefinitionRow: (newDefinitionRow: DefinitionRow) => {
    const newDefinitionRows = [...get().definitionRows];
    newDefinitionRows.push(newDefinitionRow);

    set({
      definitionRows: newDefinitionRows,
    });
  },
  definitionMap: new Map(),
  setDefinitionMap: (definitionMap: any) => set({ definitionMap }),

  sentenceRows: [],
  setSentenceRows: (sentenceRows: SentenceRow[]) => set({ sentenceRows }),

  addSentenceRow: (newSentenceRow: SentenceRow) => {
    const newSentenceRows = [...get().sentenceRows];
    newSentenceRows.push(newSentenceRow);

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
