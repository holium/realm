import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';

import { Flex, Spinner, Text } from '@holium/design-system/general';
import { PresenceBroadcast } from '@holium/realm-presence';

import { DataPacketKind } from 'renderer/apps/Rooms/store/room.types';
import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { EditorView } from './EditorView';

export enum NotesBroadcastChannel {
  YDocUpdate = 'notes-ydoc-update',
  AwarenessUpdate = 'notes-awareness-update',
}

const EditorPresenter = () => {
  const roomsStore = useRoomsStore();
  const { loggedInAccount } = useAppState();
  const { notesStore, spacesStore } = useShipStore();

  const selectedSpace = spacesStore.selected;
  const {
    selectedNote,
    selectedAwareness,
    syncing,
    createNoteUpdate,
    setSaving,
  } = notesStore;

  // Auto save the document after 3 seconds of inactivity,
  // with a random delay of up to 3 seconds to avoid clients saving at the same time.
  const debouncedAutoSave = debounce(async (editQueue: string[]) => {
    if (!selectedNote) return;

    setSaving(true);

    // TODO: merge updates into one update before sending to server.
    const promises = editQueue.map((update) => {
      return createNoteUpdate({
        note_id: selectedNote.id,
        space: selectedNote.space,
        update,
      });
    });
    await Promise.all(promises);

    setSaving(false);
  }, 3000 + Math.random() * 3000);

  const broadcast = (channel: NotesBroadcastChannel, data: string) => {
    const broadcast: PresenceBroadcast = {
      event: 'broadcast',
      data: [channel, data],
    };
    roomsStore.sendDataToRoom({
      from: window.ship,
      kind: DataPacketKind.DATA,
      value: { broadcast },
    });
  };

  if (
    !loggedInAccount ||
    !selectedSpace ||
    !selectedNote ||
    !selectedAwareness ||
    !selectedAwareness.doc
  ) {
    return null;
  }

  if (
    (!selectedSpace.isOur &&
      roomsStore.currentRoom?.path !== selectedSpace.path + selectedNote.id) ||
    syncing
  ) {
    return (
      <Flex flex={1} justifyContent="center" alignItems="center" height="100%">
        <Flex flexDirection="column" alignItems="center" gap="12px">
          <Spinner size="19px" width={2} />
          <Text.Body opacity={0.5}>Connecting to peers</Text.Body>
        </Flex>
      </Flex>
    );
  }

  return (
    <EditorView
      ydoc={selectedAwareness.doc}
      awareness={selectedAwareness}
      user={{
        patp: loggedInAccount.serverId,
        nickname: loggedInAccount.nickname,
        color:
          loggedInAccount.color && loggedInAccount.color !== '0x0'
            ? loggedInAccount.color
            : '0, 0, 0',
        avatar: loggedInAccount.avatar,
      }}
      broadcast={broadcast}
      onSave={debouncedAutoSave}
    />
  );
};

export const Editor = observer(EditorPresenter);
