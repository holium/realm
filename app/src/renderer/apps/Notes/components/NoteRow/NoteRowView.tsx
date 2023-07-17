import { MouseEvent } from 'react';

import { Flex } from '@holium/design-system/general';

import {
  NoteRowContainer,
  NoteRowText,
  NoteRowTitle,
} from './NoteRowView.styles';

type Props = {
  id: string;
  title: string;
  preview: string;
  date: string;
  author: string;
  isSelected: boolean;
  isPersonal: boolean;
  onClick: (e: MouseEvent) => void;
};

export const NoteRowView = ({
  id,
  title,
  preview,
  date,
  author,
  isSelected,
  isPersonal,
  onClick,
}: Props) => (
  <NoteRowContainer id={id} selected={isSelected} onClick={onClick}>
    <Flex flex={1} flexDirection="column" gap="2px" maxWidth="100%">
      <Flex flex={1} gap="4px" justifyContent="space-between">
        <NoteRowTitle flex={1}>{title}</NoteRowTitle>
        <Flex gap="4px">
          {!isPersonal && (
            <NoteRowText>{author}</NoteRowText>
            /* {note.participants && note.participants?.length > 0 && (
                <AvatarRow size={16} people={note.participants} />
              )} */
          )}
        </Flex>
      </Flex>
      <Flex flex={1} gap="4px" justifyContent="space-between" maxWidth="100%">
        <NoteRowText flex={1}>{preview}</NoteRowText>
        <NoteRowText>{date}</NoteRowText>
      </Flex>
    </Flex>
  </NoteRowContainer>
);
