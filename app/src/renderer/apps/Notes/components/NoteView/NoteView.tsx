import { observer } from 'mobx-react';

import { useToggle } from '@holium/design-system/util';

import { JSONObject } from 'os/types';
import { useShipStore } from 'renderer/stores/ship.store';

import { Editor } from '../Editor/Editor';
import { NoteHeader } from '../NoteHeader/NoteHeader';
import { NoteViewCard, NoteViewContainer } from './NoteView.styles';

const NoteViewPresenter = () => {
  const saving = useToggle(false);
  const deleting = useToggle(false);

  const { notesStore } = useShipStore();

  const { selectedNoteId } = notesStore;

  if (!selectedNoteId) return null;

  const selectedNote = notesStore.getNoteById(selectedNoteId);

  const onSaveDoc = async (doc: JSONObject) => {
    saving.toggleOn();
    console.log('saving', doc);
    saving.toggleOff();
  };

  const onClickDelete = async () => {
    if (!selectedNote) return;
    deleting.toggleOn();

    await notesStore.deleteNote({
      id: selectedNote.id,
      space: selectedNote.space,
    });

    deleting.toggleOff();
  };

  return (
    <NoteViewContainer>
      {selectedNote && (
        <NoteViewCard key={selectedNote.id}>
          <NoteHeader
            noteTitle={selectedNote.title}
            noteAuthor={selectedNote.author}
            noteUpdatedAt={selectedNote.updated_at}
            loading={saving.isOn || deleting.isOn}
            onClickDelete={onClickDelete}
          />
          <Editor doc={selectedNote.doc} saveDoc={onSaveDoc} />
        </NoteViewCard>
      )}
    </NoteViewContainer>
  );
};

export const NoteView = observer(NoteViewPresenter);
