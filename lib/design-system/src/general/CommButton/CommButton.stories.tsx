import { useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { IconPathsType } from '../../../general';
import { CommButton } from './CommButton';

export default {
  component: CommButton,
} as ComponentMeta<typeof CommButton>;

export const Default: ComponentStory<typeof CommButton> = () => {
  const [icon, setIcon] = useState<IconPathsType>('MicOn');

  return (
    <CommButton
      icon={icon}
      tooltip={null}
      onClick={() => (icon === 'MicOn' ? setIcon('MicOff') : setIcon('MicOn'))}
    />
  );
};
