import { FC } from 'react';
import { Flex, BoxProps } from '../../';

type TabProps = {
  myProp?: string;
} & BoxProps;

export const Tab: FC<TabProps> = (props: TabProps) => {
  const { id, myProp } = props;

  return <Flex id={id}>Template</Flex>;
};
