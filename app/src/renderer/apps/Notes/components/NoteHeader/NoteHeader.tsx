import { useState } from 'react';

import { Button, Flex, Icon, Spinner } from '@holium/design-system/general';
import { Menu } from '@holium/design-system/navigation';

import { ContextMenuOption } from 'renderer/components';
import { useShipStore } from 'renderer/stores/ship.store';

import {
  AuthorText,
  NoteHeaderContainer,
  NoteHeaderTitleInput,
  NoteUpdatedAtText,
} from './NoteHeaderView.styles';

export const NoteHeader = () => {
  const { notesStore } = useShipStore();

  const { selectedNoteId, loading } = notesStore;

  const selectedNote = selectedNoteId
    ? notesStore.getNoteById(selectedNoteId)
    : null;

  const [title, setTitle] = useState(selectedNote?.title);

  if (!selectedNote) return null;

  const noteUpdatedAtString = new Date(selectedNote.updated_at).toLocaleString(
    'en-US',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }
  );

  const contextMenuOptions: ContextMenuOption[] = [
    {
      id: `${selectedNote.id}-delete-note`,
      icon: 'Trash',
      iconColor: '#ff6240',
      labelColor: '#ff6240',
      label: 'Delete',
      disabled: false,
      onClick: () => {
        notesStore.deleteNote({
          id: selectedNote.id,
          space: selectedNote.space,
        });
      },
    },
  ];

  const onBlurTitle = () => {
    notesStore._updateNoteLocally({
      id: selectedNote.id,
      title,
    });
    notesStore.persistLocalNoteChanges(selectedNote.id);
  };

  return (
    <NoteHeaderContainer>
      <Flex flex={1} flexDirection="column">
        <NoteUpdatedAtText>{noteUpdatedAtString}</NoteUpdatedAtText>
        <NoteHeaderTitleInput
          id="note-title-input"
          name="note-title-input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={onBlurTitle}
        />
        <AuthorText>{selectedNote.author}</AuthorText>
      </Flex>
      {loading ? (
        <Spinner size="19px" width={2} />
      ) : (
        <Menu
          id={`${selectedNote.id}-menu`}
          orientation="bottom-left"
          offset={{ x: 2, y: 2 }}
          triggerEl={
            <Button.IconButton size={26}>
              <Icon name="MoreHorizontal" size={22} opacity={0.5} />
            </Button.IconButton>
          }
          options={contextMenuOptions}
        />
      )}
    </NoteHeaderContainer>
  );
};
