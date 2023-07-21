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
    update,
  }: NotesService_CreateNote_Payload): Promise<void> {
    // Create metadata entry in Bedrock.
    const createNoteData = [title];
    const createNoteSchema: BedrockSchema = [['title', 't']];
    const note_id = await APIConnection.getInstance().conduit.poke({
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
    console.log('createNote note_id:::', note_id);

    // Create first update entry in Bedrock.
    const createNoteHistoryData = [note_id, update];
    const createNoteHistorySchema: BedrockSchema = [
      ['note_id', 't'],
      ['update', 't'],
    ];
    await APIConnection.getInstance().conduit.poke({
      app: 'bedrock',
      mark: 'db-action',
      json: {
        create: {
          v: 0,
          path: space,
          type: 'notes-updates',
          data: createNoteHistoryData,
          schema: createNoteHistorySchema,
        },
      },
    });
  }

  deleteNote({ id, space }: NotesService_DeleteNote_Payload) {
    return APIConnection.getInstance().conduit.poke({
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
  }

  getNotesFromDb({ space }: NotesService_GetNotes_Payload) {
    if (!this.notesDB) return [];

    return this.notesDB.selectAllNotes({ space });
  }

  getNotesUpdatesFromDb() {
    if (!this.notesDB) return [];

    return this.notesDB.selectAllNotesUpdates();
  }

  async syncWithBedrockNotes({ space }: NotesService_GetBedrockState_Payload) {
    if (!this.notesDB) return;

    // Get notes from Bedrock.
    const bedrockResponse: BedrockResponse =
      await APIConnection.getInstance().conduit.scry({
        app: 'bedrock',
        path: `/db/path${space}`,
      });
    if (!bedrockResponse) return;

    const notesTable = bedrockResponse.tables.find((o) => o.type === 'notes');
    const notesTableRows = notesTable?.rows ?? [];
    console.log('notesTableRows', notesTableRows);
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

    // Get notes update from Bedrock.
    const notesUpdatesTable = bedrockResponse.tables.find(
      (o) => o.type === 'notes-updates'
    );
    const notesUpdatesTableRows = notesUpdatesTable?.rows ?? [];
    console.log('notesUpdatesTableRows', notesUpdatesTableRows);
    notesUpdatesTableRows.forEach((noteHistory) => {
      const rowData: BedrockRowData_NotesUpdates = noteHistory.data;

      this.notesDB?.insertNoteHistory({
        id: noteHistory.id,
        note_id: rowData.note_id,
        update: rowData.update,
      });
      this.sendUpdate({
        type: 'create-note-update',
        payload: {
          id: noteHistory.id,
          note_id: rowData.note_id,
          update: rowData.update,
        },
      });
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
            // Delete responses have a diffrent structure.
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
      onError: () => console.log('Notes: Subscription rejected.'),
      onQuit: () => console.log('Notes: Kicked from subscription.'),
    });
  }
}

export const notesPreload = NotesService.preload(
  new NotesService({ preload: true })
);
