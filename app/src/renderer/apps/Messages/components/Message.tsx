import { FC, useMemo } from 'react';
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
  preview?: boolean;
  onImageLoad?: () => void;
}

const isImage = (url: string) => {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
};

type MessagePreviewProps = FontStyleProps &
  OpacityProps &
  FontSizeProps &
  FontWeightProps &
  ColorProps;

export const MessagePreview = styled(motion.div)<MessagePreviewProps>`
  padding: 0px;
  line-height: 22px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  user-select: text;
  ${compose(fontStyle, fontSize, fontWeight, opacity, color)}
`;

export const Message: FC<DMContact> = ({
  type,
  content,
  preview,
  color,
  bgColor,
  textColor,
  onImageLoad,
}: DMContact) => {
  let messageContainer: JSX.Element | null = null;
  let message: string = getTextFromContent(type, content);

  if (preview) {
    message = message ? message.split(/(\r\n|\n|\r)/gm)[0] : ''; // takes only the first line of a multi-line message
    if (message.length > 27) {
      message = message.substring(0, 28) + '...';
    }
    messageContainer = <Text fontSize={2}>{message}</Text>;
  } else {
    switch (type) {
      case 'text':
        messageContainer = <TextParsed content={message} />;
        break;
      case 'url':
        if (isImage(message)) {
          messageContainer = (
            <img
              className="realm-cursor-hover"
              style={{ borderRadius: 8 }}
              height="auto"
              width={250}
              onClick={(evt: any) => {
                evt.preventDefault();
                // openFileViewer(message);
              }}
              src={message}
              onLoad={onImageLoad}
            />
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
        messageContainer = <Text fontSize={2}>{message}</Text>;
        break;
    }
  }

  return useMemo(
    () => (
      <MessagePreview
        color={color || 'inherit'}
        opacity={preview ? 0.6 : 1}
        fontSize={preview ? 2 : 3}
      >
        {messageContainer}
      </MessagePreview>
    ),
    [color, messageContainer, preview]
  );
};
