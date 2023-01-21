import { FC } from 'react';
import styled from 'styled-components';
import { Flex, Text, BoxProps, Box } from '../..';

const BubbleStyle = styled(Box)`
  display: flex;
  flex-direction: column;
  width: auto;
  gap: 2px;
  padding: 6px 12px 6px 8px;
  font-size: 14px;
  background: var(--rlm-input-color);
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.2);
  border-radius: 9px 9px 9px 0px;
`;

const BubbleAuthor = styled(Text.Custom)<{ authorColor: string }>`
  font-size: 12px;
  font-weight: 500;
  color: ${(props) => props.authorColor};
`;

const BubbleFooter = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
`;

type TemplateProps = {
  author: string;
  authorColor?: string;
  our?: boolean;
  message?: any[];
} & BoxProps;

export const Bubble: FC<TemplateProps> = (props: TemplateProps) => {
  const { id, author, authorColor = '#000', message } = props;

  return (
    <Flex display="inline-flex">
      <BubbleStyle id={id}>
        <BubbleAuthor authorColor={authorColor}>{author}</BubbleAuthor>
        {message?.map((item, index) => {
          return <Text.Custom key={index}>{item.text}</Text.Custom>;
        })}
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
