import { ComponentStory, ComponentMeta } from '@storybook/react';
import { MenuItem } from './MenuItem';

export default {
  component: MenuItem,
} as ComponentMeta<typeof MenuItem>;

export const Default: ComponentStory<typeof MenuItem> = () => (
  <MenuItem
    label="I'm a menu item"
    onClick={() => console.log('I was clicked')}
  />
);
