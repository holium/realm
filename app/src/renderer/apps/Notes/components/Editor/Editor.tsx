import { observer } from 'mobx-react';
import { Node } from 'prosemirror-model';

import { useShipStore } from 'renderer/stores/ship.store';

import { EditorView } from './EditorView';

const EditorPresenter = () => {
  const { notesStore } = useShipStore();

  const { selectedNoteId } = notesStore;

  const selectedNote = selectedNoteId
    ? notesStore.getNote({ id: selectedNoteId })
    : null;

  if (!selectedNote) return null;

  const onBlurDoc = (doc: Node) => {
    if (selectedNote.doc.eq(doc)) return;

    notesStore.updateNote({
      id: selectedNote.id,
      doc,
    });
  };

  return <EditorView doc={selectedNote.doc} onBlurDoc={onBlurDoc} />;
};

export const Editor = observer(EditorPresenter);
