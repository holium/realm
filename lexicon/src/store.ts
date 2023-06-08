import create from 'zustand';

interface Store {
  addModalOpen: boolean;
  setAddModalOpen: (addModalOpen: boolean) => void;

  space: null | string;
  setSpace: (space: string) => void;

  wordRows: any;
  setWordRows: (wordRows: any) => void;

  addWordRow: (newWordRow: any) => void;

  voteRows: any;
  setVoteRows: (voteRows: any) => void;

  addVoteRow: (newVoteRow: any) => void;
  removeVoteRow: (rowId: string) => void;
}

export const useStore = create<Store>((set, get) => ({
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

  voteRows: [],
  setVoteRows: (voteRows: any) => set({ voteRows }),

  addVoteRow: (newVoteRow: any) => {
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
}));
