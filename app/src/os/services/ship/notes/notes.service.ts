import Database from 'better-sqlite3-multiple-ciphers';

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
  BedrockRowData_NotesUpdates,
  NotesService_CreateNote_Payload,
  NotesService_CreateNoteUpdate_Payload,
  NotesService_DeleteNote_Payload,
  NotesService_EditNoteTitle_Payload,
  NotesService_GetBedrockState_Payload,
  NotesService_GetNotes_Payload,
  NotesService_GetNoteUpdates_Payload,
  NotesService_IPCUpdate,
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
          path: space,
          type: 'notes',
          data: createNoteData,
          schema: createNoteSchema,
        },
      },
    });
  }

  async deleteNote({ id, space }: NotesService_DeleteNote_Payload) {
    const notesResult = await APIConnection.getInstance().conduit.poke({
      app: 'bedrock',
      mark: 'db-action',
      json: {
        remove: {
          id,
          path: space,
          type: 'notes',
        },
      },
    });

    const associatedUpdates = this.getNoteUpdatesFromDb({ note_id: id });
    const ids = associatedUpdates.map((o) => o.id);

    const notesUpdatesResult = await APIConnection.getInstance().conduit.poke({
      app: 'bedrock',
      mark: 'db-action',
      json: {
        'remove-many': {
          ids,
          path: space,
          type: 'notes-updates',
        },
      },
    });

    return Boolean(notesResult && notesUpdatesResult);
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
        path: `/db/path${space}`,
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
  }

  editNoteTitle({ id, space, title }: NotesService_EditNoteTitle_Payload) {
    const editNoteData = [title];
    const editNoteSchema: BedrockSchema = [['title', 't']];

    return APIConnection.getInstance().conduit.poke({
      app: 'bedrock',
      mark: 'db-action',
      json: {
        edit: {
          id,
          'input-row': {
            v: 0,
            path: space,
            type: 'notes',
            data: editNoteData,
            schema: editNoteSchema,
          },
        },
      },
    });
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

    return APIConnection.getInstance().conduit.poke({
      app: 'bedrock',
      mark: 'db-action',
      json: {
        create: {
          v: 0,
          path: space,
          type: 'notes-updates',
          data: createNoteUpdateData,
          schema: createNoteUpdateSchema,
        },
      },
    });
  }

  subscribe({ space: spacePath }: NotesService_GetNotes_Payload) {
    return APIConnection.getInstance().conduit.watch({
      app: 'bedrock',
      path: `/path${spacePath}`,
      onEvent: (updates: BedrockSubscriptionUpdate[] | null) => {
        if (!updates || !updates.length) return;
        // console.log('updates', updates);

        updates.forEach((update) => {
          if (!this.notesDB) return;

          if (update.change === 'add-row') {
            // TODO: handle notes-updates
            // Only handle 'notes' updates.
            if (update.row?.type !== 'notes') return;

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
          } else if (update.change === 'upd-row') {
            // Only handle notes updates.
            if (update.row?.type !== 'notes') return;

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
          } else if (update.change === 'del-row') {
            // Delete responses that have a diffrent structure.
            if (update.type !== 'notes' || !update.id) return;

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
