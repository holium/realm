import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { Editor } from '../Editor/Editor';
import { NoteHeader } from '../NoteHeader/NoteHeader';
import { NoteViewCard, NoteViewContainer } from './NoteView.styles';

const NoteViewPresenter = () => {
  const { notesStore } = useShipStore();

  const { selectedNote } = notesStore;

  return (
    <NoteViewContainer>
      {selectedNote && (
        <NoteViewCard key={selectedNote.id}>
          <NoteHeader
            noteTitle={selectedNote.title}
            noteAuthor={selectedNote.author}
            onClickDelete={() => {
              // NotesIPC.deleteNote(selectedNote.id);
            }}
          />
          <Editor
            noteId={selectedNote.id}
            noteTitle={selectedNote.title}
            noteDoc={selectedNote.doc}
          />
        </NoteViewCard>
      )}
    </NoteViewContainer>
  );
};

export const NoteView = observer(NoteViewPresenter);
