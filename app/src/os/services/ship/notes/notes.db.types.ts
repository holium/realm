import { JSONObject } from 'os/types';

export type NotesDB_Insert = (payload: {
  id: string;
  author: string;
  space: string;
  title: string;
  doc: JSONObject;
}) => string;

export type NotesDB_SelectAll = (payload: { space: string }) => {
  id: string;
  author: string;
  space: string;
  title: string;
  doc: JSONObject;
  created_at: number;
  updated_at: number;
}[];

export type NotesDB_Update = (payload: {
  id: string;
  title: string;
  doc: JSONObject;
}) => string;

export type NotesDB_Delete = (payload: { id: string }) => string;
