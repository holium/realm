import { ChangeEvent } from 'react';

import { Button, Flex, Icon, Spinner } from '@holium/design-system/general';
import { Menu } from '@holium/design-system/navigation';

import { ContextMenuOption } from 'renderer/components';

import {
  AuthorText,
  NoteHeaderContainer,
  NoteHeaderTitleInput,
  NoteUpdatedAtText,
} from './NoteHeaderView.styles';

type Props = {
  title: string;
  author: string;
  noteEditedAtString: string;
  contextMenuOptions: ContextMenuOption[];
  saving: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
};

export const NoteHeaderView = ({
  title,
  author,
  noteEditedAtString,
  contextMenuOptions,
  saving,
  onChange,
  onBlur,
}: Props) => (
  <NoteHeaderContainer>
    <Flex flex={1} flexDirection="column">
      <NoteUpdatedAtText>{noteEditedAtString}</NoteUpdatedAtText>
      <NoteHeaderTitleInput
        id="note-title-input"
        name="note-title-input"
        placeholder="Title"
        value={title}
        disabled={saving || author !== window.ship}
        onChange={onChange}
        onBlur={onBlur}
      />
      <AuthorText>{author}</AuthorText>
    </Flex>
    {saving ? (
      <Spinner size="19px" width={2} />
    ) : contextMenuOptions.length ? (
      <Menu
        id={`${title}-menu`}
        orientation="bottom-left"
        offset={{ x: 2, y: 2 }}
        triggerEl={
          <Button.IconButton size={26}>
            <Icon name="MoreHorizontal" size={22} opacity={0.5} />
          </Button.IconButton>
        }
        options={contextMenuOptions}
      />
    ) : null}
  </NoteHeaderContainer>
);
