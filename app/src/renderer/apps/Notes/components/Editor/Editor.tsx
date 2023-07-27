import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';

import { Flex, Spinner, Text } from '@holium/design-system/general';
import { PresenceBroadcast } from '@holium/realm-presence';

import { DataPacketKind } from 'renderer/apps/Rooms/store/room.types';
import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { EditorView } from './EditorView';

// Playful colors for the text cursor to randomly cycle through.
const cursorColors = [
  '78, 158, 253',
  '255, 255, 0',
  '0, 255, 0',
  '255, 0, 0',
  '82, 178, 120',
  '217, 104, 42',
  '255, 51, 153',
  '132, 25, 217',
];

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

  const isPersonalNote =
    selectedNote.space === `/${loggedInAccount.serverId}/our`;
  const alreadyInRoom =
    roomsStore.currentRoom?.path === selectedSpace.path + selectedNote.id;

  if (syncing || (!isPersonalNote && !alreadyInRoom)) {
    return (
      <Flex flex={1} justifyContent="center" alignItems="center" height="100%">
        <Flex flexDirection="column" alignItems="center" gap="12px">
          <Spinner size="19px" width={2} />
          <Text.Body opacity={0.5}>
            {syncing ? 'Loading note' : 'Connecting to peers'}
          </Text.Body>
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
        avatar: loggedInAccount.avatar,
        color:
          loggedInAccount.color && loggedInAccount.color !== '0x0'
            ? loggedInAccount.color
            : cursorColors[Math.floor(Math.random() * cursorColors.length)],
      }}
      broadcast={broadcast}
      onSave={debouncedAutoSave}
    />
  );
};

export const Editor = observer(EditorPresenter);
