import { pxToRem } from '../../util';

export const STATUS_HEIGHT = 24;

export const BUBBLE_PADDING_Y = 6;
export const BUBBLE_PADDING_X = 8;
export const BUBBLE_AUTHOR_HEIGHT = 16;
export const BUBBLE_FOOTER = 14;
export const BUBBLE_FOOTER_REACTIONS = 24;
export const BUBBLE_FRAGMENT_HEIGHT = 20;

export const BUBBLE_UNITS = {
  paddingY: BUBBLE_PADDING_Y,
  paddingX: BUBBLE_PADDING_X,
  authorHeight: BUBBLE_AUTHOR_HEIGHT,
  fragment: BUBBLE_FRAGMENT_HEIGHT,
  footer: BUBBLE_FOOTER,
};

export const BUBBLE_WIDTH = {
  rem: {
    paddingX: pxToRem(BUBBLE_PADDING_X),
  },
  px: {
    paddingX: BUBBLE_PADDING_X,
  },
};

export const BUBBLE_HEIGHT = {
  rem: {
    paddingY: pxToRem(BUBBLE_PADDING_Y),
    authorHeight: pxToRem(BUBBLE_AUTHOR_HEIGHT),
    fragment: pxToRem(BUBBLE_FRAGMENT_HEIGHT),
    footer: pxToRem(BUBBLE_FOOTER),
    footerReactions: pxToRem(BUBBLE_FOOTER_REACTIONS),
  },
  px: {
    paddingY: BUBBLE_PADDING_Y,
    authorHeight: BUBBLE_AUTHOR_HEIGHT,
    fragment: BUBBLE_FRAGMENT_HEIGHT,
    footer: BUBBLE_FOOTER,
    footerReactions: BUBBLE_FOOTER_REACTIONS,
  },
};
