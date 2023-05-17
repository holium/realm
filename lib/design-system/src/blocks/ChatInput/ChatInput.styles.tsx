import { motion } from 'framer-motion';
import styled from 'styled-components';

import { Button } from '../../../general';
import { TextArea } from '../../../inputs';

export const CHAT_INPUT_LINE_HEIGHT = 22;

export const ChatBox = styled(TextArea)`
  resize: none;
  line-height: ${CHAT_INPUT_LINE_HEIGHT}px;
  font-size: 14px;
  padding-left: 4px;
  padding-right: 4px;
`;

export const RemoveAttachmentButton = styled(motion.div)`
  position: relative;
  z-index: 4;
  transition: var(--transition);
  overflow: visible;
  .fragment-image {
    padding: 0px;
  }
  ${Button.Base} {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .chat-attachment-remove-btn {
    position: absolute;
    display: flex;
    overflow: visible;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    top: -4px;
    right: -4px;
    z-index: 4;
    border-radius: 12px;
    transition: var(--transition);
  }
`;
