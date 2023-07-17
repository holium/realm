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
  noteUpdatedAtString: string;
  contextMenuOptions: ContextMenuOption[];
  loading: boolean;
  setTitle: (title: string) => void;
  onBlurTitle: () => void;
};

export const NoteHeaderView = ({
  title,
  author,
  noteUpdatedAtString,
  contextMenuOptions,
  loading,
  setTitle,
  onBlurTitle,
}: Props) => (
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
      <AuthorText>{author}</AuthorText>
    </Flex>
    {loading ? (
      <Spinner size="19px" width={2} />
    ) : (
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
    )}
  </NoteHeaderContainer>
);
