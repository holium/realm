import { observer } from 'mobx-react';
import { Node } from 'prosemirror-model';

import { useShipStore } from 'renderer/stores/ship.store';

import { Editor } from '../Editor/Editor';
import { NoteHeader } from '../NoteHeader/NoteHeader';
import { NoteViewCard, NoteViewContainer } from './NoteView.styles';

const NoteViewPresenter = () => {
  const { notesStore } = useShipStore();

  const { selectedNoteId, loading } = notesStore;

  if (!selectedNoteId) return null;

  const selectedNote = notesStore.getNoteById(selectedNoteId);

  const onBlurDoc = (doc: Node) => {
    if (!selectedNote) return;
    if (selectedNote.doc.eq(doc)) return;

    notesStore.editNoteInBedrock({
      id: selectedNote.id,
      doc,
      title: selectedNote.title,
      space: selectedNote.space,
    });
  };

  const onUnmountDoc = (doc: Node) => {
    if (!selectedNote) return;
    if (selectedNote.doc.eq(doc)) return;

    notesStore._updateNoteLocally({
      id: selectedNote.id,
      doc,
    });
  };

  const onClickDelete = async () => {
    if (!selectedNote) return;

    await notesStore.deleteNote({
      id: selectedNote.id,
      space: selectedNote.space,
    });
  };

  return (
    <NoteViewContainer>
      {selectedNote && (
        <NoteViewCard key={selectedNote.id}>
          <NoteHeader
            noteTitle={selectedNote.title}
            noteAuthor={selectedNote.author}
            noteUpdatedAt={selectedNote.updated_at}
            loading={loading}
            onClickDelete={onClickDelete}
          />
          <Editor
            doc={selectedNote.doc}
            onBlurDoc={onBlurDoc}
            onUnmountDoc={onUnmountDoc}
          />
        </NoteViewCard>
      )}
    </NoteViewContainer>
  );
};

export const NoteView = observer(NoteViewPresenter);
