import { BoxProps, Flex } from '../../';

type TreeViewProps = {
  myProp?: string;
} & BoxProps;

export const TreeView = ({ id }: TreeViewProps) => (
  <Flex id={id}>Template</Flex>
);
