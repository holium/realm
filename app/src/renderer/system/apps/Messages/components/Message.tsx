import { FC } from 'react';
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
import { toJS } from 'mobx';

type DMContact = {
  type: 'text' | 'url' | 'mention' | 'code' | 'reference' | string;
  content: any;
  color?: string | null | undefined;
  preview?: boolean;
};

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

export const Message: FC<DMContact> = (props: DMContact) => {
  const { type, content, preview, color } = props;
  let message: any = '';
  if (type === 'reference') {
    if (typeof content.reference === 'string') {
      message = content.reference;
    } else {
      const referenceType: any = Object.keys(content.reference)[0];
      switch (referenceType) {
        case 'group':
          message = content.reference.group;
          break;
        case 'app':
          message = content.reference.app.desk;
          break;
        case 'code':
          message = content.reference.code.expression;
          break;
        case 'graph':
          message = content.reference.graph.graph;
          break;
        default:
          message = content.reference[referenceType];
          break;
      }
    }
  } else {
    message = content[type];
  }
  if (preview) {
    message = message.length > 39 ? message.substring(0, 40) + '...' : message;
  } else {
    if (type === 'url') {
      if (isImage(message)) {
        message = (
          <img
            className="realm-cursor-hover"
            style={{ borderRadius: 8 }}
            height="auto"
            width={250}
            src={message}
          />
        );
      } else {
        message = content[type];
      }
      // console.log(toJS(content));
    }
  }
  return (
    <MessagePreview
      color={color || 'inherit'}
      opacity={preview ? 0.6 : 1}
      fontSize={preview ? 2 : 3}
    >
      {message}
    </MessagePreview>
  );
};
