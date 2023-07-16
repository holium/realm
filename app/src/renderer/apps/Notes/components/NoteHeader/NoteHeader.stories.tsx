import { ComponentMeta, ComponentStory } from '@storybook/react';

import { NoteHeader } from './NoteHeader';

export default {
  component: NoteHeader,
  title: 'Notes/NoteHeader',
} as ComponentMeta<typeof NoteHeader>;

export const NoteHeaderStory: ComponentStory<typeof NoteHeader> = () => (
  <NoteHeader noteAuthor="~zod" noteTitle="My Note" onClickDelete={() => {}} />
);

NoteHeaderStory.storyName = 'NoteHeader';
