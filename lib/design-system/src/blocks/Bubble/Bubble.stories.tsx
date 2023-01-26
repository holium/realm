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
        sentAt="2022-11-26T10:04:38.000Z"
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
        sentAt="2023-01-26T11:04:38.000Z"
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
        sentAt="2023-01-26T11:04:38.000Z"
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
        sentAt="2023-01-26T11:04:38.000Z"
        message={[
          {
            plain: 'I get this error',
          },
          {
            code: `99% done plugins webpack-hot-middlewarewebpack built preview 643abb6f494255842d56 in 1968ms
webpack building...
99% done plugins webpack-hot-middlewarewebpack built preview c882f45221129543c371 in 2494ms
webpack building...
99% done plugins webpack-hot-middlewarewebpack built preview 4b80b9a66efd70ac5226 in 2279ms`,
          },
        ]}
        onReaction={() => {}}
      />
      <Bubble
        our
        author="~lomder-librun"
        sentAt="2023-01-26T11:04:38.000Z"
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
        sentAt="2023-01-26T11:04:38.000Z"
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
        sentAt="2023-01-26T11:04:38.000Z"
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
        sentAt="2023-01-26T11:04:38.000Z"
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
        sentAt="2023-01-26T11:04:38.000Z"
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
        sentAt="2023-01-26T11:04:38.000Z"
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
        sentAt="2023-01-26T11:04:38.000Z"
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
        sentAt="2023-01-26T11:04:38.000Z"
        message={[
          { plain: 'Run the following command to download' },
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
        sentAt="2023-01-26T11:04:38.000Z"
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
      sentAt="2023-01-25T11:04:38.000Z"
      message={[
        { plain: 'Open Graph' },
        {
          link: 'https://www.cnn.com/2023/01/25/tech/meta-facebook-trump-decision/index.html',
        },
      ]}
      onReaction={() => {}}
    />
    <Bubble
      our
      author="~lomder-librun"
      sentAt="2023-01-26T11:04:38.000Z"
      message={[
        { plain: 'Open Graph' },
        {
          link: 'https://www.theverge.com/2023/1/23/23567333/spotify-layoffs-daniel-ek-cost-cutting',
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
      sentAt="2023-01-26T11:04:38.000Z"
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
      sentAt="2023-01-26T11:04:38.000Z"
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
        sentAt="2023-01-26T11:04:38.000Z"
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
        sentAt="2023-01-26T11:04:38.000Z"
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

export const ReplyTo: ComponentStory<typeof Bubble> = () => (
  <Flex gap={12} flexDirection="column" width={500}>
    <Bubble
      author="~fasnut-famden"
      authorColor="#FF0000"
      sentAt="2023-01-26T11:00:30.000Z"
      message={[
        {
          reply: {
            msgId: '123',
            author: '~lomder-librun',
            message: [{ plain: 'Yo what the hell you talkin bout?' }],
          },
        },
        {
          plain: 'You heard me bitch',
        },
      ]}
      onReaction={() => {}}
    />
    <Bubble
      author="~lomder-librun"
      our
      sentAt="2023-01-26T11:04:38.000Z"
      message={[
        {
          reply: {
            msgId: '123',
            author: '~fasnut-famden',
            message: [{ plain: 'You heard me bitch' }],
          },
        },
        {
          image:
            'https://i.kym-cdn.com/entries/icons/original/000/010/587/Navy_Seal.jpg',
        },
      ]}
      onReaction={() => {}}
    />
    <Bubble
      author="~lodlev-migdev"
      authorColor="#428E65"
      sentAt="2023-01-26T11:04:38.000Z"
      message={[
        {
          reply: {
            msgId: '123',
            author: '~lomder-librun',
            message: [
              {
                image:
                  'https://i.kym-cdn.com/entries/icons/original/000/010/587/Navy_Seal.jpg',
              },
            ],
          },
        },
        {
          plain: 'Ape MAD, APE KILL',
        },
      ]}
      onReaction={() => {}}
    />
    <Bubble
      author="~zod"
      authorColor="#e3a30e"
      sentAt="2023-01-26T11:04:38.000Z"
      message={[
        {
          reply: {
            msgId: '123',
            author: '~lomder-librun',
            message: [
              {
                code: 'https://i.kym-cdn.com/entries/icons/original/000/010/587/Navy_Seal.jpg',
              },
            ],
          },
        },
        {
          plain: 'Um yeah this is what losers do',
        },
      ]}
      onReaction={() => {}}
    />
  </Flex>
);

export const RelicTab: ComponentStory<typeof Bubble> = () => (
  <Flex gap={12} flexDirection="column" width={500}>
    <Bubble
      author="~fasnut-famden"
      authorColor="#428E65"
      sentAt="2023-01-26T11:00:30.000Z"
      message={[
        {
          plain: 'Check this out!',
        },
        {
          tab: {
            url: 'https://boards.4chan.org/pol/',
            favicon: 'https://s.4cdn.org/image/favicon.ico',
            title:
              "/pol/ - Politically Incorrect is 4chan's board for discussing and debating politics and current events.",
          },
        },
      ]}
      onReaction={() => {}}
    />
  </Flex>
);
