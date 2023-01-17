import { FC } from 'react';
import { Flex, BoxProps } from '../../';

type FolderProps = {
  myProp?: string;
} & BoxProps;

export const Folder: FC<FolderProps> = (props: FolderProps) => {
  const { id, myProp } = props;

  return <Flex id={id}>Template</Flex>;
};
