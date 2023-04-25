import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '../../../general';

import { Row } from './Row';

export default {
  component: Row,
} as ComponentMeta<typeof Row>;

export const Default: ComponentStory<typeof Row> = () => (
  <Flex gap={8} flexDirection="column" width={300}>
    <Row>This is a row</Row>
    <Row selected>A selected row</Row>
    <Row disabled>A disabled row</Row>
  </Flex>
);
