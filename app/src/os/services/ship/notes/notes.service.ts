import Database from 'better-sqlite3-multiple-ciphers';
import { fromUint8Array, toUint8Array } from 'js-base64';
import * as Y from 'yjs';

import type {
  BedrockPath,
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
  NotesService_CreatePath_Payload,
  NotesService_DeleteNote_Payload,
  NotesService_EditNoteTitle_Payload,
  NotesService_GetBedrockState_Payload,
  NotesService_GetNoteEdits_Payload,
  NotesService_GetNotes_Payload,
  NotesService_IPCUpdate,
  NotesService_SaveNoteUpdates_Payload,
  NotesService_Subscribe_Payload,
} from './notes.service.types';

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
    return APIConnection.getInstance().conduit.poke({
      app: 'bedrock',
      mark: 'db-action',
      json: {
        create: {
          v: 0,
          path: `${space}/notes`,
          type: 'notes',
          data: createNoteData,
          schema: createNoteSchema,
        },
      },
    });
  }

  async deleteNote({ id, space }: NotesService_DeleteNote_Payload) {
    try {
      await APIConnection.getInstance().conduit.poke({
        app: 'bedrock',
        mark: 'db-action',
        json: {
          remove: {
            id,
            path: `${space}/notes`,
            type: 'notes',
          },
        },
      });
    } catch (error) {
      console.error('Notes: Failed to delete note.', error);

      return false;
    }

    try {
      const associatedUpdates = this.getNoteEditsFromDb({ note_id: id });
      const bedrockIds = associatedUpdates.map((o) => o.id);

      await APIConnection.getInstance().conduit.poke({
        app: 'bedrock',
        mark: 'db-action',
        json: {
          'remove-many': {
            ids: bedrockIds,
            path: `${space}/notes`,
            type: 'notes-edits',
          },
        },
      });
    } catch (error) {
      console.error('Notes: Failed to delete note edits.', error);

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

  async createPublicBedrockPath({ space }: NotesService_CreatePath_Payload) {
    // 1. Check if the `space/notes` path already exists.
    // 2. Create it if it doesn't.
    // 3. Make it public (which we can since we're the host).

    // 1. Check if the paths already exists in bedrock-db.
    const dbResponse = await APIConnection.getInstance().conduit.scry({
      app: 'bedrock',
      path: '/db',
    });

    const paths: BedrockPath[] = dbResponse.paths ?? [];
    const existingPath = paths.find((o) => o.path === `${space}/notes`);
    if (existingPath) {
      console.info('Notes: Path already exists, skipping.');
      return;
    }

    // 2. Create the paths.
    try {
      const isPersonalSpace = space.split('/our').length > 1;
      if (isPersonalSpace) {
        console.log('Notes: Personal space, skipping making public.');
        await APIConnection.getInstance().conduit.poke({
          app: 'bedrock',
          mark: 'db-action',
          json: {
            'create-path': {
              path: `${space}/notes`,
            },
          },
        });

        return;
      } else {
        await APIConnection.getInstance().conduit.poke({
          app: 'bedrock',
          mark: 'db-action',
          json: {
            'create-from-space': {
              path: `${space}/notes`,
              'space-path': space,
              'space-role': 'member',
            },
          },
        });
      }
    } catch (error) {
      console.error('Notes: Failed to create notes path.', error);
    }

    // 3. Make notes and notes_edits tables public.
    try {
      const accessRules = {
        host: {
          create: true,
          edit: 'table',
          delete: 'table',
        },
        '': {
          create: true,
          edit: 'table',
          delete: 'table',
        },
      };

      await APIConnection.getInstance().conduit.poke({
        app: 'bedrock',
        mark: 'db-action',
        json: {
          'edit-path': {
            path: `${space}/notes`,
            'table-access': {
              notes: accessRules,
              'notes-edits': accessRules,
            },
          },
        },
      });
    } catch (error) {
      console.error('Notes: Failed to make notes table public.', error);
    }
  }

  async syncWithBedrock({ space }: NotesService_GetBedrockState_Payload) {
    /**
     * PHASE 1 – Sync `notes` (not using yjs yet, so we override)
     * 1. Fetch notes (metadata) from Bedrock.
     * 2. Upsert notes in SQLite.
     * 3. Delete notes rows that are no longer in Bedrock.
     * PHASE 2 – Sync `notes_edits` (using yjs for CRDT)
     * 4. Get all notes_edits from Bedrock.
     * 5. Insert all missing notes updates rows in SQLite.
     * 6. Post back missing notes_edits rows to Bedrock.
     */

    if (!this.notesDB) return;

    // 1. Fetch notes metadata from Bedrock.
    let bedrockResponse: BedrockResponse | undefined;
    try {
      bedrockResponse = await APIConnection.getInstance().conduit.scry({
        app: 'bedrock',
        path: `/db/path${space}/notes`,
      });
    } catch (error) {
      console.error('Notes: Failed to fetch notes from Bedrock.', error);
    }
    if (!bedrockResponse || !bedrockResponse.tables) return;

    // 2. Upsert notes metadata in SQLite.
    const notesTable = bedrockResponse.tables.find((o) => o.type === 'notes');
    if (!notesTable) return;

    const notesTableRows = notesTable.rows ?? [];
    notesTableRows.forEach((note) => {
      const rowData: BedrockRowData_Notes = note.data;

      this.notesDB?.upsertNote({
        id: note.id,
        space: note.path.split('/notes')[0],
        author: note.creator,
        title: rowData.title,
      });
      this.sendUpdate({
        type: 'create-note',
        payload: {
          id: note.id,
          title: note.data.title,
          author: note.creator,
          space: note.path.split('/notes')[0],
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

    // 4. Get all notes updates from Bedrock.
    const notesEditsTable = bedrockResponse.tables.find(
      (o) => o.type === 'notes-edits'
    );
    if (!notesEditsTable) return;

    // 5. Insert all missing notes updates in SQLite.
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

    // 6. Post notes updates that weren't in Bedrock.
    const notesDBNotesEdits = this.notesDB.selectAllNotesEdits();
    notesDBNotesEdits.forEach((noteEdit) => {
      const noteEditExistsInBedrock = notesEditsTableRows.find(
        (o) => o.id === noteEdit.id
      );
      if (!noteEditExistsInBedrock) {
        this.createNoteUpdate({
          note_id: noteEdit.note_id,
          note_edit: noteEdit.note_edit,
          space,
        });
      }
    });
    // Unsynced local changes.
    // const notesDBLocalNotesEdits = this.notesDB.selectAllLocalNotesEdits();
    // notesDBLocalNotesEdits.forEach((noteEdit) => {
    //   this.createNoteUpdate({
    //     note_id: noteEdit.note_id,
    //     edit: noteEdit.note_edit,
    //     space,
    //   });
    // });
    // this.notesDB.deleteAllLocalNotesEdits();
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
              v: 0,
              path: `${space}/notes`,
              type: 'notes',
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
      return APIConnection.getInstance().conduit.poke({
        app: 'bedrock',
        mark: 'db-action',
        json: {
          create: {
            v: 0,
            path: `${space}/notes`,
            type: 'notes-edits',
            data: createNoteUpdateData,
            schema: createNoteUpdateSchema,
          },
        },
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

  async saveNoteUpdates({
    note_id,
    space,
  }: NotesService_SaveNoteUpdates_Payload) {
    if (!this.notesDB) return;

    const unsavedNoteEdits = this.notesDB.selectAllUnsavedNoteEdits({
      note_id,
    });
    if (!unsavedNoteEdits.length) return;

    // Merge yjs updates into one before sending to Bedrock.
    const edits = unsavedNoteEdits.map((o) => {
      return toUint8Array(o.note_edit);
    });
    const mergedNoteEdits = edits.reduce((acc, curr) => {
      return Y.mergeUpdates([acc, curr]);
    });

    // Send merged updates to Bedrock.
    const response = await this.createNoteUpdate({
      note_edit: fromUint8Array(mergedNoteEdits),
      note_id,
      space,
    });

    if (response) {
      // Delete local unsaved edits that will be replaced by the merged update.
      this.notesDB.deleteAllUnsavedNoteEdits({ note_id });

      return true;
    } else {
      return false;
    }
  }

  subscribe({ space: spacePath }: NotesService_Subscribe_Payload) {
    return APIConnection.getInstance().conduit.watch({
      app: 'bedrock',
      path: `/path${spacePath}/notes`,
      onEvent: (updates: BedrockSubscriptionUpdate[] | null) => {
        if (!updates || !updates.length) return;

        updates.forEach((update) => {
          if (!this.notesDB) return;

          if (update.change === 'add-row') {
            if (update.row?.type === 'notes') {
              const rowData = update.row.data;

              // Update SQLite.
              this.notesDB.upsertNote({
                id: update.row.id,
                space: update.row.path.split('/notes')[0],
                author: update.row.creator,
                title: rowData.title,
              });
              // Update MobX.
              this.sendUpdate({
                type: 'create-note',
                payload: {
                  id: update.row.id,
                  space: update.row.path.split('/notes')[0],
                  author: update.row.creator,
                  title: rowData.title,
                  created_at: update.row['created-at'],
                  updated_at: update.row['updated-at'],
                },
              });
            } else if (update.row?.type === 'notes-edits') {
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
            if (update.row?.type === 'notes') {
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

            if (update.row?.type === 'notes') {
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
