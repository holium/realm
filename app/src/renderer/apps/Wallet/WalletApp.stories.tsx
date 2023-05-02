import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Create } from './views/common/New/Create';

export default {
  title: 'OS/Wallet',
} as ComponentMeta<typeof Create>;

export const CreateStory: ComponentStory<typeof Create> = ({}) => {
  return <Create setScreen={() => {}} />;
};
