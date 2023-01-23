import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useState } from 'react';
import { Flex } from '../..';
import { Bubble } from './Bubble';
import { FragmentReactionType } from './Bubble.types';
import { OnReactionPayload } from './Reaction';

export default {
  component: Bubble,
} as ComponentMeta<typeof Bubble>;

export const Default: ComponentStory<typeof Bubble> = () => {
  return (
    <Flex gap={12} flexDirection="column" width={500}>
      <Bubble
        author="~fasnut-famden"
        authorColor="#FF0000"
        message={[
          {
            plain:
              'Yesterday, I wrote up a company handbook. Check it out and let me know',
          },
          { ship: '~lomder-librun' },
        ]}
        onReaction={() => {}}
      />
      <Bubble
        our
        author="~lomder-librun"
        message={[
          { plain: 'Yo we should do XYZ in' },
          { bold: 'bold' },
          { plain: 'and' },
          { italics: 'italics' },
        ]}
        onReaction={() => {}}
      />
      <Bubble
        our
        author="~lomder-librun"
        message={[
          { plain: 'Run the following command' },
          {
            'inline-code':
              'npx cross-env DEBUG_PROD=true yarn package:prerelease:mac',
          },
          { plain: 'and then let me know whats up' },
        ]}
        onReaction={() => {}}
      />
      <Bubble
        author="~fasnut-famden"
        authorColor="#FF0000"
        message={[
          {
            plain: 'I get this error',
          },
          {
            code: `
99% done plugins webpack-hot-middlewarewebpack built preview 643abb6f494255842d56 in 1968ms
webpack building...
99% done plugins webpack-hot-middlewarewebpack built preview c882f45221129543c371 in 2494ms
webpack building...
99% done plugins webpack-hot-middlewarewebpack built preview 4b80b9a66efd70ac5226 in 2279ms
          `,
          },
        ]}
        onReaction={() => {}}
      />
      <Bubble
        our
        author="~lomder-librun"
        message={[
          { plain: 'Meme drop' },
          {
            image:
              'https://pbs.twimg.com/media/FnC6z0VXkAA6XQe?format=png&name=small',
          },
        ]}
        onReaction={() => {}}
      />
    </Flex>
  );
};

export const Embeds: ComponentStory<typeof Bubble> = () => (
  <Flex gap={12} flexDirection="column" width={500}>
    <Bubble
      author="~fasnut-famden"
      authorColor="#FF0000"
      message={[
        {
          image:
            'https://pbs.twimg.com/media/FnC6z0VXkAA6XQe?format=png&name=small',
        },
      ]}
      onReaction={() => {}}
    />
    <Bubble
      our
      author="~lomder-librun"
      message={[
        { plain: 'Check this out' },
        {
          image:
            'https://pbs.twimg.com/media/FnFbARxXEAAoiuf?format=jpg&name=medium',
        },
      ]}
      onReaction={() => {}}
    />
  </Flex>
);

export const Reactions: ComponentStory<typeof Bubble> = () => {
  const [reacts, setReacts] = useState<FragmentReactionType[]>([]);
  const ourPatp = '~lomder-librun';
  window.ship = ourPatp;
  const onReaction = (payload: OnReactionPayload) => {
    if (payload.action === 'add') {
      setReacts([...reacts, { by: ourPatp, emoji: payload.emoji }]);
    } else {
      const removeIdx = reacts.findIndex(
        (r) => r.emoji === payload.emoji && r.by === ourPatp
      );
      if (removeIdx === -1) {
        return;
      }
      setReacts(reacts.filter((_, idx) => idx !== removeIdx));
    }
  };
  return (
    <Flex gap={12} flexDirection="column" width={500}>
      <Bubble
        author="~fasnut-famden"
        authorColor="#FF0000"
        message={[
          {
            image:
              'https://pbs.twimg.com/media/FnC6z0VXkAA6XQe?format=png&name=small',
          },
        ]}
        reactions={reacts}
        onReaction={onReaction}
      />
      <Bubble
        our
        author="~lomder-librun"
        message={[
          { plain: 'Check this out' },
          {
            image:
              'https://pbs.twimg.com/media/FnFbARxXEAAoiuf?format=jpg&name=medium',
          },
        ]}
        reactions={[]}
        onReaction={() => {}}
      />
    </Flex>
  );
};
