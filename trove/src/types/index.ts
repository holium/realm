export interface Lexicon {
  // specific formatting for space?
  [space: string]: any; // create space has no template entry for now, ++  on-init does.
}

export interface Definitions {
  [word: string]: Definition[];
}

export interface Definition {
  id: string; // @uv format
  def: string;
  posted: number; // unixtime
  poster: string; // @p  format
  related: string[];
  sentence: string[];
  votes: any;
}

export interface Whitelist {
  [space: string]: WLInfo;
}

export interface WLInfo {
  perms: string;
  members: string[];
}

export interface AddDef {
  space: string;
  word: string | undefined;
  def: string;
  sentence: string[] | [];
  related: string[] | [];
}

export interface Vote {
  space: string;
  word: string | undefined;
  id: string;
  vote: true | false | null;
  voteType: 'def' | 'sen' | 'word';
}

export interface DelDef {
  space: string;
  word: string;
  id: string;
}

export type Role = null | 'admin' | 'member';
