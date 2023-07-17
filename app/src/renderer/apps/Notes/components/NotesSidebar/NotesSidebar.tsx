import { useState } from 'react';
import { observer } from 'mobx-react';

import { Button, Flex, Icon, Spinner } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { schema } from '../Editor/schema';
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

  const {
    sortedPersonalNotes,
    sortedSpaceNotes,
    selectedNoteId,
    setSelectedNoteId,
    deleteNote,
  } = notesStore;
  const selectedSpace = spacesStore.selected;

  const creating = useToggle(false);
  const [_, setSearchString] = useState<string>('');

  if (!selectedSpace) return null;

  const onClickNewNote = async () => {
    if (creating.isOn) return;

    creating.toggleOn();

    const newDoc = schema.node('doc', null, [
      schema.node('paragraph', null, [schema.text('\n')]),
    ]);
    const newDocJSON = newDoc.toJSON();
    await notesStore.createNote({
      title: selectedSpace.isOur
        ? 'My note'
        : `${loggedInAccount?.nickname ?? loggedInAccount?.serverId}'s note`,
      doc: newDocJSON,
      space: selectedSpace.path,
    });

    creating.toggleOff();
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
                    firstParagraph={(
                      note.doc.content.firstChild?.textContent ?? ''
                    ).trim()}
                    isPersonal={false}
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
                  firstParagraph={(
                    note.doc.content.firstChild?.textContent ?? ''
                  ).trim()}
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
