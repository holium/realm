import { MouseEvent, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { ContextMenuOption } from 'renderer/components/ContextMenu/ContextMenu';
import { useContextMenu } from 'renderer/components/ContextMenu/useContextMenu';
import { useShipStore } from 'renderer/stores/ship.store';

import { NoteRowView } from './NoteRowView';

type Props = {
  id: string;
  title: string;
  author: string;
  firstParagraph: string | null;
  space: string;
  updatedAt: number;
  isSelected: boolean;
  isPersonal: boolean;
  onClick: () => void;
  onClickDelete: () => void;
};

const NoteRowPresenter = ({
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
  const { friends } = useShipStore();
  const roomsStore = useRoomsStore();
  const noteRowPath = space + id;

  const noteRoom = roomsStore
    .getSpaceRooms(space)
    .find((room) => room.path === noteRowPath);
  const participants = isPersonal
    ? []
    : noteRoom?.present.map((patp: string) => {
        const metadata = friends.getContactAvatarMetadata(patp);
        return metadata;
      }) || [];

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
    // Don't allow delete if we're not the author.
    if (window.ship !== author) return;

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
      participants={participants}
      onClick={onClickRow}
    />
  );
};

export const NoteRow = observer(NoteRowPresenter);
