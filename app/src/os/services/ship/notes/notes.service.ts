import { app } from 'electron';
import log from 'electron-log';

import type { BedrockSchema, BedrockSubscriptionUpdate } from 'os/types';

import AbstractService, { ServiceOptions } from '../../abstract.service';
import APIConnection from '../../api/api-connection';
import { NotesDB } from './notes.db';
import {
  NotesService_BedrockUpdate_CreateNoteData,
  NotesService_CreateNote_Payload,
  NotesService_GetNotes_Payload,
  NotesService_IPCUpdate,
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

  createNote({ title, doc, space }: NotesService_CreateNote_Payload) {
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

  getNotes({ space }: NotesService_GetNotes_Payload) {
    if (!this.notesDB) return [];

    return this.notesDB.selectAll({ space });
  }

  // saveNote: NotesService_SaveNote = ({ bedrockRowId, space, title, doc }) => {
  //   return APIConnection.getInstance().conduit.poke({
  //     app: 'bedrock',
  //     mark: 'db-action',
  //     json: {
  //       edit: {
  //         id: bedrockRowId,
  //         'input-row': {
  //           v: 0,
  //           path: space,
  //           type: 'realm-note',
  //           data: [],
  //           schema: [],
  //         },
  //       },
  //     },
  //   });
  // };

  // deleteNote: NotesService_DeleteNote = ({ id }) => {
  //   return APIConnection.getInstance().conduit.poke({
  //     app: 'bedrock',
  //     mark: 'db-action',
  //     json: {
  //       remove: {
  //         id: rowID,
  //         path: path,
  //         type: type,
  //       },
  //     },
  //   });

  //   return this.notesDB?.delete({ id });
  // };

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

            const sqlRowId = this.notesDB?.insert({
              bedrockId: update.row.id,
              space: update.row.path,
              author: update.row.creator,
              title: rowData.title,
              doc: JSON.parse(rowData.doc),
            });

            console.log('notes.service.ts: realm-note subscription update.');
            this.sendUpdate({
              type: 'create-note',
              payload: {
                id: sqlRowId,
                bedrockId: update.row.id,
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
