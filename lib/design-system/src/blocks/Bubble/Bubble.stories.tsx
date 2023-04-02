import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useState } from 'react';
import { FragmentReactionType } from './Bubble.types';
import { OnReactionPayload } from './Reaction';
import { Flex, Bubble, Box } from '../../index';

export default {
  component: Bubble,
} as ComponentMeta<typeof Bubble>;

export const Default: ComponentStory<typeof Bubble> = () => {
  return (
    <Box pt={4} px={4}>
      <Flex gap={12} flexDirection="column" width={500}>
        <Bubble
          id={'i-1'}
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
          onMeasure={() => {}}
        />
        <Bubble
          id={'i-2'}
          isOur
          author="~lomder-librun"
          authorColor="#FF0000"
          ourColor="#F08735"
          sentAt="2023-01-26T11:04:38.000Z"
          message={[
            { plain: 'Yo we should do XYZ in' },
            { bold: 'bold' },
            { plain: 'and' },
            { italics: 'italics' },
          ]}
          onReaction={() => {}}
          onMeasure={() => {}}
        />
        <Bubble
          id={'i-3'}
          isOur
          author="~lomder-librun"
          sentAt="2023-01-26T11:04:38.000Z"
          ourColor="#F08735"
          message={[
            { plain: 'Run the following command' },
            {
              'inline-code':
                'npx cross-env DEBUG_PROD=true yarn package:prerelease:mac',
            },
            { plain: 'and then let me know whats up' },
          ]}
          onReaction={() => {}}
          onMeasure={() => {}}
        />
        <Bubble
          id={'i-4'}
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
          onMeasure={() => {}}
        />
        <Bubble
          id={'i-5'}
          isOur
          author="~lomder-librun"
          ourColor="#F08735"
          sentAt="2023-01-26T11:04:38.000Z"
          message={[
            { plain: 'Meme drop' },
            {
              image:
                'https://www.memeatlas.com/images/boomers/boomer-toilet-paper-back-pack.jpg',
            },
          ]}
          onReaction={() => {}}
          onMeasure={() => {}}
        />
      </Flex>
    </Box>
  );
};

export const BlockQuote: ComponentStory<typeof Bubble> = () => {
  return (
    <Flex gap={12} flexDirection="column" width={500}>
      <Bubble
        id={'i-1'}
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
        onMeasure={() => {}}
      />
      <Bubble
        id={'i-2'}
        isOur
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
        onMeasure={() => {}}
      />
    </Flex>
  );
};

export const InlineCode: ComponentStory<typeof Bubble> = () => {
  return (
    <Flex gap={12} flexDirection="column" width={500}>
      <Bubble
        id={'i-1'}
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
        onMeasure={() => {}}
      />
      <Bubble
        id={'i-2'}
        isOur
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
        onMeasure={() => {}}
      />
    </Flex>
  );
};

export const Mentions: ComponentStory<typeof Bubble> = () => {
  return (
    <Flex gap={12} flexDirection="column" width={500}>
      <Bubble
        id={'i-1'}
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
        onMeasure={() => {}}
      />
      <Bubble
        id={'i-2'}
        isOur
        author="~lomder-librun"
        sentAt="2023-01-26T11:04:38.000Z"
        message={[
          {
            plain: 'Whatever',
          },
          { ship: '~fasnut-famden' },
        ]}
        onReaction={() => {}}
        onMeasure={() => {}}
      />
    </Flex>
  );
};

export const CodeBlock: ComponentStory<typeof Bubble> = () => {
  return (
    <Flex gap={12} flexDirection="column" width={500}>
      <Bubble
        id={'i-1'}
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
        onMeasure={() => {}}
      />
      <Bubble
        id={'i-2'}
        isOur
        author="~lomder-librun"
        sentAt="2023-01-26T11:04:38.000Z"
        message={[
          {
            code: 'wget -qO - https://raw.githubusercontent.com/linux-surface/linux-surface/master/pkg/keys/surface.asc \
    | gpg --dearmor | sudo dd of=/etc/apt/trusted.gpg.d/linux-surface.gpg',
          },
        ]}
        onReaction={() => {}}
        onMeasure={() => {}}
      />
    </Flex>
  );
};

export const Link: ComponentStory<typeof Bubble> = () => (
  <Flex gap={12} flexDirection="column" width={500}>
    <Bubble
      id={'i-1'}
      author="~fasnut-famden"
      authorColor="#FF0000"
      sentAt="2023-01-25T11:04:38.000Z"
      message={[
        { plain: 'Open Graph' },
        {
          link: 'https://www.coindesk.com/layer2/2022/09/24/urbit-cisOurts-daos-crypto-teams-in-push-to-make-internet-p2p-again/',
        },
      ]}
      onReaction={() => {}}
      onMeasure={() => {}}
    />

    <Bubble
      id={'i-2'}
      isOur
      author="~lomder-librun"
      sentAt="2023-01-26T11:04:38.000Z"
      message={[
        { plain: 'Epic shit here' },
        {
          link: 'https://twitter.com/AidenSolaran/status/1603513958459121682?s=20&t=LKirXqLOIXG8Ff_TS-2HCw',
        },
      ]}
      onReaction={() => {}}
      onMeasure={() => {}}
    />
    <Bubble
      id={'i-3'}
      author="~lodlev-migdev"
      sentAt="2023-01-26T11:06:38.000Z"
      message={[
        {
          link: 'https://www.theverge.com/2023/1/23/23567333/spotify-layoffs-daniel-ek-cost-cutting',
        },
      ]}
      onReaction={() => {}}
      onMeasure={() => {}}
    />
  </Flex>
);

export const Image: ComponentStory<typeof Bubble> = () => (
  <Flex gap={12} flexDirection="column" width={500}>
    <Bubble
      id={'i-1'}
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
      onMeasure={() => {}}
    />
    <Bubble
      id={'i-2'}
      isOur
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
      onMeasure={() => {}}
    />
  </Flex>
);

export const Reactions: ComponentStory<typeof Bubble> = () => {
  const [reacts, setReacts] = useState<FragmentReactionType[]>([]);
  const isOurPatp = '~lomder-librun';
  window.ship = isOurPatp;
  const onReaction = (payload: OnReactionPayload) => {
    if (payload.action === 'add') {
      setReacts([
        ...reacts,
        { msgId: '0', by: isOurPatp, emoji: payload.emoji },
      ]);
    } else {
      const removeIdx = reacts.findIndex(
        (r) => r.emoji === payload.emoji && r.by === isOurPatp
      );
      if (removeIdx === -1) {
        return;
      }
      setReacts(reacts.filter((_, idx) => idx !== removeIdx));
    }
  };
  return (
    <Flex ml={400} mt={50} gap={12} flexDirection="column" width={500}>
      <Bubble
        id={'i-1'}
        ourColor="#FF0000"
        ourShip="~fasnut-famden"
        author="~fasnut-famden"
        authorColor="#FF0000"
        sentAt="2023-01-26T11:04:38.000Z"
        isEdited
        message={[
          {
            image:
              'https://pbs.twimg.com/media/FnC6z0VXkAA6XQe?format=png&name=small',
          },
        ]}
        reactions={reacts}
        onReaction={onReaction}
        onMeasure={() => {}}
      />
      <Bubble
        id={'i-2'}
        isOur
        ourColor="#9664FF"
        ourShip="~fasnut-famden"
        author="~fasnut-famden"
        sentAt="2023-01-26T11:04:38.000Z"
        message={[
          {
            image:
              'https://www.memeatlas.com/images/wojaks/wojak-npc-thinks-he-isnt-npc.jpg',
          },
        ]}
        reactions={[
          { msgId: '1', by: '~lodlev-migdev', emoji: '1f44d' },
          { msgId: '2', by: '~fasnut-famden', emoji: '1f44d' },
          { msgId: '3', by: '~zod', emoji: '1f525' },
          { msgId: '4', by: '~dev', emoji: '1f525' },
          { msgId: '5', by: '~fes', emoji: '1f525' },
        ]}
        onReaction={() => {}}
        onMeasure={() => {}}
      />
    </Flex>
  );
};

export const ReplyTo: ComponentStory<typeof Bubble> = () => (
  <Flex gap={12} flexDirection="column" width={500}>
    <Bubble
      id={'i-1'}
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
      onMeasure={() => {}}
    />
    <Bubble
      id={'i-2'}
      author="~lomder-librun"
      isOur
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
      onMeasure={() => {}}
    />
    <Bubble
      id={'i-3'}
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
      onMeasure={() => {}}
    />
    <Bubble
      id={'i-4'}
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
      onMeasure={() => {}}
    />
  </Flex>
);

export const RelicTab: ComponentStory<typeof Bubble> = () => (
  <Flex gap={12} flexDirection="column" width={500}>
    <Bubble
      id={'i-1'}
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
      onMeasure={() => {}}
    />
  </Flex>
);
