import { FC } from 'react';
import styled from 'styled-components';
import {
  compose,
  space,
  layout,
  flexbox,
  border,
  fontStyle,
  position,
  color,
  backgroundColor,
  SpaceProps,
  LayoutProps,
  FlexboxProps,
  BorderProps,
  PositionProps,
  ColorProps,
  BackgroundColorProps,
  FontStyleProps,
  FontSizeProps,
  FontWeightProps,
  OpacityProps,
  fontSize,
  fontWeight,
  opacity,
} from 'styled-system';
import { rgba, lighten } from 'polished';
import { motion } from 'framer-motion';
import { ThemeType } from '../../../../theme';
import { Sigil, Flex, Box } from '../../../../components';
import { ChatType } from '../../../../logic/ship/chat/store';

type DMContact = {
  type: 'text' | 'url' | 'mention' | 'code' | 'reference' | string;
  content: any;
  preview?: boolean;
};

type MessagePreviewProps = FontStyleProps &
  OpacityProps &
  FontSizeProps &
  FontWeightProps;

export const MessagePreview = styled(motion.div)<MessagePreviewProps>`
  padding: 0px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  user-select: text;
  ${compose(fontStyle, fontSize, fontWeight, opacity)}
`;

export const Message: FC<DMContact> = (props: DMContact) => {
  const { type, content, preview } = props;
  let message = '';
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
        case 'graph':
          message = content.reference.graph.graph;
          break;
      }
      message = content.reference[referenceType];
    }
  } else {
    message = content[type];
  }
  if (preview) {
    message = message.length > 39 ? message.substring(0, 40) + '...' : message;
  }
  return (
    <MessagePreview opacity={preview ? 0.6 : 1} fontSize={preview ? 2 : 2}>
      {message}
    </MessagePreview>
  );
};
