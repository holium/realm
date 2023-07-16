import { Button, Flex, Icon } from '@holium/design-system/general';
import { Menu } from '@holium/design-system/navigation';

import { ContextMenuOption } from 'renderer/components';
import type { NotesStore_Note } from 'renderer/stores/notes/notes.store.types';

import {
  AuthorText,
  NoteHeaderContainer,
  TitleInput,
} from './NoteHeader.styles';

type Props = {
  noteTitle: NotesStore_Note['title'];
  noteAuthor: NotesStore_Note['author'];
  onClickDelete: () => void;
};

export const NoteHeader = ({ noteTitle, noteAuthor, onClickDelete }: Props) => {
  const contextMenuOptions: ContextMenuOption[] = [
    {
      id: `${noteTitle}-delete-note`,
      icon: 'Trash',
      section: 2,
      iconColor: '#ff6240',
      labelColor: '#ff6240',
      label: 'Delete Note',
      disabled: false,
      onClick: onClickDelete,
    },
  ];

  return (
    <NoteHeaderContainer>
      <Flex flex={1} flexDirection="column">
        <TitleInput
          id="note-title-input"
          name="note-title-input"
          value={noteTitle}
          placeholder="Title"
        />
        <AuthorText>{noteAuthor}</AuthorText>
      </Flex>
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
    </NoteHeaderContainer>
  );
};
