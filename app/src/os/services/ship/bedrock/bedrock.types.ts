import { Json } from '../../api/types';

export interface BaseRow {
  id: string;
  path: string;
  type: string;
  creator: string; // patp part of the id
  created_at: number; //date
  updated_at: number; //date
  received_at: number; //date
}

export interface GeneralRow extends BaseRow {
  data: Json;
}

export interface VoteRow extends BaseRow {
  type: '/vote/0v3.hirga.bspbd.edlma.dfk59.gtu38';
  parent_id: string;
  parent_type: string;
  parent_path: string;
  up: boolean;
}

export interface CredsRow extends BaseRow {
  type: '/creds/0v1.dm2bu.v3m6c.jug6d.32qb0.3h103';
  endpoint: string;
  access_key_id: string;
  secret_access_key: string;
  buckets: string[];
  current_bucket: string;
  region: string;
}

export type BedrockRow = VoteRow | CredsRow | GeneralRow;

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

export type BedrockIDTriple = {
  type: string;
  id: string;
  path: string;
};
