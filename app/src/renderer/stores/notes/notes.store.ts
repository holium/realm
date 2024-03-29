import { toUint8Array } from 'js-base64';
import { flow, types } from 'mobx-state-tree';
import { applyAwarenessUpdate, Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

import { NotesService_IPCUpdate } from 'os/services/ship/notes/notes.service.types';

import { NotesIPC } from '../ipc';
import {
  NoteModel,
  NotesStore_ApplyNoteEditLocally,
  NotesStore_CreateNote,
  NotesStore_CreateNoteUpdateLocally,
  NotesStore_DeleteNote,
  NotesStore_DeleteNoteLocally,
  NotesStore_EditNoteTitle,
  NotesStore_GetNote,
  NotesStore_InsertNoteLocally,
  NotesStore_LoadLocalNotes,
  NotesStore_Note,
  NotesStore_SaveLocalNoteUpdates,
  NotesStore_SetSelectedNoteId,
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
    searchQuery: types.optional(types.string, ''),
    saving: types.optional(types.boolean, false),
    initializing: types.optional(types.boolean, false),
    connectingToNoteRoom: types.optional(types.boolean, false),
  })
  .volatile(() => ({
    awarenesses: new Map<string, Awareness>(),
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
    get selectedAwareness() {
      if (!self.selectedNoteId) return null;

      return self.awarenesses.get(self.selectedNoteId) ?? null;
    },
    get searchedNotes() {
      // Both personal and space notes.
      const allNotes = [...self.personalNotes, ...self.spaceNotes];

      return allNotes.filter((note) => {
        const matchingTitle = note.title
          .toLowerCase()
          .includes(self.searchQuery.toLowerCase());

        if (matchingTitle) return true;

        const doc = self.awarenesses.get(note.id)?.doc;
        if (!doc) return false;

        // Check if any of the prosemirror nodes match the search query.
        const prosemirrorNodes = doc.getXmlFragment('prosemirror')?.toDOM()
          .firstChild?.childNodes;
        if (!prosemirrorNodes) return false;

        const matchingProsemirrorNodes = Array.from(prosemirrorNodes).filter(
          (node) => {
            const textContent = node.textContent ?? '';
            return textContent
              .toLowerCase()
              .includes(self.searchQuery.toLowerCase());
          }
        );

        return matchingProsemirrorNodes.length > 0;
      });
    },
  }))
  .actions((self) => ({
    initialize: flow(function* ({ space }: { space: string }) {
      self.initializing = true;

      yield NotesIPC.syncWithBedrock({ space });
      NotesIPC.subscribe({ space });

      self.initializing = false;
    }),

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

    createNoteUpdateLocally({
      note_edit,
      note_id,
    }: NotesStore_CreateNoteUpdateLocally) {
      return NotesIPC.createNoteUpdateLocally({
        note_edit,
        note_id,
      });
    },

    saveNoteUpdates: flow(function* ({
      note_id,
      space,
    }: NotesStore_SaveLocalNoteUpdates) {
      self.saving = true;
      yield NotesIPC.saveNoteUpdates({ note_id, space });
      self.saving = false;
    }),

    getNote({ id }: NotesStore_GetNote) {
      const isPersonalNote = self.personalNotes.find((n) => n.id === id);
      const notes = isPersonalNote ? self.personalNotes : self.spaceNotes;

      return notes.find((n) => n.id === id);
    },

    loadLocalSpaceNotes: flow(function* ({ space }: NotesStore_LoadLocalNotes) {
      const spaceNotesSorted = yield NotesIPC.getNotesFromDb({
        space,
      }).then((res) => {
        if (!res) return;
        return res.map((note) => {
          // Create a Y.Doc and awareness instance for each note.
          const ydoc = new Y.Doc();
          const awareness = new Awareness(ydoc);
          self.awarenesses.set(note.id, awareness);

          return NoteModel.create(note);
        });
      });

      if (spaceNotesSorted) {
        self.spaceNotes = spaceNotesSorted;
      }
    }),

    loadLocalPersonalNotes: flow(function* ({
      space,
    }: NotesStore_LoadLocalNotes) {
      const personalNotesSorted = yield NotesIPC.getNotesFromDb({
        space,
      }).then((res) => {
        if (!res) return;
        return res.map((note) => {
          // Create a Y.Doc and awareness instance for each note.
          const ydoc = new Y.Doc();
          const awareness = new Awareness(ydoc);
          self.awarenesses.set(note.id, awareness);

          return NoteModel.create(note);
        });
      });

      if (personalNotesSorted) {
        self.personalNotes = personalNotesSorted;
      }
    }),

    async applyNotesEdits() {
      return NotesIPC.getNotesEditsFromDb().then((res) => {
        if (!res) return;
        return res.forEach((edit) => {
          const note = self.spaceNotes.find((n) => n.id === edit.note_id);
          if (!note) return;

          const awareness = self.awarenesses.get(note.id);
          if (!awareness) return;

          awareness.doc.transact(() => {
            Y.applyUpdate(awareness.doc, toUint8Array(edit.note_edit));
          });
        });
      });
    },

    setSelectedNoteId: ({ id }: NotesStore_SetSelectedNoteId) => {
      self.selectedNoteId = id;
    },

    setSaving: (saving: boolean) => {
      self.saving = saving;
    },

    setSearchquery: (query: string) => {
      self.searchQuery = query;
    },

    setConnectingToNoteRoom: (connecting: boolean) => {
      self.connectingToNoteRoom = connecting;
    },

    applyBroadcastedYdocUpdate(from: string, edit: string) {
      if (!self.selectedNoteId) return;

      const awareness = self.awarenesses.get(self.selectedNoteId);
      if (!awareness) return;

      awareness.doc.transact(() => {
        Y.applyUpdate(awareness.doc, toUint8Array(edit), from);
      });
    },

    applyBroadcastedAwarenessUpdate(from: string, edit: string) {
      if (!self.selectedNoteId) return;

      const selectedAwareness = self.awarenesses.get(self.selectedNoteId);
      if (!selectedAwareness) return;

      applyAwarenessUpdate(selectedAwareness, toUint8Array(edit), from);
    },

    getNotePreview(id: string) {
      const ydoc = self.awarenesses.get(id)?.doc;
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

      const existingAwareness = self.awarenesses.get(note.id);
      if (existingAwareness) return;

      const ydoc = new Y.Doc();
      const awareness = new Awareness(ydoc);
      self.awarenesses.set(note.id, awareness);
    },

    _applyNoteEdit(edit: NotesStore_ApplyNoteEditLocally) {
      const note = [...self.personalNotes, ...self.spaceNotes].find(
        (n) => n.id === edit.note_id
      );
      if (!note) return;

      const awareness = self.awarenesses.get(note.id);
      if (!awareness) return;

      awareness.doc.transact(() => {
        Y.applyUpdate(awareness.doc, toUint8Array(edit.note_edit));
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
  initializing: false,
  connectingToNoteRoom: false,
});

// -------------------------------
// Listen for bedrock updates from the main process.
// -------------------------------
NotesIPC.onUpdate(({ type, payload }: NotesService_IPCUpdate) => {
  if (type === 'create-note') {
    notesStore._insertNoteLocally({
      note: NoteModel.create(payload),
    });
  } else if (type === 'apply-notes-edit') {
    notesStore._applyNoteEdit(payload);
  } else if (type === 'update-note') {
    notesStore._updateNoteLocally(payload);
  } else if (type === 'delete-note') {
    notesStore._deleteNoteLocally({ id: payload.id });
  } else {
    console.error('NotesStore.onUpdate', 'Unknown type');
  }
});
