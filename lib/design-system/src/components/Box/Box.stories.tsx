import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Box } from './Box';

export default {
  component: Box,
} as ComponentMeta<typeof Box>;

export const Demo: ComponentStory<typeof Box> = (args) => <Box {...args} />;
Demo.args = {
  bg: 'accent',
  color: 'window',
  padding: 10,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'border',
  children: "I'm a box. Try changing the controls.",
  textDecoration: undefined,
};

export const TextDecoration: ComponentStory<typeof Box> = () => (
  <>
    <Box mb="10px" textDecoration="overline">
      Overline
    </Box>
    <Box mb="10px" textDecoration="underline">
      Underline
    </Box>
    <Box mb="10px" textDecoration="line-through">
      Line-through
    </Box>
  </>
);
