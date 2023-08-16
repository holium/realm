export interface WordRow {
  id: string;
  path: string; //path to a space in realm for Lexicon's use case
  created_at: number; //date
  received_at: number; //date
  word: string;
  updated_at: number; //date
  revision: any; //?
  v: number; //version number?

  type: 'lexicon-word';
}

export interface DefinitionRow {
  id: string;
  path: string; //path to a space in realm for Lexicon's use case
  created_at: number; //date
  received_at: number; //date
  definition: string;
  updated_at: number; //date
  revision: any; //?
  v: number; //version number?

  type: 'lexicon-sentence';
  word_id: string; //id of parent word row
}
export interface SentenceRow {
  id: string;
  path: string; //path to a space in realm for Lexicon's use case
  created_at: number; //date
  received_at: number; //date
  definition: string;
  updated_at: number; //date
  revision: any; //?
  v: number; //version number?

  type: 'lexicon-definition';
  word_id: string; //id of parent word row
}
export interface SentenceRow {
  id: string;
  path: string; //path to a space in realm for Lexicon's use case
  created_at: number; //date
  received_at: number; //date
  sentence: string;
  updated_at: number; //date
  revision: any; //?
  v: number; //version number?

  type: 'lexicon-definition';
  word_id: string; //id of parent word row
}
export interface VoteRow {
  id: string;
  parent_id: string;
  parent_type: string;
  path: string; //path to a space in realm for Lexicon's use case
  parent_path: string;
  created_at: number; //date
  received_at: number; //date
  definition: string;
  updated_at: number; //date
  revision: any; //?
  v: number; //version number?
  creator: string;
  type: 'vote';
  up: boolean;
}
export type LeixconRow = VoteRow | WordRow | DefinitionRow | SentenceRow;

export interface addRowUpdate {
  change: 'add-row';
  row: LeixconRow;
}
export interface updateRowUpdate {
  change: 'upd-row';
  row: LeixconRow;
}
export interface deleteRowUpdate {
  change: 'del-row';
  path: string;
  type: string;
  id: string;
  timestamp: number; //date
}

export type BedrockUpdateType = {
  type: 'bedrock-update';
  payload: addRowUpdate | updateRowUpdate | deleteRowUpdate;
};
