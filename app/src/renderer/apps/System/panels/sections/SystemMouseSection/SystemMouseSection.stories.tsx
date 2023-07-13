// SystemMouseSection.stories.tsx

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import { SystemMouseSectionView } from './SystemMouseSectionView';

export default {
  title: 'OS/System Mouse Section',
} as ComponentMeta<typeof SystemMouseSectionView>;

export const Demo: ComponentStory<typeof SystemMouseSectionView> = () => {
  const realmCursor = useToggle(false);
  const profileColorForCursor = useToggle(false);

  return (
    <Flex
      style={{
        maxWidth: 500,
        width: '100%',
        margin: '24px auto',
      }}
    >
      <SystemMouseSectionView
        realmCursorEnabled={realmCursor.isOn}
        setRealmCursor={realmCursor.setToggle}
        profileColorForCursorEnabled={profileColorForCursor.isOn}
        setProfileColorForCursor={profileColorForCursor.setToggle}
      />
    </Flex>
  );
};
