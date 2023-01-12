import { Flex, Text, Box } from '../../';
import { FC } from 'react';
import { BlockProps, Block } from '../Block';
import { motion } from 'framer-motion';

type TextBlockProps = {
  text: string;
  by: string;
  reference: {
    image: string; // favicon
    link: string;
  };
  metadata?: any;
} & BlockProps;

export const TextBlock: FC<TextBlockProps> = (props: TextBlockProps) => {
  const { text, by, reference, metadata, ...rest } = props;

  return (
    <Block {...rest}>
      <Text.Body>{text}</Text.Body>
      <Flex>
        <Flex flexDirection="row" gap={4} alignItems="center">
          {reference.image && (
            <motion.img src={reference.image} height={14} width={14} />
          )}
          <Text.Hint>{reference.link}</Text.Hint>
        </Flex>
      </Flex>
    </Block>
  );
};
