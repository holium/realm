import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useState } from 'react';
import { Flex } from '../..';
import { MemeBlock } from './MemeBlock';
import { FragmentReactionType } from '../../os/Chat/Bubble.types';
import { OnReactionPayload } from '../../os/Chat/Reaction';
import { getVar } from '../../util/colors';

export default {
  component: MemeBlock,
} as ComponentMeta<typeof MemeBlock>;

export const Default: ComponentStory<typeof MemeBlock> = () => {
  const [reacts, setReacts] = useState<FragmentReactionType[]>([
    { author: '~fasnut-famden', emoji: '1f525' },
    { author: '~zod', emoji: '1f525' },
  ]);
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
    <Flex flexDirection="row" height={600} gap={16} p={1}>
      <Flex
        flexDirection="column"
        width={432}
        p={2}
        background={getVar('window')}
      >
        <MemeBlock
          id="meme-block-1"
          mode="display"
          image="https://pbs.twimg.com/media/FmHxG_UX0AACbZY?format=png&name=900x900"
          by="~lomder-librun"
          width={400}
          date="2023-01-26T11:04:38.000Z"
          reactions={reacts}
          onReaction={onReaction}
        />
      </Flex>
    </Flex>
  );
};
