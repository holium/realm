import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';

import { Button, Flex, Spinner, Text } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';
import { PresenceBroadcast } from '@holium/realm-presence';

import { DataPacketKind } from 'renderer/apps/Rooms/store/room.types';
import { RoomType } from 'renderer/apps/Rooms/store/RoomsStore';
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

  const reconnecting = useToggle(false);

  const selectedSpace = spacesStore.selected;
  const {
    selectedNote,
    selectedAwareness,
    initializing,
    connectingToNoteRoom,
    createNoteUpdateLocally,
    saveNoteUpdates,
  } = notesStore;

  // Auto save the document after 3 seconds of inactivity,
  // with a random delay of up to 3 seconds to avoid clients saving at the same time.
  const debouncedAutoSave = debounce(() => {
    if (!selectedNote || !selectedSpace) return;

    // If there are multiple participants in a room,
    // we only need one to be responsible for saving the document at a time.
    const roomPath = selectedSpace.path + selectedNote.id;
    const room = roomsStore.getRoomByPath(roomPath);

    if (room?.present?.length) {
      // Always choose the first participant in the room to save the document.
      const sortedList = room.present.sort();
      const saver = sortedList[0];
      if (saver !== loggedInAccount?.serverId) return;
    }

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

  if (
    !loggedInAccount ||
    !selectedSpace ||
    !selectedNote ||
    !selectedAwareness ||
    !selectedAwareness.doc
  ) {
    return null;
  }

  const isSpaceNote = selectedNote.space !== `/${loggedInAccount.serverId}/our`;
  const roomPath = selectedSpace.path + selectedNote.id;
  const existingRoom = roomsStore.getRoomByPath(roomPath);

  const broadcast = (channel: NotesBroadcastChannel, data: string) => {
    const broadcast: PresenceBroadcast = {
      event: 'broadcast',
      data: [channel, data],
    };
    // only broadcast from here if we are actually still in the room
    if (existingRoom?.present.includes(loggedInAccount.serverId)) {
      // console.log('broadcast: %o', [window.ship, existingRoom.rid]);
      roomsStore.sendDataToRoom({
        from: window.ship,
        path: existingRoom.rid,
        kind: DataPacketKind.DATA,
        value: { broadcast },
      });
    }
  };

  if (initializing) {
    return (
      <Flex flex={1} justifyContent="center" alignItems="center" height="100%">
        <Flex flexDirection="column" alignItems="center" gap="12px">
          <Spinner size="19px" width={2} />
          <Text.Body opacity={0.5}>Syncing updates</Text.Body>
        </Flex>
      </Flex>
    );
  }

  const onClickReconnect = async () => {
    reconnecting.toggleOn();

    if (
      existingRoom &&
      !existingRoom.present.includes(loggedInAccount.serverId)
    ) {
      await roomsStore.joinRoom(existingRoom.rid);
    } else {
      // the way notes room ids get generated, using selectedNote.title
      //   was not genering unique room ids. to not impact other parts of the
      //   rooms subsystem, simply send the note id to ensure a truly unique
      //   room id is generated for the note
      await roomsStore.createRoom(
        `${roomPath}`,
        'public',
        roomPath,
        RoomType.background
      );
    }

    reconnecting.toggleOff();
  };

  if (
    isSpaceNote &&
    (!existingRoom || !existingRoom.present.includes(loggedInAccount.serverId))
  ) {
    if (connectingToNoteRoom) {
      return (
        <Flex
          flex={1}
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Flex flexDirection="column" alignItems="center" gap="12px">
            <Spinner size="19px" width={2} />
            <Text.Body opacity={0.5}>Connecting to peers</Text.Body>
          </Flex>
        </Flex>
      );
    } else {
      return (
        <Flex
          flex={1}
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Flex flexDirection="column" alignItems="center" gap="12px">
            <Text.H5 opacity={0.5}>Room Closed</Text.H5>
            {reconnecting.isOn ? (
              <Spinner size="19px" width={2} />
            ) : (
              <Button.Primary onClick={onClickReconnect}>
                Reconnect
              </Button.Primary>
            )}
          </Flex>
        </Flex>
      );
    }
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
