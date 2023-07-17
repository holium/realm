import { ChangeEvent } from 'react';
import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';

import { ContextMenuOption } from 'renderer/components';
import { useShipStore } from 'renderer/stores/ship.store';

import { NoteHeaderView } from './NoteHeaderView';

const NoteHeaderPresenter = () => {
  const { notesStore } = useShipStore();

  const { selectedNote, loading } = notesStore;

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

  const onBlurTitle = debounce(() => {
    notesStore.updateNote({
      id: selectedNote.id,
      title: selectedNote.title,
    });
  }, 1000);

  const onChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    notesStore._updateNoteLocally({
      id: selectedNote.id,
      title: e.target.value,
    });
  };

  return (
    <NoteHeaderView
      title={selectedNote.title}
      author={selectedNote.author}
      noteUpdatedAtString={noteUpdatedAtString}
      contextMenuOptions={contextMenuOptions}
      loading={loading}
      onBlur={onBlurTitle}
      onChange={onChangeTitle}
    />
  );
};

export const NoteHeader = observer(NoteHeaderPresenter);
