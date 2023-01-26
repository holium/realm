import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Flex, Text } from '../..';
import { BlockProps, Block } from '../Block/Block';
import { FragmentReactionType, FragmentType } from '../Bubble/Bubble.types';
import { FragmentBlock, renderFragment } from '../Bubble/fragment-lib';
import {
  Reactions,
  ReactionAggregateType,
  OnReactionPayload,
} from '../Bubble/Reaction';

import { timelineDate } from '../../util/date';

export const MemeStyle = styled(motion.img)`
  width: 100%;
  max-width: 25rem;
  border-radius: 4px;
  margin-bottom: 0.1rem;
`;

export const FadedText = styled(Text.Custom)`
  font-size: 0.89rem;
  opacity: 0.6;
`;

type MemeBlockProps = {
  image: string;
  by: string;
  date: string;
  reactions?: FragmentReactionType[];
  onReaction: (payload: OnReactionPayload) => void;
} & BlockProps;

export const MemeBlock: FC<MemeBlockProps> = (props: MemeBlockProps) => {
  const { image, by, date, reactions = [], onReaction, ...rest } = props;

  const dateDisplay = timelineDate(new Date(date));

  return (
    <Block {...rest}>
      <MemeStyle src={image} draggable={false} />
      <Flex
        width="100%"
        justifyContent="space-between"
        className="block-footer"
      >
        <FadedText>{by}</FadedText>
        <FadedText>{dateDisplay}</FadedText>
      </Flex>
      <Reactions
        variant="inline"
        size="large"
        reactions={reactions}
        onReaction={onReaction}
      />
    </Block>
  );
};
