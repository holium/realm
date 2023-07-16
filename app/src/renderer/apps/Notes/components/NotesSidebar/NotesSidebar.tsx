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
  const { spacesStore, notesStore } = useShipStore();

  const selectedSpace = spacesStore.selected;
  const { personalNotes, spaceNotes, selectedNoteId, setSelectedNoteId } =
    notesStore;

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
              {spaceNotes && spaceNotes.length ? (
                spaceNotes.map((note) => (
                  <NoteRow
                    key={note.id}
                    note={note}
                    isPersonal={false}
                    isSelected={selectedNoteId === note.id}
                    onClickDelete={() => {
                      notesStore.deleteNote({ id: note.id, space: note.space });
                    }}
                    onClick={() => setSelectedNoteId(note.id)}
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
            {personalNotes && personalNotes.length ? (
              personalNotes.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  isPersonal
                  isSelected={selectedNoteId === note.id}
                  onClickDelete={() => {
                    notesStore.deleteNote({ id: note.id, space: note.space });
                  }}
                  onClick={() => setSelectedNoteId(note.id)}
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
