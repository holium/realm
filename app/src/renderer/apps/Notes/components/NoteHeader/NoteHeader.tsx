import { ChangeEvent } from 'react';
import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { ContextMenuOption } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { NoteHeaderView } from './NoteHeaderView';

const NoteHeaderPresenter = () => {
  const { loggedInAccount } = useAppState();
  const { notesStore, spacesStore } = useShipStore();
  const roomsStore = useRoomsStore();

  const { selectedNote, saving } = notesStore;
  const selectedSpace = spacesStore.selected;

  if (!loggedInAccount || !selectedSpace || !selectedNote) {
    return null;
  }

  // const isSpaceNote = selectedNote.space !== `/${loggedInAccount.serverId}/our`;
  const roomPath = selectedSpace.path + selectedNote.id;
  const existingRoom = roomsStore.getRoomByPath(roomPath);

  if (!existingRoom || !existingRoom.present.includes(loggedInAccount.serverId))
    return null;

  const noteEditedAtString = new Date(selectedNote.updated_at).toLocaleString(
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

  const onChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    const isAuthor = selectedNote.author === window.ship;
    if (!isAuthor) return;

    notesStore.editNoteTitleLocally({
      title: e.target.value,
    });
  };

  // Autosave on blur.
  const onBlurTitle = debounce(() => {
    const isAuthor = selectedNote.author === window.ship;
    if (!isAuthor) return;

    notesStore.persistNoteTitle();
  }, 500);

  return (
    <NoteHeaderView
      author={selectedNote.author}
      noteEditedAtString={noteEditedAtString}
      contextMenuOptions={
        selectedNote.author === window.ship ? contextMenuOptions : []
      }
      saving={saving}
      title={selectedNote.title}
      onChange={onChangeTitle}
      onBlur={onBlurTitle}
    />
  );
};

export const NoteHeader = observer(NoteHeaderPresenter);
