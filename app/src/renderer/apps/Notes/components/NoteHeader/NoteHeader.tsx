import { Button, Flex, Icon, Spinner } from '@holium/design-system/general';
import { Menu } from '@holium/design-system/navigation';

import { ContextMenuOption } from 'renderer/components';
import type { NotesStore_Note } from 'renderer/stores/notes/notes.store.types';

import {
  AuthorText,
  NoteHeaderContainer,
  NoteUpdatedAtText,
  TitleInput,
} from './NoteHeader.styles';

type Props = {
  noteTitle: NotesStore_Note['title'];
  noteAuthor: NotesStore_Note['author'];
  noteUpdatedAt: NotesStore_Note['updated_at'];
  loading: boolean;
  onClickDelete: () => void;
};

export const NoteHeader = ({
  noteTitle,
  noteAuthor,
  noteUpdatedAt,
  loading,
  onClickDelete,
}: Props) => {
  const noteUpdatedAtString = new Date(noteUpdatedAt).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  const contextMenuOptions: ContextMenuOption[] = [
    {
      id: `${noteTitle}-delete-note`,
      icon: 'Trash',
      iconColor: '#ff6240',
      labelColor: '#ff6240',
      label: 'Delete',
      disabled: false,
      onClick: onClickDelete,
    },
  ];

  return (
    <NoteHeaderContainer>
      <Flex flex={1} flexDirection="column">
        <NoteUpdatedAtText>{noteUpdatedAtString}</NoteUpdatedAtText>
        <TitleInput
          id="note-title-input"
          name="note-title-input"
          value={noteTitle}
          placeholder="Title"
        />
        <AuthorText>{noteAuthor}</AuthorText>
      </Flex>
      {loading ? (
        <Spinner size="19px" width={2} />
      ) : (
        <Menu
          id={`notes-${noteTitle}-menu`}
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
