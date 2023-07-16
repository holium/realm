import { app } from 'electron';
import log from 'electron-log';

import type { BedrockSchema, BedrockSubscriptionUpdate } from 'os/types';

import AbstractService, { ServiceOptions } from '../../abstract.service';
import APIConnection from '../../api/api-connection';
import { NotesDB } from './notes.db';
import {
  NotesService_BedrockUpdate_CreateNoteData,
  NotesService_CreateNote_Payload,
  NotesService_DeleteNote_Payload,
  NotesService_GetNotes_Payload,
  NotesService_IPCUpdate,
  NotesService_SaveNote_Payload,
} from './notes.service.types';

export class NotesService extends AbstractService<NotesService_IPCUpdate> {
  private patp: string;
  private notesDB?: NotesDB;

  constructor(patp: string, options?: ServiceOptions) {
    super('notesService', options);

    this.patp = patp;
    if (options?.preload) return;
    this.notesDB = new NotesDB(this.patp);
    if (options?.verbose) {
      log.info(
        'notes.service.ts:',
        `Created notes database for ${patp} with client-side encryption key`
      );
    }

    app.on('quit', () => {
      this.notesDB?.disconnect();
    });
  }

  createNote({
    title,
    doc,
    space,
  }: NotesService_CreateNote_Payload): Promise<number> {
    const createNoteData = [title, JSON.stringify(doc)];
    const createNoteSchema: BedrockSchema = [
      ['title', 't'],
      ['doc', 't'],
    ];
    return APIConnection.getInstance().conduit.poke({
      app: 'bedrock',
      mark: 'db-action',
      json: {
        create: {
          v: 0,
          path: space,
          type: 'realm-note',
          data: createNoteData,
          schema: createNoteSchema,
        },
      },
    });
  }

  async deleteNote({ id, space }: NotesService_DeleteNote_Payload) {
    const result = await APIConnection.getInstance().conduit.poke({
      app: 'bedrock',
      mark: 'db-action',
      json: {
        remove: {
          id,
          path: space,
          type: 'realm-note',
        },
      },
    });

    if (result) {
      this.notesDB?.delete({ id });
      this.sendUpdate({
        type: 'delete-note',
        payload: { id },
      });
    }
  }

  getNotes({ space }: NotesService_GetNotes_Payload) {
    if (!this.notesDB) return [];

    // TODO: sync with Bedrock and replace local DB with the response.

    return this.notesDB.selectAll({ space });
  }

  editNote({ id, space, title, doc }: NotesService_SaveNote_Payload) {
    const editNoteData = [title, JSON.stringify(doc)];
    const editNoteSchema: BedrockSchema = [
      ['title', 't'],
      ['doc', 't'],
    ];

    return APIConnection.getInstance().conduit.poke({
      app: 'bedrock',
      mark: 'db-action',
      json: {
        edit: {
          id,
          'input-row': {
            v: 0,
            path: space,
            type: 'realm-note',
            data: editNoteData,
            schema: editNoteSchema,
          },
        },
      },
    });
  }

  subscribe(spacePath: string) {
    return APIConnection.getInstance().conduit.watch({
      app: 'bedrock',
      path: `/path${spacePath}`,
      onEvent: (updates: BedrockSubscriptionUpdate[]) => {
        updates.forEach((update) => {
          if (!this.notesDB) return;

          if (update.change === 'add-row') {
            // Only handle realm-note updates.
            if (update.row?.type !== 'realm-note') return;

            const rowData: NotesService_BedrockUpdate_CreateNoteData =
              update.row.data;

            // Update SQLite.
            this.notesDB?.upsert({
              id: update.row.id,
              space: update.row.path,
              author: update.row.creator,
              title: rowData.title,
              doc: JSON.parse(rowData.doc),
            });
            // Update MobX.
            this.sendUpdate({
              type: 'create-note',
              payload: {
                id: update.row.id,
                title: rowData.title,
                author: update.row.creator,
                space: update.row.path,
                doc: JSON.parse(rowData.doc),
                created_at: update.row['created-at'],
                updated_at: update.row['updated-at'],
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
  new NotesService('', { preload: true })
);
