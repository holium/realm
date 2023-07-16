import { JSONObject } from 'os/types';

export type NotesService_CreateNote_Payload = {
  title: string;
  doc: JSONObject;
  space: string;
};

export type NotesService_GetNotes_Payload = {
  space: string;
};

export type NotesService_SaveNote_Payload = {
  id: number;
  title: string;
  doc: JSONObject;
};

export type NotesService_DeleteNote_Payload = {
  id: number;
};

export type NotesService_BedrockUpdate_CreateNoteData = {
  title: string;
  doc: string;
};

// ---
// IPC update types.
// ---
type NotesService_IPCUpdate_CreateNote = {
  type: 'create-note';
  payload: {
    id: number;
    bedrockId: string;
    author: string;
    space: string;
    title: string;
    doc: JSONObject;
    created_at: number;
    updated_at: number;
  };
};

export type NotesService_IPCUpdate = NotesService_IPCUpdate_CreateNote;
