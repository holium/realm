import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';

import { Flex, Spinner } from '@holium/design-system/general';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useShipStore } from 'renderer/stores/ship.store';

import { EditorView } from './EditorView';

import './prosemirror.css';

// Set of unique updates that have been applied to the editor.
let updateQueue: string[] = [];

const EditorPresenter = () => {
  const shipStore = useShipStore();
  const roomsStore = useRoomsStore();
  const { spacesStore } = useShipStore();

  const selectedSpace = spacesStore.selected;
  const { selectedNote, selectedNoteUpdates, createNoteUpdate, setSaving } =
    shipStore.notesStore;

  if (!selectedSpace || !selectedNote) return null;

  const onChangeDoc = (update: string) => {
    updateQueue = [...updateQueue, update];
    debouncedAutoSave();
  };

  // Auto save the document after 3 seconds of inactivity,
  // with a random delay of up to 3 seconds to avoid spamming the server.
  const debouncedAutoSave = debounce(async () => {
    setSaving(true);
    const promises = updateQueue.map((update) => {
      return createNoteUpdate({
        note_id: selectedNote.id,
        space: selectedNote.space,
        update,
      });
    });
    await Promise.all(promises);
    updateQueue = [];
    setSaving(false);
  }, 3000 + Math.random() * 3000);

  if (!selectedSpace.isOur && !roomsStore.currentRoom) {
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
      onChangeDoc={onChangeDoc}
    />
  );
};

export const Editor = observer(EditorPresenter);
