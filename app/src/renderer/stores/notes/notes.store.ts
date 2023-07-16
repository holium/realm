import { flow, types } from 'mobx-state-tree';
import { schema } from 'prosemirror-schema-basic';

import { NotesService_IPCUpdate } from 'os/services/ship/notes/notes.service.types';

import { NotesIPC } from '../ipc';
import {
  NoteModel,
  NotesStore_CreateNote,
  NotesStore_Note,
} from './notes.store.types';

const sortByUpdatedAt = (a: NotesStore_Note, b: NotesStore_Note) => {
  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
};

export const NotesStore = types
  .model('NotesStore', {
    myNotes: types.optional(types.array(NoteModel), []),
    spaceNotes: types.optional(types.array(NoteModel), []),
  })
  .views((_self) => ({}))
  .actions((self) => ({
    /*
     * Used by the UI layer to create a note.
     * MobX won't be updated until the bedrock response
     * from the main process is received.
     */
    createNote: flow(function* ({
      title,
      doc,
      space,
    }: NotesStore_CreateNote): Generator<any, number | undefined, any> {
      const noteId = yield NotesIPC.createNote({
        title,
        doc,
        space,
      });
      return noteId;
    }),
    /*
     * Used by the UI layer to populate MobX with personal notes
     * from the SQLite database upon mounting the notes app.
     */
    loadMyNotes: flow(function* (ourSpacePath: string) {
      const myNotesSorted = yield NotesIPC.getNotes({
        space: ourSpacePath,
      }).then((res) => {
        if (!res) return;
        return res
          .map((note) => {
            return NoteModel.create({
              ...note,
              doc: schema.nodeFromJSON(note.doc),
            });
          })
          .sort(sortByUpdatedAt);
      });

      if (myNotesSorted) {
        self.myNotes = myNotesSorted;
      }
    }),
    /*
     * Used by the UI layer to populate MobX with space notes
     * from the SQLite database upon mounting the notes app.
     */
    loadSpaceNotes: flow(function* (spacePath: string) {
      const spaceNotesSorted = yield NotesIPC.getNotes({
        space: spacePath,
      }).then((res) => {
        if (!res) return;
        return res
          .map((note) => {
            return NoteModel.create({
              ...note,
              doc: schema.nodeFromJSON(note.doc),
            });
          })
          .sort(sortByUpdatedAt);
      });

      if (spaceNotesSorted) {
        self.spaceNotes = spaceNotesSorted;
      }
    }),
    /*
     * Used by IPC handler to register a new note in MobX.
     * This is called when the main process receives a bedrock update.
     */
    _insertNote(note: NotesStore_Note) {
      const isPersonalNote = note.space === `/${window.ship}/our`;
      if (isPersonalNote) {
        self.myNotes.push(note);
      } else {
        self.spaceNotes.push(note);
      }
    },
  }));

export const notesStore = NotesStore.create({
  myNotes: [],
  spaceNotes: [],
});

// -------------------------------
// Listen for bedrock updates from the main process.
// -------------------------------
NotesIPC.onUpdate(({ type, payload }: NotesService_IPCUpdate) => {
  console.log('-------------------------------');
  console.log('NotesStore.onUpdate', type, payload);
  console.log('-------------------------------');

  if (type === 'create-note') {
    notesStore._insertNote(
      NoteModel.create({
        ...payload,
        doc: schema.nodeFromJSON(payload.doc),
      })
    );
  }
});
