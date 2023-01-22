import { FC } from 'react';
import { Flex, Text, BoxProps } from '../..';
import { BubbleStyle, BubbleAuthor, BubbleFooter } from './Bubble.styles';
import { FragmentBlock, renderFragment } from './fragment-lib';

type TemplateProps = {
  author: string;
  authorColor?: string;
  our?: boolean;
  message?: any[];
} & BoxProps;

export const Bubble: FC<TemplateProps> = (props: TemplateProps) => {
  const { id, author, our, authorColor = '#000', message } = props;

  return (
    <Flex
      display="inline-flex"
      justifyContent={our ? 'flex-end' : 'flex-start'}
    >
      <BubbleStyle id={id} our={our}>
        {!our && (
          <BubbleAuthor authorColor={authorColor}>{author}</BubbleAuthor>
        )}
        <FragmentBlock>
          {message?.map((fragment, index) => {
            let lineBreak = false;
            if (index > 0) {
              const fragmentType = Object.keys(fragment)[0];
              lineBreak =
                fragmentType === 'image' ||
                fragmentType === 'video' ||
                fragmentType === 'audio' ||
                fragmentType === 'link'
                  ? true
                  : false;
            }
            return (
              <>
                {lineBreak && <br />}
                {renderFragment(fragment, index, author)}
              </>
            );
          })}
        </FragmentBlock>
        <BubbleFooter>
          <Flex>{/* Reaction logic goes here */}</Flex>
          <Text.Custom alignSelf="flex-end" opacity={0.5}>
            6:07 AM
          </Text.Custom>
        </BubbleFooter>
      </BubbleStyle>
    </Flex>
  );
};
