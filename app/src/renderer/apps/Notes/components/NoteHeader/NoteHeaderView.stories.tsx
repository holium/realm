import { ComponentMeta, ComponentStory } from '@storybook/react';

import { NoteHeaderView } from './NoteHeaderView';

export default {
  component: NoteHeaderView,
  title: 'Notes/NoteHeader',
} as ComponentMeta<typeof NoteHeaderView>;

export const NoteHeaderStory: ComponentStory<typeof NoteHeaderView> = () => (
  <NoteHeaderView
    title="My Note"
    author="~zod"
    noteUpdatedAtString="Jan 1, 2021, 12:00 PM"
    contextMenuOptions={[]}
    loading={false}
    onChange={() => {}}
    onBlur={() => {}}
  />
);

NoteHeaderStory.storyName = 'Note Header';
