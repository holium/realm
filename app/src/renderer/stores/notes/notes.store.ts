import { toUint8Array } from 'js-base64';
import { flow, types } from 'mobx-state-tree';
import * as Y from 'yjs';

import { NotesService_IPCUpdate } from 'os/services/ship/notes/notes.service.types';

import { NotesIPC } from '../ipc';
import {
  NoteModel,
  NotesStore_ApplyNoteUpdate,
  NotesStore_CreateNote,
  NotesStore_CreateNoteUpdate,
  NotesStore_DeleteNote,
  NotesStore_DeleteNoteLocally,
  NotesStore_EditNoteTitle,
  NotesStore_GetNote,
  NotesStore_InsertNoteLocally,
  NotesStore_LoadLocalNotes,
  NotesStore_Note,
  NotesStore_SetSelectedNoteId,
  NotesStore_SubscribeToBedrockUpdates,
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
    saving: types.optional(types.boolean, false),
  })
  .volatile(() => ({
    ydocs: new Map<string, Y.Doc>(),
  }))
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
    get selectedYDoc() {
      if (!self.selectedNoteId) return null;

      return self.ydocs.get(self.selectedNoteId);
    },
  }))
  .actions((self) => ({
    /*
     * Used by the UI layer to create a note.
     */
    createNote({ space, title }: NotesStore_CreateNote) {
      return NotesIPC.createNote({
        space,
        title,
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

    editNoteTitleLocally: ({ title }: NotesStore_EditNoteTitle) => {
      const isPersonalNote = self.personalNotes.find(
        (n) => n.id === self.selectedNoteId
      );
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      const note = notes.find((n) => n.id === self.selectedNoteId);
      if (!note) return;

      note.title = title;
    },

    persistNoteTitle: flow(function* () {
      self.saving = true;

      const isPersonalNote = self.personalNotes.find(
        (n) => n.id === self.selectedNoteId
      );
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      const note = notes.find((n) => n.id === self.selectedNoteId);
      if (!note) return;

      yield NotesIPC.editNoteTitle({
        id: note.id,
        space: note.space,
        title: note.title,
      });

      self.saving = false;
    }),

    createNoteUpdate: flow(function* ({
      note_id,
      space,
      update,
    }: NotesStore_CreateNoteUpdate) {
      yield NotesIPC.createNoteUpdate({
        note_id,
        space,
        update,
      });
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
          // Create a Y.Doc for each note.
          const ydoc = new Y.Doc();
          self.ydocs.set(note.id, ydoc);

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
          // Create a Y.Doc for each note.
          const ydoc = new Y.Doc();
          self.ydocs.set(note.id, ydoc);

          return NoteModel.create(note);
        });
      });

      if (personalNotesSorted) {
        self.personalNotes = personalNotesSorted;
      }
    }),

    async applyNotesUpdates() {
      return NotesIPC.getNotesUpdatesFromDb().then((res) => {
        if (!res) return;
        return res.forEach((update) => {
          const note = self.spaceNotes.find((n) => n.id === update.note_id);
          if (!note) return;

          const ydoc = self.ydocs.get(note.id);
          if (!ydoc) return;

          const uint8Array = toUint8Array(update.note_update);

          Y.applyUpdate(ydoc, uint8Array);
        });
      });
    },

    setUpOnYdocUpdate(callback: any) {
      if (!self.selectedYDoc) return;

      self.selectedYDoc.on('update', callback);
    },

    subscribeToBedrockUpdates({ space }: NotesStore_SubscribeToBedrockUpdates) {
      NotesIPC.subscribe({ space });
    },

    syncLocalNotesWithBedrock(spacePath: string) {
      return NotesIPC.syncWithBedrockNotes({ space: spacePath });
    },

    setSelectedNoteId: ({ id }: NotesStore_SetSelectedNoteId) => {
      self.selectedNoteId = id;
    },

    setSaving: (saving: boolean) => {
      self.saving = saving;
    },

    applyBroadcastedNoteUpdate(update: string) {
      const binaryEncodedUpdate = toUint8Array(update);
      if (!self.selectedNoteId) return;

      const selectedYDoc = self.ydocs.get(self.selectedNoteId);
      if (!selectedYDoc) return;

      selectedYDoc.transact(() => {
        Y.applyUpdate(selectedYDoc, binaryEncodedUpdate);
      });
    },

    getNotePreview(id: string) {
      const ydoc = self.ydocs.get(id);
      if (!ydoc) return null;

      const preview = ydoc.getXmlFragment('prosemirror')?.toDOM()
        .firstChild?.textContent;

      return preview ?? null;
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

    _applyNoteUpdate(update: NotesStore_ApplyNoteUpdate) {
      const note = self.spaceNotes.find((n) => n.id === update.note_id);
      if (!note) return;

      const ydoc = self.ydocs.get(note.id);
      if (!ydoc) return;

      ydoc.transact(() => {
        Y.applyUpdate(ydoc, toUint8Array(update.update));
      });
    },

    _updateNoteLocally: ({ id, title }: NotesStore_UpdateNoteLocally) => {
      const isPersonalNote = self.personalNotes.find((n) => n.id === id);
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      const note = notes.find((n) => n.id === id);
      if (!note) return;

      if (title) note.title = title;
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
  saving: false,
});

// -------------------------------
// Listen for bedrock updates from the main process.
// -------------------------------
NotesIPC.onUpdate(({ type, payload }: NotesService_IPCUpdate) => {
  // If a note is open, multiplayer should handle the update.
  // const isInMultiplayerSession = Boolean(notesStore.selectedNote);
  // if (isInMultiplayerSession) {
  //   console.info('NotesStore.onUpdate', 'Note is open, ignoring update');
  //   return;
  // }

  if (type === 'create-note') {
    notesStore._insertNoteLocally({
      note: NoteModel.create(payload),
    });
  } else if (type === 'apply-note-update') {
    notesStore._applyNoteUpdate(payload);
  } else if (type === 'update-note') {
    notesStore._updateNoteLocally(payload);
  } else if (type === 'delete-note') {
    notesStore._deleteNoteLocally({ id: payload.id });
  } else {
    console.error('NotesStore.onUpdate', 'Unknown type');
  }
});
