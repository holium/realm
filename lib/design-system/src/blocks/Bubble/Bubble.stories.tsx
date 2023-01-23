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

export const BlockQuote: ComponentStory<typeof Bubble> = () => {
  return (
    <Flex gap={12} flexDirection="column" width={500}>
      <Bubble
        author="~fasnut-famden"
        authorColor="#FF0000"
        message={[
          { plain: 'Hello' },
          {
            blockquote: 'its a blockquote aint it fun',
          },
          { plain: 'woooohooo' },
        ]}
        onReaction={() => {}}
      />
      <Bubble
        our
        author="~lomder-librun"
        message={[
          { plain: 'Hello' },
          {
            blockquote:
              'its a blockquote that is longer than one line so i need to type this out a lot to make it long enough',
          },
          { plain: 'woooohooo' },
        ]}
        onReaction={() => {}}
      />
    </Flex>
  );
};

export const InlineCode: ComponentStory<typeof Bubble> = () => {
  return (
    <Flex gap={12} flexDirection="column" width={500}>
      <Bubble
        author="~fasnut-famden"
        authorColor="#FF0000"
        message={[
          { plain: 'Run the following command' },
          {
            'inline-code':
              'npx cross-env DEBUG_PROD=true yarn package:prerelease:mac',
          },
          { plain: 'and then let me know whats up. You may need to make sure' },
          {
            'inline-code': 'NODE_ENV=production',
          },
          { plain: 'before running' },
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
    </Flex>
  );
};

export const Mentions: ComponentStory<typeof Bubble> = () => {
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
          {
            plain: 'Whatever',
          },
          { ship: '~fasnut-famden' },
        ]}
        onReaction={() => {}}
      />
    </Flex>
  );
};

export const CodeBlock: ComponentStory<typeof Bubble> = () => {
  return (
    <Flex gap={12} flexDirection="column" width={500}>
      <Bubble
        author="~fasnut-famden"
        authorColor="#FF0000"
        message={[
          {
            code: 'wget -qO - https://raw.githubusercontent.com/linux-surface/linux-surface/master/pkg/keys/surface.asc \
    | gpg --dearmor | sudo dd of=/etc/apt/trusted.gpg.d/linux-surface.gpg',
          },
        ]}
        onReaction={() => {}}
      />
      <Bubble
        our
        author="~lomder-librun"
        message={[
          {
            code: 'wget -qO - https://raw.githubusercontent.com/linux-surface/linux-surface/master/pkg/keys/surface.asc \
    | gpg --dearmor | sudo dd of=/etc/apt/trusted.gpg.d/linux-surface.gpg',
          },
        ]}
        onReaction={() => {}}
      />
    </Flex>
  );
};

export const Link: ComponentStory<typeof Bubble> = () => (
  <Flex gap={12} flexDirection="column" width={500}>
    <Bubble
      author="~fasnut-famden"
      authorColor="#FF0000"
      message={[
        { plain: 'Open Graph' },
        {
          link: [
            'Spotify is laying off six percent of its global workforce, CEO announces',
            'https://www.theverge.com/2023/1/23/23567333/spotify-layoffs-daniel-ek-cost-cutting',
          ],
        },
      ]}
      onReaction={() => {}}
    />
    <Bubble
      our
      author="~lomder-librun"
      message={[
        { plain: 'Open Graph' },
        {
          link: [
            'Spotify is laying off six percent of its global workforce, CEO announces',
            'https://www.theverge.com/2023/1/23/23567333/spotify-layoffs-daniel-ek-cost-cutting',
          ],
        },
      ]}
      onReaction={() => {}}
    />
  </Flex>
);

export const Image: ComponentStory<typeof Bubble> = () => (
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
      setReacts([...reacts, { author: ourPatp, emoji: payload.emoji }]);
    } else {
      const removeIdx = reacts.findIndex(
        (r) => r.emoji === payload.emoji && r.author === ourPatp
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
        author="~fasnut-famden"
        authorColor="#FF0000"
        message={[
          {
            image:
              'https://pbs.twimg.com/media/FnC6z0VXkAA6XQe?format=png&name=small',
          },
        ]}
        reactions={[
          { author: '~lodlev-migdev', emoji: '1f44d' },
          { author: '~fasnut-famden', emoji: '1f44d' },
          { author: '~zod', emoji: '1f525' },
          { author: '~dev', emoji: '1f525' },
          { author: '~fes', emoji: '1f525' },
        ]}
        onReaction={() => {}}
      />
    </Flex>
  );
};
