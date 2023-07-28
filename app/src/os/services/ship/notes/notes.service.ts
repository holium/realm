import Database from 'better-sqlite3-multiple-ciphers';

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
  BedrockRowData_NotesUpdates,
  NotesService_CreateNote_Payload,
  NotesService_CreateNoteUpdate_Payload,
  NotesService_CreatePath_Payload,
  NotesService_DeleteNote_Payload,
  NotesService_EditNoteTitle_Payload,
  NotesService_GetBedrockState_Payload,
  NotesService_GetNotes_Payload,
  NotesService_GetNoteUpdates_Payload,
  NotesService_IPCUpdate,
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
      const notesResult = await APIConnection.getInstance().conduit.poke({
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

      const associatedUpdates = this.getNoteUpdatesFromDb({ note_id: id });
      const ids = associatedUpdates.map((o) => o.id);

      const notesUpdatesResult = await APIConnection.getInstance().conduit.poke(
        {
          app: 'bedrock',
          mark: 'db-action',
          json: {
            'remove-many': {
              ids,
              path: `${space}/notes`,
              type: 'notes-updates',
            },
          },
        }
      );

      return Boolean(notesResult && notesUpdatesResult);
    } catch (error) {
      console.error('Notes: Failed to delete note.', error);

      return false;
    }
  }

  getNotesFromDb({ space }: NotesService_GetNotes_Payload) {
    if (!this.notesDB) return [];

    return this.notesDB.selectAllNotes({ space });
  }

  getNotesUpdatesFromDb() {
    if (!this.notesDB) return [];

    return this.notesDB.selectAllNotesUpdates();
  }

  getNoteUpdatesFromDb({ note_id }: NotesService_GetNoteUpdates_Payload) {
    if (!this.notesDB) return [];

    return this.notesDB.selectNoteUpdates({ note_id });
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

    // 3. Make notes and notes_updates tables public.
    try {
      const accessRules = {
        host: {
          create: true,
          edit: 'table',
          delete: 'table',
        },
        $: {
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
              'notes-updates': accessRules,
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
     * PHASE 2 – Sync `notes_updates` (using yjs for CRDT)
     * 4. Fetch all notes_updates from Bedrock.
     * 5. Insert all missing notes updates rows in SQLite.
     * 6. Post back missing notes_updates rows to Bedrock.
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

    // 4. Fetch notes updates from Bedrock.
    const notesUpdatesTable = bedrockResponse.tables.find(
      (o) => o.type === 'notes-updates'
    );
    if (!notesUpdatesTable) return;

    // 5. Insert all missing notes updates in SQLite.
    const notesUpdatesTableRows = notesUpdatesTable.rows ?? [];
    notesUpdatesTableRows.forEach((noteUpdate) => {
      const rowData: BedrockRowData_NotesUpdates = noteUpdate.data;

      this.notesDB?.insertNoteUpdate({
        id: noteUpdate.id,
        note_id: rowData.note_id,
        update: rowData.update,
      });
      this.sendUpdate({
        type: 'apply-note-update',
        payload: {
          id: noteUpdate.id,
          note_id: rowData.note_id,
          update: rowData.update,
        },
      });
    });

    // 6. Post notes updates that weren't in Bedrock.
    const notesDBNotesUpdates = this.notesDB.selectAllNotesUpdates();
    notesDBNotesUpdates.forEach((noteUpdate) => {
      const noteUpdateExistsInBedrock = notesUpdatesTableRows.find(
        (o) => o.id === noteUpdate.id
      );
      if (!noteUpdateExistsInBedrock) {
        this.createNoteUpdate({
          note_id: noteUpdate.note_id,
          update: noteUpdate.note_update,
          space,
        });
      }
    });
    // Unsynced local changes.
    const notesDBLocalNotesUpdates = this.notesDB.selectAllLocalNotesUpdates();
    notesDBLocalNotesUpdates.forEach((noteUpdate) => {
      this.createNoteUpdate({
        note_id: noteUpdate.note_id,
        update: noteUpdate.note_update,
        space,
      });
    });
    this.notesDB.deleteAllLocalNotesUpdates();
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
    update,
  }: NotesService_CreateNoteUpdate_Payload) {
    const createNoteUpdateData = [note_id, update];
    const createNoteUpdateSchema: BedrockSchema = [
      ['note_id', 't'],
      ['update', 't'],
    ];

    try {
      return APIConnection.getInstance().conduit.poke({
        app: 'bedrock',
        mark: 'db-action',
        json: {
          create: {
            v: 0,
            path: `${space}/notes`,
            type: 'notes-updates',
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
    space,
    update,
  }: NotesService_CreateNoteUpdate_Payload) {
    if (!this.notesDB) return;

    return this.notesDB.insertNoteUpdateLocally({
      note_id,
      space,
      update,
    });
  }

  async persistLocalNoteUpdates({ note_id }: { note_id: string }) {
    if (!this.notesDB) return;

    const localNoteUpdates = this.notesDB.selectAllLocalNoteUpdates({
      note_id,
    });

    if (!localNoteUpdates.length) return;

    // TODO: merge yjs updates into one before sending to Bedrock.
    const promises = localNoteUpdates.map((update) => {
      return this.createNoteUpdate({
        note_id: update.note_id,
        update: update.note_update,
        space: update.space,
      });
    });
    await Promise.all(promises);

    this.notesDB.deleteAllLocalNoteUpdates({ note_id });
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
            } else if (update.row?.type === 'notes-updates') {
              const rowData = update.row.data;

              // Update SQLite.
              this.notesDB.insertNoteUpdate({
                id: update.row.id,
                note_id: rowData.note_id,
                update: rowData.update,
              });
              // Update MobX.
              this.sendUpdate({
                type: 'apply-note-update',
                payload: {
                  id: update.row.id,
                  note_id: rowData.note_id,
                  update: rowData.update,
                },
              });
            }
          } else if (update.change === 'upd-row') {
            if (update.row?.type === 'notes') {
              const rowData = update.row.data;

              // Update SQLite.
              this.notesDB.updateTitle({
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
