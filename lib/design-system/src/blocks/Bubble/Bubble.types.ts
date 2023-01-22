export type MessagePlain = {
  plain: string;
};
export type MessageBold = {
  bold: string;
};
export type MessageItalics = {
  italics: string;
};
export type MessageStrike = {
  strike: string;
};
export type MessageBoldItalics = {
  'bold-italics': string;
};
export type MessageBoldStrike = {
  'bold-strike': string;
};
export type MessageBoldItalicsStrike = {
  'bold-italics-strike': string;
};
export type MessageBlockquote = {
  blockquote: string;
};
export type MessageInlineCode = {
  'inline-code': string;
};
export type MessageShip = {
  ship: string;
};
export type MessageCode = {
  code: string;
};
export type MessageLink = {
  // [display-name, url]
  link: [string, string];
};
export type MessageImage = {
  image: string;
};
export type MessageUrLink = {
  'ur-link': string;
};
export type MessageBreak = {
  break: null;
};

export type Message =
  | MessagePlain
  | MessageBold
  | MessageItalics
  | MessageStrike
  | MessageBoldItalics
  | MessageBoldStrike
  | MessageBoldItalicsStrike
  | MessageBlockquote
  | MessageInlineCode
  | MessageShip
  | MessageCode
  | MessageLink
  | MessageImage
  | MessageUrLink
  | MessageBreak;

export type MessageType = keyof Message;
