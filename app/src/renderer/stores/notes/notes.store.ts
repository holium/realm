import { cast, flow, types } from 'mobx-state-tree';

import { NotesService_IPCUpdate } from 'os/services/ship/notes/notes.service.types';

import { NotesIPC } from '../ipc';
import {
  NoteModel,
  NotesStore_CreateNote,
  NotesStore_DeleteNote,
  NotesStore_DeleteNoteLocally,
  NotesStore_GetNote,
  NotesStore_InsertNoteLocally,
  NotesStore_LoadLocalNotes,
  NotesStore_Note,
  NotesStore_SetSelectedNoteId,
  NotesStore_SubscribeToBedrockUpdates,
  NotesStore_UpdateNote,
  NotesStore_UpdateNoteLocally,
} from './notes.store.types';

const sortByUpdatedAt = (a: NotesStore_Note, b: NotesStore_Note) => {
  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
};

export const NotesStore = types
  .model('NotesStore', {
    spaceNotes: types.optional(types.array(NoteModel), []),
    personalNotes: types.optional(types.array(NoteModel), []),
    selectedNoteId: types.maybeNull(types.string),
    loading: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get sortedSpaceNotes() {
      return self.spaceNotes.slice().sort(sortByUpdatedAt);
    },
    get sortedPersonalNotes() {
      return self.personalNotes.slice().sort(sortByUpdatedAt);
    },
    get selectedNote() {
      if (!self.selectedNoteId) return null;
      const isPersonalNote = self.personalNotes.find(
        (n) => n.id === self.selectedNoteId
      );
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      return notes.find((n) => n.id === self.selectedNoteId);
    },
  }))
  .actions((self) => ({
    /*
     * Used by the UI layer to create a note.
     */
    createNote({ title, history, space }: NotesStore_CreateNote) {
      return NotesIPC.createNote({
        title,
        history,
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
      self.loading = true;

      if (self.selectedNoteId === id) self.selectedNoteId = null;

      // Remove the note from MobX.
      const isPersonalNote = space === `/${window.ship}/our`;
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      const noteIndex = notes.findIndex((n) => n.id === id);
      if (noteIndex === -1) return;

      notes.splice(noteIndex, 1);

      // Remove the note from Bedrock & SQLite.
      yield NotesIPC.deleteNote({ id, space });

      self.loading = false;
    }),
    /*
     * Used by the UI layer to update a note.
     * We update it in MobX immediately for a snappy UI,
     * even though the main process will also send an update to
     * update it when the response comes back.
     */
    updateNote: flow(function* ({ id, title, history }: NotesStore_UpdateNote) {
      // TODO: set up a queue to prevent multiple updates from happening at once.
      if (self.loading) return;

      self.loading = true;

      const isPersonalNote = self.personalNotes.find((n) => n.id === id);
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      const note = notes.find((n) => n.id === id);
      if (!note) return;

      if (title) note.title = title;
      if (history) note.history = cast(history);
      note.updated_at = Date.now();

      yield NotesIPC.editNote({
        id,
        space: note.space,
        title: title ? title : note.title,
        history: history ? history : note.history,
      });

      self.loading = false;
    }),
    persistLocalChanges: flow(function* ({ id }: NotesStore_GetNote) {
      self.loading = true;

      const isPersonalNote = self.personalNotes.find((n) => n.id === id);
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      const note = notes.find((n) => n.id === id);
      if (!note) return;

      yield NotesIPC.editNote({
        id,
        space: note.space,
        title: note.title,
        history: note.history,
      });

      self.loading = false;
    }),
    getNote({ id }: NotesStore_GetNote) {
      const isPersonalNote = self.personalNotes.find((n) => n.id === id);
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      return notes.find((n) => n.id === id);
    },
    /*
     * Used by the UI layer to populate MobX with space notes
     * from the SQLite database upon mounting the notes app.
     */
    loadLocalSpaceNotes: flow(function* ({ space }: NotesStore_LoadLocalNotes) {
      const spaceNotesSorted = yield NotesIPC.getNotesFromDb({
        space,
      }).then((res) => {
        if (!res) return;
        return res.map((note) => {
          return NoteModel.create(note);
        });
      });

      if (spaceNotesSorted) {
        self.spaceNotes = spaceNotesSorted;
      }
    }),
    /*
     * Used by the UI layer to populate MobX with personal notes
     * from the SQLite database upon mounting the notes app.
     */
    loadLocalPersonalNotes: flow(function* ({
      space,
    }: NotesStore_LoadLocalNotes) {
      const personalNotesSorted = yield NotesIPC.getNotesFromDb({
        space,
      }).then((res) => {
        if (!res) return;
        return res.map((note) => {
          return NoteModel.create(note);
        });
      });

      if (personalNotesSorted) {
        self.personalNotes = personalNotesSorted;
      }
    }),
    subscribeToBedrockUpdates({ space }: NotesStore_SubscribeToBedrockUpdates) {
      NotesIPC.subscribe({ space });
    },
    syncLocalNotesWithBedrock(spacePath: string) {
      return NotesIPC.syncWithBedrockNotes({ space: spacePath });
    },
    setSelectedNoteId: ({ id }: NotesStore_SetSelectedNoteId) => {
      self.selectedNoteId = id;
    },
    /*
     * Private methods used by the IPC handler to register a new note in MobX.
     * This is called when the main process receives a bedrock update.
     */
    _insertNoteLocally({ note }: NotesStore_InsertNoteLocally) {
      const isPersonalNote = note.space === `/${window.ship}/our`;
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      const existingNote = notes.find((n) => n.id === note.id);
      if (existingNote) return;

      notes.unshift(note);
    },
    _updateNoteLocally: ({
      id,
      title,
      history,
    }: NotesStore_UpdateNoteLocally) => {
      const isPersonalNote = self.personalNotes.find((n) => n.id === id);
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      const note = notes.find((n) => n.id === id);
      if (!note) return;

      if (title) note.title = title;
      if (history) note.history = cast(history);
      note.updated_at = Date.now();
    },
    _deleteNoteLocally({ id }: NotesStore_DeleteNoteLocally) {
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
  loading: false,
});

// -------------------------------
// Listen for bedrock updates from the main process.
// -------------------------------
NotesIPC.onUpdate(({ type, payload }: NotesService_IPCUpdate) => {
  // If a note is open, multiplayer should handle the update.
  // const isEditing = Boolean(notesStore.selectedNoteId);
  // if (isEditing) {
  //   console.info('NotesStore.onUpdate', 'Note is open, ignoring update');
  //   return;
  // }

  if (type === 'create-note') {
    notesStore._insertNoteLocally({
      note: NoteModel.create(payload),
    });
  } else if (type === 'update-note') {
    notesStore._updateNoteLocally(payload);
  } else if (type === 'delete-note') {
    notesStore._deleteNoteLocally({ id: payload.id });
  } else {
    console.error('NotesStore.onUpdate', 'Unknown type');
  }
});
