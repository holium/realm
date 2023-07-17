import { BedrockRow, JSONObject } from 'os/types';

/* Service method payloads */
export type NotesService_CreateNote_Payload = {
  title: string;
  doc: JSONObject;
  space: string;
};

export type NotesService_GetNotes_Payload = {
  space: string;
};

export type NotesService_SaveNote_Payload = {
  id: string;
  space: string;
  title: string;
  doc: JSONObject;
};

export type NotesService_DeleteNote_Payload = {
  id: string;
  space: string;
};

/* Bedrock updates */
export type NotesService_BedrockUpdate_CreateNoteData = {
  title: string;
  doc: string;
};

export type NotesService_GetBedrockState_Payload = {
  space: string;
};

type BedrockTable = {
  type: string;
  rows: BedrockRow<{
    title: string;
    doc: string;
  }>[];
};

export type NotesService_GetBedrockState_Response = {
  dels: JSONObject;
  'path-row': JSONObject;
  peers: JSONObject;
  tables: BedrockTable[];
  schemas: JSONObject;
};

/* IPC updates */
type NotesService_IPCUpdate_CreateNote = {
  type: 'create-note';
  payload: {
    id: string;
    author: string;
    space: string;
    title: string;
    doc: JSONObject;
    created_at: number;
    updated_at: number;
  };
};

type NotesService_IPCUpdate_DeleteNote = {
  type: 'delete-note';
  payload: {
    id: string;
  };
};

type NotesService_IPCUpdate_UpdateNote = {
  type: 'update-note';
  payload: {
    id: string;
    title: string;
    doc: JSONObject;
    updated_at: number;
  };
};

export type NotesService_IPCUpdate =
  | NotesService_IPCUpdate_CreateNote
  | NotesService_IPCUpdate_UpdateNote
  | NotesService_IPCUpdate_DeleteNote;
