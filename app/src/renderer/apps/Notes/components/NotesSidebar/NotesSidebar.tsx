import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { Button, Flex, Icon, Spinner } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
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

  const {
    sortedPersonalNotes,
    sortedSpaceNotes,
    selectedNoteId,
    searchQuery,
    searchedNotes,
    initializing,
    setConnectingToNoteRoom,
    setSelectedNoteId,
    setSearchquery,
    getNotePreview,
    deleteNote,
  } = notesStore;
  const selectedSpace = spacesStore.selected;

  const creating = useToggle(false);

  useEffect(() => {
    return () => {
      console.log('NotesSidebar unmount');
      // also cleanup server side resources when the notes app closes
      const session = roomsStore.getCurrentSession('background');
      if (session) {
        roomsStore.deleteRoom(session.rid);
      }
    };
  }, []);

  useEffect(() => {
    console.log('NotesSidebar space change');
    // cleanup server side resources when switching spaces
    const session = roomsStore.getCurrentSession('background');
    if (session) {
      roomsStore.deleteRoom(session.rid);
    }
  }, [selectedSpace]);

  if (!selectedSpace) return null;

  const onClickNewNote = async () => {
    if (creating.isOn || initializing) return;

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

    setConnectingToNoteRoom(true);

    const existingRoom = roomsStore
      .getSpaceRooms(space)
      .find((room) => room.path === noteRoomPath);

    // if it's an existing room and we're already in it, leave it (per Trent)
    if (existingRoom) {
      console.log('present: %o', existingRoom.present);
      console.log('loggedInAccount: %o', loggedInAccount);
      if (
        loggedInAccount?.serverId &&
        existingRoom.present.indexOf(loggedInAccount?.serverId) === -1
      ) {
        // leave any 'background' rooms we may current reside in
        const session = roomsStore.getCurrentSession('background');
        if (session) {
          roomsStore.leaveRoom(session.rid);
        }
        await roomsStore.joinRoom(existingRoom.rid);
      } else {
        roomsStore.leaveRoom(existingRoom.rid);
      }
    } else {
      // leave the current background session (note) if we are already in a note room
      const session = roomsStore.getCurrentSession('background');
      if (session) {
        roomsStore.leaveRoom(session.rid);
      }

      // CREATE ROOM
      const note = notesStore.getNote({ id });
      if (!note) return;

      const newRoomRid = await roomsStore.createRoom(
        `Notes: ${note.title}-${id}`,
        'public',
        noteRoomPath,
        'background'
      );
      await roomsStore.joinRoom(newRoomRid);
    }

    setConnectingToNoteRoom(false);

    // do not auto mute if there is an interactive session
    if (roomsStore.hasCurrentSession('interactive')) {
      roomsStore.ourPeer.mute();
    }
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
            setSearchquery((e.target as HTMLInputElement).value);
          }}
        />
        <Button.IconButton
          style={{
            width: '32px',
            height: '32px',
            padding: '4px',
          }}
          disabled={creating.isOn || initializing}
          onClick={onClickNewNote}
        >
          {creating.isOn || initializing ? (
            <Spinner size="19px" width={2} />
          ) : (
            <Icon name="AddNote" size={22} />
          )}
        </Button.IconButton>
      </Flex>
      <NotesSidebarSectionsContainer>
        {searchQuery ? (
          <NotesSidebarSection>
            <NotesSectionDivider>
              <NotesSectionDividerText>
                {searchedNotes.length} search results
              </NotesSectionDividerText>
              <NotesSectionDividerBorder />
            </NotesSectionDivider>
            <NotesSidebarSectionList>
              {searchedNotes.map((note) => (
                <NoteRow
                  key={`searched-note-row-${note.id}`}
                  id={note.id}
                  title={note.title}
                  patp={note.author}
                  space={note.space}
                  updatedAt={note.updated_at}
                  firstParagraph={getNotePreview(note.id)}
                  isPersonal={
                    note.space === `/${loggedInAccount?.serverId}/our`
                  }
                  isSelected={selectedNoteId === note.id}
                  onClick={() => {
                    if (note.space === `/${loggedInAccount?.serverId}/our`) {
                      setSelectedNoteId({ id: note.id });
                    } else {
                      onClickSpaceNote(note.id, note.space);
                    }
                  }}
                  onClickDelete={() => {
                    deleteNote({ id: note.id, space: note.space });
                  }}
                />
              ))}
            </NotesSidebarSectionList>
          </NotesSidebarSection>
        ) : (
          <>
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
                        patp={note.author}
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
                      patp={note.author}
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
          </>
        )}
      </NotesSidebarSectionsContainer>
    </NotesSidebarContainer>
  );
};

export const NotesSidebar = observer(NotesSidebarPresenter);
