import { MouseEvent, useEffect, useMemo } from 'react';

import { ContextMenuOption } from 'renderer/components/ContextMenu/ContextMenu';
import { useContextMenu } from 'renderer/components/ContextMenu/useContextMenu';

import { NoteRowView } from './NoteRowView';

type Props = {
  id: string;
  title: string;
  author: string;
  firstParagraph: string;
  space: string;
  updatedAt: number;
  isSelected: boolean;
  isPersonal: boolean;
  onClick: () => void;
  onClickDelete: () => void;
};

export const NoteRow = ({
  id,
  title,
  author,
  firstParagraph,
  space,
  updatedAt,
  isSelected,
  isPersonal,
  onClick,
  onClickDelete,
}: Props) => {
  const rowId = useMemo(() => `note-row-${id}`, [id]);
  const rowOptions: ContextMenuOption[] = useMemo(
    () => [
      {
        id: `${id}-select-note`,
        icon: 'Trash',
        iconColor: '#ff6240',
        labelColor: '#ff6240',
        label: 'Delete',
        disabled: false,
        onClick: onClickDelete,
      },
    ],
    [id, space, onClickDelete]
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

  const notePreview =
    firstParagraph && firstParagraph.length > 0
      ? firstParagraph
      : 'No additional text';
  const noteUpdated = new Date(updatedAt).toLocaleDateString();

  return (
    <NoteRowView
      id={rowId}
      title={title}
      author={author}
      preview={notePreview}
      date={noteUpdated}
      isSelected={isSelected}
      isPersonal={isPersonal}
      onClick={onClickRow}
    />
  );
};
