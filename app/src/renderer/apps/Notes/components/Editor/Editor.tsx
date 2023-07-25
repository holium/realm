import { useEffect } from 'react';
import { fromUint8Array } from 'js-base64';
import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';

import { Flex, Spinner } from '@holium/design-system/general';

import { DataPacketKind } from 'renderer/apps/Rooms/store/room.types';
import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useShipStore } from 'renderer/stores/ship.store';

import { EditorContainer } from './Editor.styles';
import { useCollabEditor } from './useCollabEditor';

import './prosemirror.css';

// Set of unique updates that have not yet been sent to the server.
let updateQueue: string[] = [];

const EditorPresenter = () => {
  const roomsStore = useRoomsStore();
  const { notesStore, spacesStore } = useShipStore();

  const selectedSpace = spacesStore.selected;
  const {
    selectedNote,
    selectedYDoc,
    createNoteUpdate,
    setSaving,
    setUpOnYdocUpdate,
  } = notesStore;

  const { onEditorRef } = useCollabEditor({ ydoc: selectedYDoc ?? null });

  useEffect(() => {
    setUpOnYdocUpdate(onChangeDoc);
  }, [selectedNote]);

  const onChangeDoc = (update: Uint8Array, origin: any) => {
    const base64EncodedUpdate = fromUint8Array(update);
    updateQueue = [...updateQueue, base64EncodedUpdate];
    debouncedAutoSave();

    if (origin?.key !== 'y-sync$') {
      // Don't broadcast updates that were received from other peers.
      return;
    }

    roomsStore.sendDataToRoom({
      from: window.ship,
      kind: DataPacketKind.DATA,
      value: {
        broadcast: {
          event: 'broadcast',
          data: [base64EncodedUpdate],
        },
      },
    });
  };

  // Auto save the document after 3 seconds of inactivity,
  // with a random delay of up to 3 seconds to avoid clients saving at the same time.
  const debouncedAutoSave = debounce(async () => {
    if (!selectedNote) return;

    setSaving(true);

    // TODO: merge updates into one update before sending to server.
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

  if (!selectedSpace?.isOur && !roomsStore.currentRoom) {
    return (
      <Flex flex={1} justifyContent="center" alignItems="center" height="100%">
        <Spinner size="19px" width={2} />
      </Flex>
    );
  }

  return (
    <EditorContainer>
      <div ref={onEditorRef} style={{ flex: 1 }} />
    </EditorContainer>
  );
};

export const Editor = observer(EditorPresenter);