/* Service method payloads */
export type NotesService_CreateNote_Payload = {
  space: string;
  title: string;
};

export type NotesService_GetNotes_Payload = {
  space: string;
};

export type NotesService_GetNoteEdits_Payload = {
  note_id: string;
};

export type NotesService_EditNoteTitle_Payload = {
  id: string;
  space: string;
  title: string;
};

export type NotesService_CreateNoteEdit_Payload = {
  note_id: string;
  note_edit: string;
  space: string;
};

export type NotesService_CreateNoteEditLocally_Payload = Omit<
  NotesService_CreateNoteEdit_Payload,
  'space'
>;

export type NotesService_SaveNoteUpdates_Payload = {
  note_id: string;
  space: string;
};

export type NotesService_DeleteNote_Payload = {
  id: string;
  space: string;
};

/* Bedrock updates */
export type NotesService_GetBedrockState_Payload = {
  space: string;
};

export type NotesService_Subscribe_Payload = {
  space: string;
};

export type NotesService_CreatePath_Payload = {
  space: string;
};

export type BedrockRowData_Notes = {
  title: string;
};

export type BedrockRowData_NotesEdits = {
  note_id: string;
  note_edit: string;
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

type NotesService_IPCUpdate_UpdateNote = {
  type: 'update-note';
  payload: {
    id: string;
    title: string;
    updated_at: number;
  };
};

type NotesService_IPCUpdate_DeleteNote = {
  type: 'delete-note';
  payload: {
    id: string;
  };
};

type NotesService_IPCUpdate_ApplyNoteEdit = {
  type: 'apply-notes-edit';
  payload: {
    note_id: string;
    note_edit: string;
  };
};

export type NotesService_IPCUpdate =
  | NotesService_IPCUpdate_CreateNote
  | NotesService_IPCUpdate_UpdateNote
  | NotesService_IPCUpdate_DeleteNote
  | NotesService_IPCUpdate_ApplyNoteEdit;
