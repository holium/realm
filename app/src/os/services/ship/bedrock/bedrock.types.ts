export interface BaseRow {
  id: string;
  path: string;
  type: string;
  v: number; //version number
  creator: string; // patp part of the id
  created_at: number; //date
  updated_at: number; //date
  received_at: number; //date
}

export interface GeneralRow extends BaseRow {
  data: string; // JSON.stringify of the data object
}

export interface VoteRow extends BaseRow {
  type: 'vote';
  parent_id: string;
  parent_type: string;
  parent_path: string;
  up: boolean;
}

export type BedrockRow = VoteRow | GeneralRow;

export interface addRowUpdate {
  change: 'add-row';
  row: BedrockRow;
}
export interface updateRowUpdate {
  change: 'upd-row';
  row: BedrockRow;
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
