/* Service method payloads */
export type NotesService_CreateNote_Payload = {
  space: string;
  title: string;
};

export type NotesService_GetNotes_Payload = {
  space: string;
};

export type NotesService_EditNoteTitle_Payload = {
  id: string;
  space: string;
  title: string;
};

export type NotesService_CreateNoteUpdate_Payload = {
  note_id: string;
  space: string;
  update: string;
};

export type NotesService_DeleteNote_Payload = {
  id: string;
  space: string;
};

/* Bedrock updates */
export type NotesService_GetBedrockState_Payload = {
  space: string;
};

export type BedrockRowData_Notes = {
  title: string;
};

export type BedrockRowData_NotesUpdates = {
  note_id: string;
  update: string;
};

/* IPC updates */
type NotesService_IPCUpdate_CreateNote = {
  type: 'create-note';
  payload: {
    id: string;
    author: string;
    space: string;
    title: string;
    created_at: number;
    updated_at: number;
  };
};

type NotesService_IPCUpdate_CreateNoteHistory = {
  type: 'create-note-update';
  payload: {
    id: string;
    note_id: string;
    update: string;
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
    updated_at: number;
  };
};

export type NotesService_IPCUpdate =
  | NotesService_IPCUpdate_CreateNote
  | NotesService_IPCUpdate_CreateNoteHistory
  | NotesService_IPCUpdate_UpdateNote
  | NotesService_IPCUpdate_DeleteNote;
