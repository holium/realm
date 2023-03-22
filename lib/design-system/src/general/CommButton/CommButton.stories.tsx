import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { CommButton } from './CommButton';

export default {
  component: CommButton,
} as ComponentMeta<typeof CommButton>;

export const Default: ComponentStory<typeof CommButton> = () => {
  const [icon, setIcon] = useState('MicOn');

  return (
    <CommButton
      icon={icon}
      customBg="#F5F5F4"
      onClick={() => (icon === 'MicOn' ? setIcon('MicOff') : setIcon('MicOn'))}
    />
  );
};
