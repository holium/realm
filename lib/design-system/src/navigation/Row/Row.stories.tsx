import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../';
import { Row } from './';

export default {
  component: Row,
} as ComponentMeta<typeof Row>;

export const Default: ComponentStory<typeof Row> = () => (
  <Flex flexDirection="column">
    <Row />
  </Flex>
);
