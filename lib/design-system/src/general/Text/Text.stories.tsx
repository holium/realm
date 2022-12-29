import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../components/Flex/Flex';
import { Text } from '.';

export default {
  component: Text.Default,
} as ComponentMeta<typeof Text.Default>;

export const All: ComponentStory<typeof Text.Default> = () => (
  <Flex flexDirection="column" gap={12}>
    <Text.H1>H1 style</Text.H1>
    <Text.H2>H2 style</Text.H2>
    <Text.H3>H3 style</Text.H3>
    <Text.H4>H4 style</Text.H4>
    <Text.H5>H5 style</Text.H5>
    <Text.H6>H6 style</Text.H6>
    <Text.Body>Body text</Text.Body>
    <Text.Caption>Caption text</Text.Caption>
    <Text.Hint>Hint text</Text.Hint>
    <Text.Label>Label text</Text.Label>
    <Text.Patp>Patp style</Text.Patp>
  </Flex>
);
