import { MouseEvent } from 'react';

import { Flex } from '@holium/design-system/general';

import { NotesStore_Note } from 'renderer/stores/notes/notes.store.types';

import {
  NoteRowContainer,
  NoteRowText,
  NoteRowTitle,
} from './NoteRowView.styles';

type Props = {
  id: string;
  note: NotesStore_Note;
  isSelected: boolean;
  isPersonal: boolean;
  onClick: (e: MouseEvent) => void;
};

export const NoteRowView = ({
  id,
  note,
  isSelected,
  isPersonal,
  onClick,
}: Props) => {
  const content = (note.doc.content.firstChild?.textContent ?? '').trim();
  const notePreview =
    content && content.length > 0 ? content : 'No additional text';
  const noteDateString = new Date(note.updated_at).toLocaleDateString();

  return (
    <NoteRowContainer id={id} selected={isSelected} onClick={onClick}>
      <Flex flex={1} flexDirection="column" gap="2px" maxWidth="100%">
        <Flex flex={1} gap="4px" justifyContent="space-between">
          <NoteRowTitle flex={1}>{note.title}</NoteRowTitle>
          <Flex gap="4px">
            {!isPersonal && (
              <NoteRowText>{note.author}</NoteRowText>
              /* {note.participants && note.participants?.length > 0 && (
                <AvatarRow size={16} people={note.participants} />
              )} */
            )}
          </Flex>
        </Flex>
        <Flex flex={1} gap="4px" justifyContent="space-between" maxWidth="100%">
          <NoteRowText flex={1}>{notePreview}</NoteRowText>
          <NoteRowText>{noteDateString}</NoteRowText>
        </Flex>
      </Flex>
    </NoteRowContainer>
  );
};
