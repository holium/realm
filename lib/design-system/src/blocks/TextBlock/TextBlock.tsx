import { FC } from 'react';
import { Flex, Text } from '../..';
import { BlockProps, Block } from '../Block/Block';
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
    <Block width={rest.width || 'inherit'} {...rest}>
      <Text.Custom fontSize={1} width={rest.width || 'inherit'}>
        {text}
      </Text.Custom>
      <Flex
        className="block-footer"
        flex={1}
        justifyContent="space-between"
        width="inherit"
      >
        <Flex flexDirection="row" gap={4} alignItems="center">
          {reference.image && (
            <motion.img
              draggable={false}
              src={reference.image}
              height={14}
              width={14}
            />
          )}
          <Text.Anchor
            fontSize={0}
            onClick={(evt: React.MouseEvent<HTMLAnchorElement>) => {
              evt.stopPropagation();
              window.open(reference.link, '_blank');
            }}
          >
            {reference.link}
          </Text.Anchor>
        </Flex>

        <Text.Custom className="block-author" noSelection fontSize={0}>
          {by}
        </Text.Custom>
      </Flex>
    </Block>
  );
};
