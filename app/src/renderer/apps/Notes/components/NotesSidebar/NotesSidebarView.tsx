import { Button, Flex, Icon } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import type { NotesStore_Note } from 'renderer/stores/notes/notes.store.types';

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

type Props = {
  myNotes: NotesStore_Note[];
  isPersonalSpace: boolean;
  spaceTitle: string | undefined;
  spaceNotes: NotesStore_Note[] | undefined;
  selectedNote: NotesStore_Note | undefined;
  setSelectedNote: (note: NotesStore_Note) => void;
  onChangeSearchInput: (query: string) => void;
  onClickNewNote: () => void;
};

export const NotesSidebarView = ({
  myNotes,
  isPersonalSpace,
  spaceTitle,
  spaceNotes,
  selectedNote,
  setSelectedNote,
  onChangeSearchInput,
  onClickNewNote,
}: Props) => (
  <NotesSidebarContainer>
    <Flex gap="8px" marginBottom="12px">
      <TextInput
        id="dm-search"
        name="dm-search"
        width="100%"
        borderRadius={16}
        height={32}
        placeholder="Search"
        onChange={(e) => {
          onChangeSearchInput((e.target as HTMLInputElement).value);
        }}
      />
      <Button.IconButton onClick={onClickNewNote}>
        <Icon name="AddCircleLine" size={24} />
      </Button.IconButton>
    </Flex>
    <NotesSidebarSectionsContainer>
      {!isPersonalSpace && (
        <NotesSidebarSection>
          <NotesSectionDivider>
            <NotesSectionDividerText>{spaceTitle}</NotesSectionDividerText>
            <NotesSectionDividerBorder />
          </NotesSectionDivider>
          <NotesSidebarSectionList>
            {spaceNotes && spaceNotes.length ? (
              spaceNotes.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  selected={selectedNote?.id === note.id}
                  onClick={() => setSelectedNote(note)}
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
          {myNotes && myNotes.length ? (
            myNotes.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                selected={selectedNote?.id === note.id}
                onClick={() => setSelectedNote(note)}
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
