import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { DialogViewContainer } from 'renderer/system/dialog/Dialog/Dialog.styles';

import { EditSpaceBody } from './EditSpaceBody';

export default {
  title: 'OS/Create or edit space',
  component: EditSpaceBody,
} as ComponentMeta<typeof EditSpaceBody>;

export const Demo: ComponentStory<typeof EditSpaceBody> = () => {
  return (
    <DialogViewContainer>
      <EditSpaceBody
        isGroupSpace={false}
        initialName="My Space"
        initialDescription="This is my space"
        initialColor="#000000"
        initialImage=""
        initialAccessOption="public"
        updateState={action('updateState')}
      />
    </DialogViewContainer>
  );
};
