import { FC } from 'react';
import styled from 'styled-components';
import { Flex, Text } from 'renderer/components';

interface ITextParsed {
  index?: string;
  content: string;
}

type TokenTypes = 'code' | 'text' | 'mention' | 'link' | 'tag' | 'emoticon';
type TokenType = {
  content: string;
  type: TokenTypes;
};

const TextContainer = styled(Flex)`
  flex-direction: row;
  flex-wrap: wrap;
`;

const detectTokens = (content: string): TokenType[] => {
  // TODO better token detection here
  let tokens: TokenType[] = [];
  // Pass 1, check for code
  // const colSections = content.split('```');
  // const inlineSections = content.split('`');
  // console.log(colSections, inlineSections);
  // if (sections.length > 1) {
  //   // there is code
  // } else {
  //   tokens.push({ type: 'text', content });
  // }
  // Pass 2, check for tags
  tokens.push({ type: 'text', content });

  return tokens;
};

export const TextParsed: FC<ITextParsed> = (props: ITextParsed) => {
  const tokens = detectTokens(props.content);
  return (
    <TextContainer>
      {tokens.map((token: TokenType, tindex: number) => (
        <Text key={`token-${tindex}`} fontSize={2}>
          {token.content}
        </Text>
      ))}
    </TextContainer>
  );
};
