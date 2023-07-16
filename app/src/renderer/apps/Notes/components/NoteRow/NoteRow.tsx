import { useEffect, useMemo } from 'react';

import { Flex } from '@holium/design-system/general';

import { ContextMenuOption } from 'renderer/components/ContextMenu/ContextMenu';
import { useContextMenu } from 'renderer/components/ContextMenu/useContextMenu';
import type { NotesStore_Note } from 'renderer/stores/notes/notes.store.types';

import { NoteRowContainer, NoteRowText, NoteRowTitle } from './NoteRow.styles';

type Props = {
  note: NotesStore_Note;
  isSelected: boolean;
  isPersonal: boolean;
  onClickDelete: () => void;
  onClick: () => void;
};

export const NoteRow = ({
  note,
  isSelected,
  isPersonal,
  onClickDelete,
  onClick,
}: Props) => {
  // TODO: Parse prosemirror doc to get the first paragraph.
  const notePreview = note.doc.text ?? 'No preview';
  const noteDateString = new Date(note.updated_at).toLocaleDateString();

  const rowId = useMemo(() => `note-row-${note.id}`, [note.id]);

  const rowOptions: ContextMenuOption[] = useMemo(
    () => [
      {
        id: rowId,
        icon: 'Trash',
        iconColor: '#ff6240',
        labelColor: '#ff6240',
        label: 'Delete',
        disabled: false,
        onClick: onClickDelete,
      },
    ],
    [rowId, onClickDelete]
  );

  const { getOptions, setOptions } = useContextMenu();

  useEffect(() => {
    if (rowOptions !== getOptions(rowId)) {
      setOptions(rowId, rowOptions);
    }
  }, [rowId, rowOptions, getOptions, setOptions]);

  const onClickRow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <NoteRowContainer id={rowId} selected={isSelected} onClick={onClickRow}>
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
