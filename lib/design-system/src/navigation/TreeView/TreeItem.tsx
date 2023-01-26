import { FC } from 'react';
import { Flex, BoxProps } from '../../';

type TreeItemProps = {
  myProp?: string;
} & BoxProps;

export const TreeItem: FC<TreeItemProps> = (props: TreeItemProps) => {
  const { id, myProp } = props;

  return <Flex id={id}>Template</Flex>;
};
