import { FC } from 'react';
import { Flex, BoxProps } from '../../';

type BookmarkProps = {
  myProp?: string;
} & BoxProps;

export const Bookmark: FC<BookmarkProps> = (props: BookmarkProps) => {
  const { id, myProp } = props;

  return <Flex id={id}>Template</Flex>;
};
