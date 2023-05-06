import styled from 'styled-components';

import { BoxProps, Favicon, Flex, Icon, Text } from '../../general';

const BookmarkRow = styled(Flex)`
  border-radius: 6px;
  padding: 4px 4px 4px 6px;
  justify-content: space-between;
  flex-direction: row;
  height: 1.875rem; // 30px in rem is 1.875rem
  align-items: center;
  text-align: left;
`;

export type BookmarkProps = {
  favicon?: string;
  url: string;
  title: string;
  member?: string;
  width?: number;
  onNavigate: (url: string) => void;
  onRemove?: (url: string) => void;
} & BoxProps;

export const Bookmark = ({
  id,
  favicon,
  title,
  url,
  member = '',
  width = 270,
  onNavigate,
}: BookmarkProps) => {
  const textWidth = member ? width - 10 - 110 : width - 10;

  // TODO handle moon names? or tooltip on hover with full name?

  return (
    <BookmarkRow
      id={id}
      width={width}
      onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        onNavigate(url);
      }}
    >
      <Flex id={id} gap={8} justifyContent="flex-start" alignItems="center">
        {favicon ? (
          <Favicon id={id} src={favicon} />
        ) : (
          <Icon id={id} name="Link" opacity={0.7} />
        )}
        <Text.Custom id={id} fontSize={2} truncate width={textWidth}>
          {title}
        </Text.Custom>
      </Flex>
      {member && (
        <Text.Custom
          id={id}
          textAlign="right"
          width={110}
          opacity={0.5}
          fontSize={1}
          truncate
          fontWeight={300}
        >
          {member}
        </Text.Custom>
      )}
    </BookmarkRow>
  );
};
