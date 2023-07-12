import { BoxProps, Flex } from '../../../general';

type TreeItemProps = {
  myProp?: string;
} & BoxProps;

export const TreeItem = ({ id }: TreeItemProps) => (
  <Flex id={id}>Template</Flex>
);
