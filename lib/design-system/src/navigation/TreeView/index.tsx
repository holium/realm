import { Flex, BoxProps } from '../../';

type TreeViewProps = {
  myProp?: string;
} & BoxProps;

export const TreeView = ({ id }: TreeViewProps) => (
  <Flex id={id}>Template</Flex>
);
