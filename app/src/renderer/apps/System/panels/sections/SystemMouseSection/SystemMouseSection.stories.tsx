// SystemMouseSection.stories.tsx

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { useToggle } from '@holium/design-system';
import { Flex } from '@holium/design-system/general';

import { SystemMouseSection } from './SystemMouseSection';

export default {
  title: 'OS/System Mouse Section',
} as ComponentMeta<typeof SystemMouseSection>;

export const Demo: ComponentStory<typeof SystemMouseSection> = () => {
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
      <SystemMouseSection
        realmCursorEnabled={realmCursor.isOn}
        setRealmCursor={realmCursor.setToggle}
        profileColorForCursorEnabled={profileColorForCursor.isOn}
        setProfileColorForCursor={profileColorForCursor.setToggle}
      />
    </Flex>
  );
};
