export type FragmentPlainType = {
  plain: string;
};
export type FragmentBoldType = {
  bold: string;
};
export type FragmentItalicsType = {
  italics: string;
};
export type FragmentStrikeType = {
  strike: string;
};
export type FragmentBoldItalicsType = {
  'bold-italics': string;
};
export type FragmentBoldStrikeType = {
  'bold-strike': string;
};
export type FragmentBoldItalicsStrikeType = {
  'bold-italics-strike': string;
};
export type FragmentBlockquoteType = {
  blockquote: string;
};
export type FragmentInlineCodeType = {
  'inline-code': string;
};
export type FragmentShipType = {
  ship: string;
};
export type FragmentCodeType = {
  code: string;
};
export type FragmentLinkType = {
  link: string;
};
export type FragmentImageType = {
  image: string;
};
export type FragmentUrLinkType = {
  'ur-link': string;
};
export type FragmentBreakType = {
  break: null;
};

export type FragmentTabType = {
  tab: {
    url: string;
    favicon: string;
    title: string;
  };
};

export type FragmentType =
  | FragmentPlainType
  | FragmentBoldType
  | FragmentItalicsType
  | FragmentStrikeType
  | FragmentBoldItalicsType
  | FragmentBoldStrikeType
  | FragmentBoldItalicsStrikeType
  | FragmentBlockquoteType
  | FragmentInlineCodeType
  | FragmentShipType
  | FragmentCodeType
  | FragmentLinkType
  | FragmentImageType
  | FragmentUrLinkType
  | FragmentBreakType
  | FragmentReplyType
  | FragmentTabType;

export type FragmentKey = keyof FragmentType;

export type FragmentReplyType = {
  reply: {
    msgId: string;
    author: string;
    message: FragmentType[];
  };
};

export type FragmentReactionType = {
  author: string;
  emoji: string; // emoji.unified -> see emoji-picker-react
};
