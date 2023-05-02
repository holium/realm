import { ComponentMeta, ComponentStory } from '@storybook/react';

import { WalletList } from './List';

export default {
  title: 'OS/WalletList',
  component: WalletList,
} as ComponentMeta<typeof WalletList>;

export const Default: ComponentStory<typeof WalletList> = () => {
  return <WalletList />;
};
