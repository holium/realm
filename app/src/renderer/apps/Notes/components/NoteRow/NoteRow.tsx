import { Flex, Row } from '@holium/design-system/general';

import type { NotesStore_Note } from 'renderer/stores/notes/notes.store.types';

import { NoteRowText, NoteRowTitle } from './NoteRow.styles';

type Props = {
  note: NotesStore_Note;
  selected: boolean;
  onClick: () => void;
};

export const NoteRow = ({ note, selected, onClick }: Props) => {
  const notePreview = note.doc.content?.toString() || '';
  const noteDateString = new Date(note.updated_at).toLocaleDateString();

  return (
    <Row style={{ minWidth: '0' }} selected={selected} onClick={onClick}>
      <Flex flex={1} flexDirection="column" gap="2px" maxWidth="100%">
        <Flex flex={1} gap="4px" justifyContent="space-between">
          <NoteRowTitle flex={1}>{note.title}</NoteRowTitle>
          <Flex gap="4px">
            <NoteRowText>{note.author}</NoteRowText>
            {/* {note.participants && note.participants?.length > 0 && (
              <AvatarRow size={16} people={note.participants} />
            )} */}
          </Flex>
        </Flex>
        <Flex flex={1} gap="4px" justifyContent="space-between" maxWidth="100%">
          <NoteRowText flex={1}>{notePreview}</NoteRowText>
          <NoteRowText>{noteDateString}</NoteRowText>
        </Flex>
      </Flex>
    </Row>
  );
};
