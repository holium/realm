import styled from 'styled-components';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useState } from 'react';
import { Flex } from '../../general';
import { MemeBlock } from './MemeBlock';
import { FragmentReactionType } from '../Bubble/Bubble.types';
import { OnReactionPayload } from '../Bubble/Reaction';

const MemeBlockBackground = styled(Flex)`
  flex-direction: column;
  width: 432px;
  padding: 8px;
  background: rgba(var(--rlm-window-rgba));
`;

export default {
  component: MemeBlock,
} as ComponentMeta<typeof MemeBlock>;

export const Default: ComponentStory<typeof MemeBlock> = () => {
  const [reacts, setReacts] = useState<FragmentReactionType[]>([
    { msgId: '1', by: '~fasnut-famden', emoji: '1f525' },
    { msgId: '2', by: '~zod', emoji: '1f525' },
  ]);
  const ourPatp = '~lomder-librun';
  window.ship = ourPatp;
  const onReaction = (payload: OnReactionPayload) => {
    if (payload.action === 'add') {
      setReacts([...reacts, { msgId: '3', by: ourPatp, emoji: payload.emoji }]);
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
    <Flex flexDirection="row" height={600} gap={16} p={1}>
      <MemeBlockBackground>
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
      </MemeBlockBackground>
    </Flex>
  );
};
