export type FragmentPlainType = {
  plain: string;
  metadata?: any;
};
export type FragmentBoldType = {
  bold: string;
  metadata?: any;
};
export type FragmentItalicsType = {
  italics: string;
  metadata?: any;
};
export type FragmentStrikeType = {
  strike: string;
  metadata?: any;
};
export type FragmentBoldItalicsType = {
  'bold-italics': string;
  metadata?: any;
};
export type FragmentBoldStrikeType = {
  'bold-strike': string;
  metadata?: any;
};
export type FragmentItalicsStrikeType = {
  'italics-strike': string;
  metadata?: any;
};
export type FragmentBoldItalicsStrikeType = {
  'bold-italics-strike': string;
  metadata?: any;
};
export type FragmentBlockquoteType = {
  blockquote: string;
  metadata?: any;
};
export type FragmentInlineCodeType = {
  'inline-code': string;
  metadata?: any;
};
export type FragmentShipType = {
  ship: string;
  metadata?: any;
};
export type FragmentCodeType = {
  code: string;
  metadata?: any;
};
export type FragmentLinkType = {
  link: string;
  metadata?: any;
};
export type FragmentImageType = {
  image: string;
  metadata?: {
    width?: string;
    height?: string;
  };
};
export type FragmentUrLinkType = {
  'ur-link': string;
  metadata?: any;
};
export type FragmentBreakType = {
  break: null;
  metadata?: any;
};

export type FragmentStatusType = {
  status: string;
  metadata?: any;
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
  | FragmentItalicsStrikeType
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
  | FragmentTabType
  | FragmentStatusType;

export type FragmentKey = keyof FragmentType;

export type FragmentReplyType = {
  reply: {
    msgId: string;
    author: string;
    message: FragmentType[];
  };
};

export type FragmentReactionType = {
  msgId: string;
  by: string;
  emoji: string; // emoji.unified -> see emoji-picker-react
};

export type ChatMessageType = {
  author: string;
  authorColor?: string;
  sentAt: string;
  our?: boolean;
  message?: FragmentType[];
  reactions?: FragmentReactionType[];
};

export const BLOCK_TYPES = [
  'image',
  'video',
  'audio',
  'link',
  'blockquote',
  'code',
];
export const TEXT_TYPES = [
  'plain',
  'bold',
  'italics',
  'strike',
  'bold-italics',
  'bold-strike',
  'italics-strike',
  'bold-italics-strike',
  'inline-code',
  'ship',
];

export type FragmentKeyTypes =
  | 'plain'
  | 'bold'
  | 'italics'
  | 'strike'
  | 'bold-italics'
  | 'bold-strike'
  | 'italics-strike'
  | 'bold-italics-strike'
  | 'inline-code'
  | 'ship'
  | 'image'
  | 'video'
  | 'audio'
  | 'link'
  | 'blockquote'
  | 'code'
  | 'tab'
  | 'reply'
  | 'break';
