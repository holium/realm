import { BoxProps, Flex } from '../../../general';

type TreeViewProps = {
  myProp?: string;
} & BoxProps;

export const TreeView = ({ id }: TreeViewProps) => (
  <Flex id={id}>Template</Flex>
);
