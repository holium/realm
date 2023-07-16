import { flow, types } from 'mobx-state-tree';
import { schema } from 'prosemirror-schema-basic';

import { NotesService_IPCUpdate } from 'os/services/ship/notes/notes.service.types';

import { NotesIPC } from '../ipc';
import {
  NoteModel,
  NotesStore_CreateNote,
  NotesStore_DeleteNote,
  NotesStore_Note,
} from './notes.store.types';

const sortByUpdatedAt = (a: NotesStore_Note, b: NotesStore_Note) => {
  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
};

export const NotesStore = types
  .model('NotesStore', {
    spaceNotes: types.optional(types.array(NoteModel), []),
    personalNotes: types.optional(types.array(NoteModel), []),
    selectedNoteId: types.maybeNull(types.string),
  })
  .actions((self) => ({
    /*
     * Used by the UI layer to create a note.
     */
    createNote({ title, doc, space }: NotesStore_CreateNote) {
      return NotesIPC.createNote({
        title,
        doc,
        space,
      });
    },
    /*
     * Used by the UI layer to delete a note.
     * We delete it in MobX immediately for a snappy UI,
     * even though the main process will also send an update to
     * delete it when the response comes back.
     */
    deleteNote: flow(function* ({ id, space }: NotesStore_DeleteNote) {
      if (self.selectedNoteId === id) self.selectedNoteId = null;

      // Remove the note from MobX.
      const isPersonalNote = space === `/${window.ship}/our`;
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      const noteIndex = notes.findIndex((n) => n.id === id);
      if (noteIndex === -1) return;

      notes.splice(noteIndex, 1);

      // Remove the note from Bedrock & SQLite.
      yield NotesIPC.deleteNote({ id, space });
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
     * Used by the UI layer to populate MobX with personal notes
     * from the SQLite database upon mounting the notes app.
     */
    loadPersonalNotes: flow(function* (ourSpacePath: string) {
      const personalNotesSorted = yield NotesIPC.getNotes({
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

      if (personalNotesSorted) {
        self.personalNotes = personalNotesSorted;
      }
    }),
    setSelectedNoteId: (id: string | null) => {
      self.selectedNoteId = id;
    },
    getNoteById(id: string) {
      return self.spaceNotes.find((note) => note.id === id);
    },
    /*
     * Used by IPC handler to register a new note in MobX.
     * This is called when the main process receives a bedrock update.
     */
    _insertNote(note: NotesStore_Note) {
      const isPersonalNote = note.space === `/${window.ship}/our`;
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      const existingNote = notes.find((n) => n.id === note.id);
      if (existingNote) return;

      notes.unshift(note);
    },
    _deleteNote: (id: string) => {
      const isPersonalNote = self.personalNotes.find((n) => n.id === id);
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      const noteIndex = notes.findIndex((n) => n.id === id);
      if (noteIndex === -1) return;

      notes.splice(noteIndex, 1);
    },
  }));

export const notesStore = NotesStore.create({
  personalNotes: [],
  spaceNotes: [],
  selectedNoteId: null,
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
  } else if (type === 'delete-note') {
    notesStore._deleteNote(payload.id);
  } else {
    console.log('NotesStore.onUpdate: Unknown type');
  }
});
