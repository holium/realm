import { FC } from 'react';
import { Flex, BoxProps } from '../../';

type TemplateProps = {
  myProp?: string;
} & BoxProps;

export const Template = (props: TemplateProps) => {
  const { id, myProp } = props;

  return <Flex id={id}>Template</Flex>;
};
