import { createField, createForm } from 'mobx-easy-form';
import { tokenizeMessage } from 'os/lib/dms';

export const createDmForm = (
  defaults: any = {
    emoji: '',
    message: '',
    attachment: '',
  }
) => {
  const dmForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const dmEmoji = createField({
    id: 'dm-emoji',
    form: dmForm,
    initialValue: defaults.emoji || '',
    validate: (emoji: string) => {
      return { error: undefined, parsed: emoji || null };
    },
  });
  const dmMessage = createField({
    id: 'dm-message',
    form: dmForm,
    initialValue: defaults.message || '',
    validate: (message: string) => {
      if (message.length === 0) {
        return { error: 'empty', parsed: undefined };
      }
      const parsed = tokenizeMessage(message);
      // TODO parse out patp, links, etc here
      return { error: undefined, parsed };
    },
  });
  const dmAttachment = createField({
    id: 'dm-attachment',
    form: dmForm,
    initialValue: defaults.message || '',
    validate: (attachment: string | any) => {
      if (attachment === '') {
        return { error: undefined, parsed: null };
      } else if (typeof attachment !== 'string') {
        return { error: undefined, parsed: [{ url: attachment }] };
      } else {
        // TODO upload to image storage and place URL here
        return { error: undefined, parsed: [{ url: attachment }] };
      }
    },
  });

  return {
    dmForm,
    dmEmoji,
    dmMessage,
    dmAttachment,
  };
};

export interface TextContent {
  text: string;
}
export interface UrlContent {
  url: string;
}
export interface CodeContent {
  code: {
    expression: string;
    output: string[] | undefined;
  };
}

export interface ReferenceContent {
  reference: AppReference | GraphReference | GroupReference;
}
export interface GraphReference {
  graph: {
    graph: string;
    group: string;
    index: string;
  };
}

export interface GroupReference {
  group: string;
}

export interface AppReference {
  app: {
    ship: string;
    desk: string;
    path: string;
  };
}

export interface MentionContent {
  mention: string;
  emphasis?: 'bold' | 'italic';
}
