import { motion } from 'framer-motion';
import styled from 'styled-components';

import {
  Flex,
  FlexProps,
  skeletonStyle,
  Text,
  TextProps,
} from '../../../general';
import { BlockStyle } from '../Block/Block';
import { BUBBLE_HEIGHT } from './Bubble.constants';

export const FragmentBase = styled(Text.Custom)<TextProps>`
  display: inline;
  user-select: text;
  margin: 0px 0px;
  line-height: ${BUBBLE_HEIGHT.rem.fragment};
`;

export const BlockWrapper = styled(motion.span)`
  padding: 0px;
  display: inline-block;
  margin-top: 2px;
  height: 100%;
`;

export const FragmentBlock = styled(motion.span)`
  width: 100%;
  height: 100%;
  min-width: 0px;
  max-width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;

  blockquote {
    margin-bottom: 4px;
  }
  * {
    min-width: 0;
    max-width: 100%;
    min-height: 0;
    max-height: 100%;
  }
`;

export const FragmentPlain = styled(FragmentBase)`
  font-weight: 400;
  margin: 0 0;
  line-height: ${BUBBLE_HEIGHT.rem.fragment};
`;

export const FragmentBold = styled(FragmentBase)`
  font-weight: 800;
`;
export const FragmentItalic = styled(FragmentBase)`
  font-style: italic;
`;
export const FragmentStrike = styled(FragmentBase)`
  text-decoration: line-through;
`;

export const FragmentBoldItalic = styled(FragmentBase)`
  font-weight: 800;
  font-style: italic;
`;

export const FragmentBoldStrike = styled(FragmentBase)`
  font-weight: 800;
  text-decoration: line-through;
`;

export const FragmentItalicsStrike = styled(FragmentBase)`
  font-style: italic;
  text-decoration: line-through;
`;

export const FragmentBoldItalicsStrike = styled(FragmentBase)`
  font-weight: 800;
  font-style: italic;
  text-decoration: line-through;
`;

export const FragmentReplyTo = styled(motion.blockquote)`
  font-style: italic;
  border-radius: 4px;
  display: flex;
  margin: 0px;
  flex-direction: column;
  padding: 4px;
  background: rgba(var(--rlm-card-rgba));
  ${FragmentBase} {
    font-size: 0.86em;
    color: rgba(var(--rlm-text-rgba));
  }
  ${Text.Custom} {
    color: rgba(var(--rlm-text-rgba));
  }
`;

export const FragmentInlineCode = styled(FragmentBase)`
  font-family: 'Fira Code', monospace;
  border-radius: 4px;
  display: flex;
  max-width: 100%;
  word-wrap: break-word;
  /* padding: 0px 3px; */
`;

export const FragmentShip = styled(FragmentBase)`
  color: rgba(var(--rlm-accent-rgba));
  background: rgba(var(--rlm-accent-rgba), 0.12);
  border-radius: 4px;
  padding: 2px 4px;
  transition: var(--transition);
  &:hover {
    transition: var(--transition);
    background: rgba(var(--rlm-accent-rgba), 0.18);
    cursor: pointer;
  }
`;

export const CodeWrapper = styled(Flex)`
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.08);
  transition: var(--transition);
  &:hover {
    transition: var(--transition);
    background-color: rgba(0, 0, 0, 0.12);
  }
  margin-top: 4px;
  margin-bottom: 4px;
  padding: 6px 8px;
  width: 100%;
  ${Text.Custom} {
    color: rgba(var(--rlm-text-rgba)) !important;
  }
`;

export const FragmentCodeBlock = styled(Text.Custom)`
  font-family: 'Fira Code', monospace;
  border-radius: 4px;
  width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

type FragmentImageProps = {
  isSkeleton?: boolean;
};

export const FragmentImage = styled(motion.img)<FragmentImageProps>`
  width: 100%;
  max-width: 20rem;
  border-radius: 4px;
  ${({ isSkeleton }) => isSkeleton && skeletonStyle}
`;

export const TabWrapper = styled(Flex)<FlexProps>`
  border-radius: 6px;
  background: rgba(var(--rlm-card-rgba));
  ${Text.Custom} {
    color: rgba(var(--rlm-text-rgba));
  }
`;

export const FragmentBlockquote = styled(motion.blockquote)`
  font-style: italic;
  border-left: 2px solid rgba(var(--rlm-accent-rgba));
  padding-left: 6px;
  padding-right: 8px;
  border-radius: 6px;
  padding-top: 6px;
  padding-bottom: 6px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: rgba(var(--rlm-overlay-hover-rgba));

  .fragment-reply {
    border-radius: 4px;

    ${FragmentBase} {
      font-size: 0.82rem;
    }
    ${Text.Custom} {
      line-height: 1rem;
    }
    .block-author {
      display: none !important;
    }
    ${BlockWrapper} {
      height: 32px !important;
      width: fit-content !important;
    }
    ${BlockStyle} {
      padding: 0px;
      margin: 0px;
      height: 32px !important;
      width: fit-content !important;
    }
    ${FragmentImage} {
      width: fit-content !important;
      height: 32px !important;
    }
    &.pinned {
      gap: 0px;
      ${Text.Custom} {
        /* line-height: inherit; */
        /* font-size: 0.8em; */
      }
    }
  }
  &.pinned-or-reply-message {
    padding-top: 4px;
    padding-bottom: 4px;
    padding-left: 6px;
    padding-right: 4px;
    border-radius: 3px;
    height: 46px;
    width: 100%;
    gap: 12px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin: 0;
    background: rgba(var(--rlm-overlay-hover-rgba));
    ${FragmentImage} {
      border-radius: 2px;
      height: 36px !important;
    }
  }
  &:hover:not([disabled]) {
    transition: var(--transition);
    background-color: rgba(var(--rlm-overlay-active-rgba));
    cursor: pointer;
  }
`;

export const LineBreak = styled.div`
  width: 100%;
  height: 4px;
  margin: 0;
  padding: 0;
`;
