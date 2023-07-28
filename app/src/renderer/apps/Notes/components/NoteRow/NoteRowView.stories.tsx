import { ComponentMeta, ComponentStory } from '@storybook/react';

import { NoteRowView } from './NoteRowView';

export default {
  component: NoteRowView,
  title: 'Notes/NoteRow',
} as ComponentMeta<typeof NoteRowView>;

export const NoteRowStory: ComponentStory<typeof NoteRowView> = () => (
  <NoteRowView
    id="note-row-id"
    title="My Note"
    preview="This is the first paragraph."
    author="~zod"
    date="2021/01/01"
    participants={[]}
    isSelected={false}
    isPersonal={false}
    onClick={() => {}}
  />
);

NoteRowStory.storyName = 'Note Row';
