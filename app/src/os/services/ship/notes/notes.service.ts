import Database from 'better-sqlite3-multiple-ciphers';
import { fromUint8Array, toUint8Array } from 'js-base64';
import * as Y from 'yjs';

import type {
  BedrockResponse,
  BedrockSchema,
  BedrockSubscriptionUpdate,
} from 'os/types';

import AbstractService, { ServiceOptions } from '../../abstract.service';
import APIConnection from '../../api/api-connection';
import { NotesDB } from './notes.db';
import {
  BedrockRowData_Notes,
  BedrockRowData_NotesEdits,
  NotesService_CreateNote_Payload,
  NotesService_CreateNoteEdit_Payload,
  NotesService_CreateNoteEditLocally_Payload,
  NotesService_DeleteNote_Payload,
  NotesService_EditNoteTitle_Payload,
  NotesService_GetBedrockState_Payload,
  NotesService_GetNoteEdits_Payload,
  NotesService_GetNotes_Payload,
  NotesService_IPCUpdate,
  NotesService_MergeUnsavedNoteEdits_Payload,
  NotesService_SaveNoteEdits_Payload,
  NotesService_Subscribe_Payload,
} from './notes.service.types';

export enum NOTES_BEDROCK_TYPES {
  NOTES = '/notes/0vfi9t9.n4gau.tovrh.ana0d.1lndd',
  NOTES_EDITS = '/notes-edits/0v4.gbp6o.4u8st.6qo1f.ll1q5.65q0j',
}

export class NotesService extends AbstractService<NotesService_IPCUpdate> {
  private notesDB?: NotesDB;

  constructor(options?: ServiceOptions, db?: Database) {
    super('notesService', options);
    this.notesDB = new NotesDB({
      preload: Boolean(options?.preload),
      db,
    });
  }

  async createNote({
    title,
    space,
  }: NotesService_CreateNote_Payload): Promise<void> {
    // Create metadata entry in Bedrock.
    const createNoteData = [title];
    const createNoteSchema: BedrockSchema = [['title', 't']];
    return APIConnection.getInstance().conduit.thread({
      inputMark: 'db-action',
      outputMark: 'db-vent',
      threadName: 'venter',
      body: {
        create: {
          path: space,
          type: NOTES_BEDROCK_TYPES.NOTES,
          data: createNoteData,
          schema: createNoteSchema,
        },
      },
      desk: 'realm',
    });
  }

  async deleteNote({ id, space }: NotesService_DeleteNote_Payload) {
    try {
      const associatedUpdates = this.getNoteEditsFromDb({ note_id: id });
      const bedrockIds: { id: string; type: string }[] = associatedUpdates
        .map((o) => ({ id: o.id, type: NOTES_BEDROCK_TYPES.NOTES_EDITS }))
        .filter((edit) => edit.id !== null);
      bedrockIds.push({ id, type: NOTES_BEDROCK_TYPES.NOTES });
      console.log('bedrockIds: %o', bedrockIds);

      const manyresult = await APIConnection.getInstance().conduit.thread({
        inputMark: 'db-action',
        outputMark: 'db-vent',
        threadName: 'venter',
        body: {
          'remove-many': {
            ids: bedrockIds,
            path: space,
          },
        },
        desk: 'realm',
      });
      console.log('delete manyresult', manyresult);
    } catch (error) {
      console.error('Notes: Failed to delete note + note edits.', error);

      return false;
    }

    return true;
  }

  getNotesFromDb({ space }: NotesService_GetNotes_Payload) {
    if (!this.notesDB) return [];

    return this.notesDB.selectAllNotes({ space });
  }

  getNotesEditsFromDb() {
    if (!this.notesDB) return [];

    return this.notesDB.selectAllNotesEdits();
  }

  getNoteEditsFromDb({ note_id }: NotesService_GetNoteEdits_Payload) {
    if (!this.notesDB) return [];

    return this.notesDB.selectNoteEdits({ note_id });
  }

  async syncWithBedrock({ space }: NotesService_GetBedrockState_Payload) {
    /**
     * PHASE 1 – Sync `notes` (not using yjs yet, so we override)
     * 1. Fetch notes (metadata) from Bedrock.
     * 2. Upsert notes in SQLite.
     * 3. Delete notes rows that are no longer in Bedrock.
     * PHASE 2 – Sync `notes_edits` (using yjs for CRDT)
     * 4. Merge all unsaved note edits.
     * 5. Get all notes_edits from Bedrock.
     * 6. Insert all missing notes updates rows in SQLite.
     */

    if (!this.notesDB) return;

    // 1. Fetch notes metadata from Bedrock.
    let bedrockResponse: BedrockResponse | undefined;
    try {
      bedrockResponse = await APIConnection.getInstance().conduit.scry({
        app: 'bedrock',
        path: `/db/path${space}`,
      });
    } catch (error) {
      console.error('Notes: Failed to fetch notes from Bedrock.', error);
    }
    if (!bedrockResponse || !bedrockResponse.tables) return;

    // 2. Upsert notes metadata in SQLite.
    const notesTable = bedrockResponse.tables.find(
      (o) => o.type === NOTES_BEDROCK_TYPES.NOTES
    );
    if (!notesTable) return;

    const notesTableRows = notesTable.rows ?? [];
    notesTableRows.forEach((note) => {
      const rowData: BedrockRowData_Notes = note.data;

      this.notesDB?.upsertNote({
        id: note.id,
        space: note.path,
        author: note.creator,
        title: rowData.title,
      });
      this.sendUpdate({
        type: 'create-note',
        payload: {
          id: note.id,
          title: note.data.title,
          author: note.creator,
          space: note.path,
          created_at: note['created-at'],
          updated_at: note['updated-at'],
        },
      });
    });

    // 3. Delete notes metadata that are no longer in Bedrock.
    const notesDBNotes = this.notesDB.selectAllNotes({ space });
    notesDBNotes.forEach((note) => {
      const noteExistsInBedrock = notesTableRows.find((o) => o.id === note.id);
      if (!noteExistsInBedrock) {
        this.notesDB?.deleteNote({
          id: note.id,
        });
        this.sendUpdate({
          type: 'delete-note',
          payload: {
            id: note.id,
          },
        });
      }
    });

    // 4. Merge all unsaved note edits.
    // We don't save the merged unsaved edits until the user edits the note.
    this.notesDB.selectAllNotes({ space }).forEach((note) => {
      this.mergeUnsavedNoteEdits({
        note_id: note.id,
      });
    });

    // 5. Get all notes updates from Bedrock.
    const notesEditsTable = bedrockResponse.tables.find(
      (o) => o.type === NOTES_BEDROCK_TYPES.NOTES_EDITS
    );
    if (!notesEditsTable) return;

    // 6. Upsert all missing notes updates in SQLite.
    const notesEditsTableRows = notesEditsTable.rows ?? [];
    notesEditsTableRows.forEach((noteEdit) => {
      const rowData: BedrockRowData_NotesEdits = noteEdit.data;

      this.notesDB?.upsertNoteEdit({
        note_edit: rowData.note_edit,
        note_id: rowData.note_id,
        id: noteEdit.id,
      });
      this.sendUpdate({
        type: 'apply-notes-edit',
        payload: {
          note_edit: rowData.note_edit,
          note_id: rowData.note_id,
        },
      });
    });
  }

  editNoteTitle({ id, space, title }: NotesService_EditNoteTitle_Payload) {
    const editNoteData = [title];
    const editNoteSchema: BedrockSchema = [['title', 't']];

    try {
      return APIConnection.getInstance().conduit.poke({
        app: 'bedrock',
        mark: 'db-action',
        json: {
          edit: {
            id,
            'input-row': {
              path: space,
              type: NOTES_BEDROCK_TYPES.NOTES,
              data: editNoteData,
              schema: editNoteSchema,
            },
          },
        },
      });
    } catch (error) {
      console.error('Notes: Failed to edit note title.', error);

      return null;
    }
  }

  createNoteUpdate({
    note_id,
    space,
    note_edit,
  }: NotesService_CreateNoteEdit_Payload) {
    const createNoteUpdateData = [note_id, note_edit];
    const createNoteUpdateSchema: BedrockSchema = [
      ['note_id', 't'],
      ['note_edit', 't'],
    ];

    try {
      return APIConnection.getInstance().conduit.thread({
        inputMark: 'db-action',
        outputMark: 'db-vent',
        threadName: 'venter',
        body: {
          create: {
            path: space,
            type: NOTES_BEDROCK_TYPES.NOTES_EDITS,
            data: createNoteUpdateData,
            schema: createNoteUpdateSchema,
          },
        },
        desk: 'realm',
      });
    } catch (error) {
      console.error('Notes: Failed to create note update.', error);

      return null;
    }
  }

  createNoteUpdateLocally({
    note_id,
    note_edit,
  }: NotesService_CreateNoteEditLocally_Payload) {
    if (!this.notesDB) return;

    return this.notesDB.insertNoteEditLocally({
      note_id,
      note_edit,
    });
  }

  mergeUnsavedNoteEdits({
    note_id,
  }: NotesService_MergeUnsavedNoteEdits_Payload) {
    if (!this.notesDB) return;

    const unsavedNoteEdits = this.notesDB.selectAllUnsavedNoteEdits({
      note_id,
    });
    if (unsavedNoteEdits.length < 2) return null;

    // Merge yjs updates into one.
    const edits = unsavedNoteEdits.map((o) => {
      return toUint8Array(o.note_edit);
    });
    const mergedNoteEdits = edits.reduce((acc, curr) => {
      return Y.mergeUpdates([acc, curr]);
    });
    const mergedNoteEdit = fromUint8Array(mergedNoteEdits);

    // Merge unsaved note edits.
    const result = this.notesDB.replaceUnsavedNoteEditsWithOne({
      note_edit: mergedNoteEdit,
      note_id,
    });

    return result ? mergedNoteEdit : null;
  }

  async saveNoteUpdates({
    note_id,
    space,
  }: NotesService_SaveNoteEdits_Payload) {
    if (!this.notesDB) return;

    // Merge unsaved note edits.
    const note_edit = this.mergeUnsavedNoteEdits({
      note_id,
    });
    if (!note_edit) return false;

    // Send merged note_edit to Bedrock.
    const response = await this.createNoteUpdate({
      note_edit,
      note_id,
      space,
    });
    // Update SQLite.
    this.notesDB.upsertNoteEdit({
      note_edit: response.data.note_edit,
      note_id: response.data.note_id,
      id: response.id,
    });

    return Boolean(response);
  }

  subscribe({ space: spacePath }: NotesService_Subscribe_Payload) {
    return APIConnection.getInstance().conduit.watch({
      app: 'bedrock',
      path: `/path${spacePath}`,
      onEvent: (updates: BedrockSubscriptionUpdate[] | null) => {
        if (!updates || !updates.length) return;

        updates.forEach((update) => {
          if (!this.notesDB) return;

          if (update.change === 'add-row') {
            if (update.row?.type === NOTES_BEDROCK_TYPES.NOTES) {
              const rowData = update.row.data;

              // Update SQLite.
              this.notesDB.upsertNote({
                id: update.row.id,
                space: update.row.path,
                author: update.row.creator,
                title: rowData.title,
              });
              // Update MobX.
              this.sendUpdate({
                type: 'create-note',
                payload: {
                  id: update.row.id,
                  space: update.row.path,
                  author: update.row.creator,
                  title: rowData.title,
                  created_at: update.row['created-at'],
                  updated_at: update.row['updated-at'],
                },
              });
            } else if (update.row?.type === NOTES_BEDROCK_TYPES.NOTES_EDITS) {
              const rowData = update.row.data;

              // Update SQLite.
              this.notesDB.upsertNoteEdit({
                note_edit: rowData.note_edit,
                note_id: rowData.note_id,
                id: update.row.id,
              });
              // Update MobX.
              this.sendUpdate({
                type: 'apply-notes-edit',
                payload: {
                  note_edit: rowData.note_edit,
                  note_id: rowData.note_id,
                },
              });
            }
          } else if (update.change === 'upd-row') {
            if (update.row?.type === NOTES_BEDROCK_TYPES.NOTES) {
              const rowData = update.row.data;

              // Update SQLite.
              this.notesDB.updateNoteTitle({
                id: update.row.id,
                title: rowData.title,
              });
              // Update MobX.
              this.sendUpdate({
                type: 'update-note',
                payload: {
                  id: update.row.id,
                  title: rowData.title,
                  updated_at: update.row['updated-at'],
                },
              });
            }
          } else if (update.change === 'del-row') {
            // Delete responses that have a different structure.
            if (!update.id) return;

            if (update.type === NOTES_BEDROCK_TYPES.NOTES) {
              // Update SQLite.
              this.notesDB.deleteNote({ id: update.id });
              // Update MobX.
              this.sendUpdate({
                type: 'delete-note',
                payload: {
                  id: update.id,
                },
              });
            }
          }
        });
      },
      onSubscribed: () => console.log('Notes: Subscription accepted.'),
      onError: () => console.log('Notes: Subscription rejected.'),
      onQuit: () => console.log('Notes: Kicked from subscription.'),
    });
  }
}

export const notesPreload = NotesService.preload(
  new NotesService({ preload: true })
);
