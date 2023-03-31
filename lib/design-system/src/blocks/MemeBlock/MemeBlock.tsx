import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Flex, Text } from '../../general';
import { BlockProps, Block } from '../Block/Block';
import { FragmentReactionType } from '../Bubble/Bubble.types';
import { Reactions, OnReactionPayload } from '../Bubble/Reaction';
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

export const MemeBlock = ({
  image,
  by,
  date,
  reactions = [],
  onLoaded,
  onReaction,
  ...rest
}: MemeBlockProps) => {
  const dateDisplay = timelineDate(new Date(date));

  return (
    <Block {...rest}>
      <MemeStyle
        src={image}
        onLoad={() => {
          onLoaded && onLoaded();
        }}
        draggable={false}
      />
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
