import { MouseEvent, useEffect, useMemo } from 'react';

import { ContextMenuOption } from 'renderer/components/ContextMenu/ContextMenu';
import { useContextMenu } from 'renderer/components/ContextMenu/useContextMenu';
import type { NotesStore_Note } from 'renderer/stores/notes/notes.store.types';

import { NoteRowView } from './NoteRowView';

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

  const onClickRow = (e: MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <NoteRowView
      id={rowId}
      note={note}
      isSelected={isSelected}
      isPersonal={isPersonal}
      onClick={onClickRow}
    />
  );
};
