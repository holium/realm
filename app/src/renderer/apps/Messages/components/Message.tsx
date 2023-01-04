import { useMemo } from 'react';
import styled from 'styled-components';
import {
  compose,
  color,
  fontStyle,
  FontStyleProps,
  FontSizeProps,
  FontWeightProps,
  OpacityProps,
  ColorProps,
  fontSize,
  fontWeight,
  opacity,
} from 'styled-system';
import { motion } from 'framer-motion';
import { Flex, Text, LinkPreview, Mention } from 'renderer/components';
import { TextParsed } from './TextContent';
import { ReferenceView, getTextFromContent } from '../helpers/parser';

interface DMContact {
  type: 'text' | 'url' | 'mention' | 'code' | 'reference' | string;
  content: any;
  color?: string;
  textColor?: string;
  bgColor?: string;
  onImageLoad?: () => void;
}

const isImage = (url: string) => {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
};

type StyledMessageProps = FontStyleProps &
  OpacityProps &
  FontSizeProps &
  FontWeightProps &
  ColorProps;

const StyledMessage = styled(motion.div)<StyledMessageProps>`
  padding: 0px;
  line-height: 22px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  user-select: text;
  ${compose(fontStyle, fontSize, fontWeight, opacity, color)}
`;

export const Message = ({
  type,
  content,
  color,
  bgColor,
  textColor,
  onImageLoad,
}: DMContact) => {
  let messageContainer: JSX.Element | null = null;
  const message: string = getTextFromContent(type, content);

  switch (type) {
    case 'text':
      messageContainer = <TextParsed content={message} />;
      break;
    case 'url':
      if (isImage(message)) {
        messageContainer = (
          <a href={message}>
            <img
              className="realm-cursor-hover"
              style={{ borderRadius: 8 }}
              height="auto"
              width={250}
              src={message}
              onLoad={onImageLoad}
            />
          </a>
        );
      } else {
        messageContainer = (
          <Flex flexDirection="row" mb={1} minWidth={250}>
            <LinkPreview
              textColor={textColor}
              customBg={bgColor}
              link={message}
            />
          </Flex>
        );
      }
      break;
    case 'reference':
      if (typeof content.reference === 'string') {
        messageContainer = content.reference;
      } else {
        messageContainer = (
          <ReferenceView
            reference={content.reference}
            embedColor={bgColor}
            textColor={textColor}
          />
        );
      }
      break;
    case 'mention':
      messageContainer = <Mention color={color} patp={message} />;
      break;
    case 'code':
      console.log('code!', message);
      if (typeof message === 'string') {
        messageContainer = <Text fontSize={2}>{message}</Text>;
      } else {
        messageContainer = <Text fontSize={2}>{message.expression}</Text>;
      }
      break;
  }

  return useMemo(
    () => (
      <StyledMessage color={color || 'inherit'} fontSize={3}>
        {messageContainer}
      </StyledMessage>
    ),
    [color, messageContainer]
  );
};
