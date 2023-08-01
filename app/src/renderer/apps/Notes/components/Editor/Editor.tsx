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
    initializing,
    createNoteUpdateLocally,
    saveNoteUpdates,
  } = notesStore;

  // Auto save the document after 3 seconds of inactivity,
  // with a random delay of up to 3 seconds to avoid clients saving at the same time.
  const debouncedAutoSave = debounce(() => {
    if (!selectedNote) return;

    saveNoteUpdates({
      note_id: selectedNote.id,
      space: selectedNote.space,
    });
  }, 3000 + Math.random() * 3000);

  const onChange = (note_edit: string) => {
    if (!selectedNote) return;

    createNoteUpdateLocally({
      note_edit,
      note_id: selectedNote.id,
    });

    debouncedAutoSave();
  };

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

  if (initializing || (!isPersonalNote && !alreadyInRoom)) {
    return (
      <Flex flex={1} justifyContent="center" alignItems="center" height="100%">
        <Flex flexDirection="column" alignItems="center" gap="12px">
          <Spinner size="19px" width={2} />
          <Text.Body opacity={0.5}>
            {initializing ? 'Syncing updates' : 'Connecting to peers'}
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
        color: cursorColors[Math.floor(Math.random() * cursorColors.length)],
      }}
      broadcast={broadcast}
      onChange={onChange}
    />
  );
};

export const Editor = observer(EditorPresenter);
