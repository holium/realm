import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';
import { Node } from 'prosemirror-model';

import { useShipStore } from 'renderer/stores/ship.store';

import { EditorView } from './EditorView';

const EditorPresenter = () => {
  const { notesStore } = useShipStore();

  const { selectedNote } = notesStore;

  if (!selectedNote) return null;

  const onBlurDoc = debounce((doc: Node) => {
    notesStore.updateNote({
      id: selectedNote.id,
      doc,
    });
  }, 1000);

  const onChangeDoc = (doc: Node) => {
    if (selectedNote.doc.content.eq(doc.content)) return;

    notesStore._updateNoteLocally({
      id: selectedNote.id,
      doc,
    });
  };

  return (
    <EditorView
      doc={selectedNote.doc}
      onBlurDoc={onBlurDoc}
      onChangeDoc={onChangeDoc}
    />
  );
};

export const Editor = observer(EditorPresenter);
