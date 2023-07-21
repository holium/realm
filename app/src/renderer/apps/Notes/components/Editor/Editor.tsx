import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';

import { Flex, Spinner } from '@holium/design-system/general';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useShipStore } from 'renderer/stores/ship.store';

import { EditorView } from './EditorView';

import './prosemirror.css';

const EditorPresenter = () => {
  const shipStore = useShipStore();
  const roomsStore = useRoomsStore();

  const { selectedNote, selectedNoteUpdates, createNoteUpdate } =
    shipStore.notesStore;

  if (!selectedNote || !selectedNoteUpdates) return null;

  // Auto save the document after 3 seconds of inactivity,
  // with a random delay of up to 3 seconds to avoid spamming the server.
  const debouncedAutoSave = debounce((update: string) => {
    console.log('Saving...');
    createNoteUpdate({
      note_id: selectedNote.id,
      space: selectedNote.space,
      update,
    });
  }, 3000 + Math.random() * 3000);

  if (!roomsStore.currentRoom) {
    return (
      <Flex flex={1} justifyContent="center" alignItems="center" height="100%">
        <Spinner size="19px" width={2} />
      </Flex>
    );
  }

  return (
    <EditorView
      updates={selectedNoteUpdates}
      roomsStore={roomsStore}
      onChangeDoc={debouncedAutoSave}
    />
  );
};

export const Editor = observer(EditorPresenter);
