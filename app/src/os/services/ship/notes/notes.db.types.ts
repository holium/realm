import { JSONObject } from 'os/types';

export type NotesDB_Insert = (payload: {
  bedrockId: string;
  author: string;
  space: string;
  title: string;
  doc: JSONObject;
}) => number;

export type NotesDB_SelectAll = (payload: { space: string }) => {
  id: number;
  bedrockId: string;
  author: string;
  space: string;
  title: string;
  doc: JSONObject;
  created_at: number;
  updated_at: number;
}[];

export type NotesDB_Update = (payload: {
  id: number;
  title: string;
  doc: JSONObject;
}) => number;

export type NotesDB_Delete = (payload: { id: number }) => number;
