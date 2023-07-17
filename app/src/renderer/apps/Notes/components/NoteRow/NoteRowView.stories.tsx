import { ComponentMeta, ComponentStory } from '@storybook/react';
import { schema } from 'prosemirror-schema-basic';

import { NoteRowView } from './NoteRowView';

export default {
  component: NoteRowView,
  title: 'Notes/NoteRow',
} as ComponentMeta<typeof NoteRowView>;

export const NoteRowStory: ComponentStory<typeof NoteRowView> = () => (
  <NoteRowView
    id="note-row-id"
    note={{
      id: 'note-id',
      author: '~zod',
      space: '/~zod/our',
      title: 'My Note',
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [
          schema.text('This is the first paragraph.'),
        ]),
      ]),
      created_at: Date.now() - 1000,
      updated_at: Date.now(),
    }}
    isSelected={false}
    isPersonal={false}
    onClick={() => {}}
  />
);

NoteRowStory.storyName = 'Note Row';
