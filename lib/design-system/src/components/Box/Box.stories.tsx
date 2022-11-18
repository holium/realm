import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Box } from './Box';

export default {
  component: Box,
} as ComponentMeta<typeof Box>;

export const Unstyled: ComponentStory<typeof Box> = () => <Box>Unstyled</Box>;

export const WithBackground: ComponentStory<typeof Box> = () => (
  <>
    <Box bg="pink">Pink</Box>
    <Box bg="primary">Primary (from theme)</Box>
  </>
);

export const WithTextDecoration: ComponentStory<typeof Box> = () => (
  <>
    <Box textDecoration="overline">Overline</Box>
    <Box textDecoration="underline">Underline</Box>
    <Box textDecoration="line-through">Line-through</Box>
  </>
);
