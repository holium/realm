import { FC } from 'react';
import { Flex, BoxProps } from '../../';

type RowProps = {
  myProp?: string;
} & BoxProps;

export const Row: FC<RowProps> = (props: RowProps) => {
  const { id, myProp } = props;

  return <Flex id={id}>Template</Flex>;
};
