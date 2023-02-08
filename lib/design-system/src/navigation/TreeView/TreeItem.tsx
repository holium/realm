import { Flex, BoxProps } from '../../';

type TreeItemProps = {
  myProp?: string;
} & BoxProps;

export const TreeItem = ({ id }: TreeItemProps) => (
  <Flex id={id}>Template</Flex>
);
