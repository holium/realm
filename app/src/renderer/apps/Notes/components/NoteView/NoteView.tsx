import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { Editor } from '../Editor/Editor';
import { NoteHeader } from '../NoteHeader/NoteHeader';
import { NoteViewCard, NoteViewContainer } from './NoteView.styles';

const NoteViewPresenter = () => {
  const { notesStore } = useShipStore();

  const { selectedNoteId } = notesStore;

  return (
    <NoteViewContainer>
      {selectedNoteId && (
        <NoteViewCard key={selectedNoteId}>
          <NoteHeader />
          <Editor />
        </NoteViewCard>
      )}
    </NoteViewContainer>
  );
};

export const NoteView = observer(NoteViewPresenter);
