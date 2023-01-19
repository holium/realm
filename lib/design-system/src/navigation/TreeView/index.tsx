import { FC } from 'react';
import { Flex, BoxProps } from '../../';

type TreeViewProps = {
  myProp?: string;
} & BoxProps;

export const TreeView: FC<TreeViewProps> = (props: TreeViewProps) => {
  const { id, myProp } = props;

  return <Flex id={id}>Template</Flex>;
};
