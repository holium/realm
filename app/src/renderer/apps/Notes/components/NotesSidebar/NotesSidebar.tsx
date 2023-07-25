import { useState } from 'react';
import { observer } from 'mobx-react';

import { Button, Flex, Icon, Spinner } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useSound } from 'renderer/lib/sound';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { NoteRow } from '../NoteRow/NoteRow';
import {
  NoNotesYet,
  NotesSectionDivider,
  NotesSectionDividerBorder,
  NotesSectionDividerText,
  NotesSidebarContainer,
  NotesSidebarSection,
  NotesSidebarSectionList,
  NotesSidebarSectionsContainer,
} from './NotesSidebar.styles';

const NotesSidebarPresenter = () => {
  const { loggedInAccount } = useAppState();
  const { notesStore, spacesStore } = useShipStore();
  const roomsStore = useRoomsStore();
  const sound = useSound();

  const {
    sortedPersonalNotes,
    sortedSpaceNotes,
    selectedNoteId,
    setSelectedNoteId,
    getNotePreview,
    deleteNote,
  } = notesStore;
  const selectedSpace = spacesStore.selected;

  const creating = useToggle(false);
  const [_, setSearchString] = useState<string>('');

  if (!selectedSpace) return null;

  const onClickNewNote = async () => {
    if (creating.isOn) return;

    creating.toggleOn();

    await notesStore.createNote({
      space: selectedSpace.path,
      title: selectedSpace.isOur
        ? 'My note'
        : `${loggedInAccount?.nickname ?? loggedInAccount?.serverId}'s note`,
    });

    creating.toggleOff();
  };

  const onClickSpaceNote = async (id: string, space: string) => {
    setSelectedNoteId({ id });

    const noteRoomPath = space + id;
    const areWeInRoom = roomsStore.currentRoom;
    const areWeInRoomInOtherSpace =
      areWeInRoom && roomsStore.currentRoom?.path !== noteRoomPath;
    if (areWeInRoom) {
      if (areWeInRoomInOtherSpace) {
        // LEAVE OTHER ROOM
        sound.playRoomLeave();
        roomsStore.leaveRoom(roomsStore.currentRoom.rid);

        // DELETE OTHER ROOM IF EMPTY
        if (roomsStore.currentRoom?.present.length === 0) {
          roomsStore.deleteRoom(roomsStore.currentRoom.rid);
        }
      } else {
        // DO NOTHING IF WE ARE ALREADY IN THE NOTE ROOM
        return;
      }
    }

    const spaceRooms = roomsStore.getSpaceRooms(space);
    const existingRoom = spaceRooms.find((room) => room.path === noteRoomPath);
    if (existingRoom) {
      // JOIN ROOM
      sound.playRoomEnter();
      await roomsStore.joinRoom(existingRoom.rid);
    } else {
      // CREATE ROOM
      const note = notesStore.getNote({ id });
      if (!note) return;

      const newRoomRid = await roomsStore?.createRoom(
        note.title,
        'public',
        noteRoomPath
      );
      sound.playRoomEnter();
      await roomsStore.joinRoom(newRoomRid);
    }

    // In Notes rooms everyone should be muted by default.
    roomsStore.ourPeer.mute();
  };

  return (
    <NotesSidebarContainer>
      <Flex gap="8px" marginBottom="12px" alignItems="center">
        <TextInput
          id="dm-search"
          name="dm-search"
          width="100%"
          borderRadius={16}
          height={32}
          placeholder="Search"
          onChange={(e) => {
            setSearchString((e.target as HTMLInputElement).value);
          }}
        />
        <Button.IconButton
          style={{
            width: '32px',
            height: '32px',
            padding: '4px',
          }}
          disabled={creating.isOn}
          onClick={onClickNewNote}
        >
          {creating.isOn ? (
            <Spinner size="19px" width={2} />
          ) : (
            <Icon name="AddNote" size={22} />
          )}
        </Button.IconButton>
      </Flex>
      <NotesSidebarSectionsContainer>
        {!selectedSpace.isOur && (
          <NotesSidebarSection>
            <NotesSectionDivider>
              <NotesSectionDividerText>
                {selectedSpace.name}
              </NotesSectionDividerText>
              <NotesSectionDividerBorder />
            </NotesSectionDivider>
            <NotesSidebarSectionList>
              {sortedSpaceNotes && sortedSpaceNotes.length ? (
                sortedSpaceNotes.map((note) => (
                  <NoteRow
                    key={`space-note-row-${note.id}`}
                    id={note.id}
                    title={note.title}
                    author={note.author}
                    space={note.space}
                    updatedAt={note.updated_at}
                    firstParagraph={getNotePreview(note.id)}
                    isPersonal={false}
                    isSelected={selectedNoteId === note.id}
                    onClick={() => onClickSpaceNote(note.id, note.space)}
                    onClickDelete={() => {
                      deleteNote({ id: note.id, space: note.space });
                    }}
                  />
                ))
              ) : (
                <NoNotesYet>No notes yet</NoNotesYet>
              )}
            </NotesSidebarSectionList>
          </NotesSidebarSection>
        )}
        <NotesSidebarSection>
          <NotesSectionDivider>
            <NotesSectionDividerText>My Notes</NotesSectionDividerText>
            <NotesSectionDividerBorder />
          </NotesSectionDivider>
          <NotesSidebarSectionList>
            {sortedPersonalNotes && sortedPersonalNotes.length ? (
              sortedPersonalNotes.map((note) => (
                <NoteRow
                  key={`personal-note-row-${note.id}`}
                  id={note.id}
                  title={note.title}
                  author={note.author}
                  space={note.space}
                  updatedAt={note.updated_at}
                  firstParagraph={getNotePreview(note.id)}
                  isPersonal
                  isSelected={selectedNoteId === note.id}
                  onClick={() => setSelectedNoteId({ id: note.id })}
                  onClickDelete={() => {
                    deleteNote({ id: note.id, space: note.space });
                  }}
                />
              ))
            ) : (
              <NoNotesYet>No notes yet</NoNotesYet>
            )}
          </NotesSidebarSectionList>
        </NotesSidebarSection>
      </NotesSidebarSectionsContainer>
    </NotesSidebarContainer>
  );
};

export const NotesSidebar = observer(NotesSidebarPresenter);
