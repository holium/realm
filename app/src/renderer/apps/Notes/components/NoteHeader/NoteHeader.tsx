import { ChangeEvent } from 'react';
import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';

import { ContextMenuOption } from 'renderer/components';
import { useShipStore } from 'renderer/stores/ship.store';

import { NoteHeaderView } from './NoteHeaderView';

const NoteHeaderPresenter = () => {
  const { notesStore } = useShipStore();

  const { selectedNote, saving } = notesStore;

  if (!selectedNote) return null;

  const noteUpdatedAtString = new Date(selectedNote.updated_at).toLocaleString(
    'en-US',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }
  );

  const contextMenuOptions: ContextMenuOption[] = [
    {
      id: `${selectedNote.id}-delete-note`,
      icon: 'Trash',
      iconColor: '#ff6240',
      labelColor: '#ff6240',
      label: 'Delete',
      disabled: false,
      onClick: () => {
        notesStore.deleteNote({
          id: selectedNote.id,
          space: selectedNote.space,
        });
      },
    },
  ];

  // Autosave after 5s of inactivity plus a random 0-3s.
  const onChangeTitle = debounce((e: ChangeEvent<HTMLInputElement>) => {
    notesStore.editNoteTitle({
      id: selectedNote.id,
      title: e.target.value,
    });
  }, 5000 + Math.random() * 3000);

  return (
    <NoteHeaderView
      title={selectedNote.title}
      author={selectedNote.author}
      noteUpdatedAtString={noteUpdatedAtString}
      contextMenuOptions={contextMenuOptions}
      saving={saving}
      onChange={onChangeTitle}
    />
  );
};

export const NoteHeader = observer(NoteHeaderPresenter);
