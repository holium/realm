import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { TextSelection, Transaction } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { Flex } from '@holium/design-system/general';
import { useBroadcast } from '@holium/realm-presence';

import { useShipStore } from 'renderer/stores/ship.store';

import { Authority } from './Authority';
import { collabEditor } from './collabEditor';
import { CustomCaret } from './CustomCaret';
import { EditorContainer } from './Editor.styles';
import { schema } from './schema';

type Carets = Record<string, { x: number; y: number }>;

export type SendCaret = (patp: string, x: number, y: number) => void;

export type SendTransaction = (
  patp: string,
  version: number,
  serializedSteps: any,
  clientID: string | number
) => void;

const EditorPresenter = () => {
  const { notesStore } = useShipStore();

  const { selectedNoteId } = notesStore;

  const selectedNote = selectedNoteId
    ? notesStore.getNoteById(selectedNoteId)
    : null;

  const [editorView, setEditorView] = useState<EditorView>();
  const [authority, setAuthority] = useState<Authority>();
  const [carets, setCarets] = useState<Carets>({});

  const onTransaction: SendTransaction = (
    _patp,
    version,
    serializedSteps,
    clientID
  ) => {
    if (!editorView || !authority) return;
    const parsedSteps = serializedSteps.map((s: object) =>
      Step.fromJSON(schema, s)
    );
    authority.receiveSteps(version, parsedSteps, clientID);
  };

  const onCaret: SendCaret = (patp, x, y) => {
    setCarets((prevCarets) => ({ ...prevCarets, [patp]: { x, y } }));
  };

  const { broadcast: sendTransaction } = useBroadcast({
    channelId: 'transactions',
    onBroadcast: onTransaction,
  });
  const { broadcast: sendCaret } = useBroadcast({
    channelId: 'carets',
    onBroadcast: onCaret,
  });

  useEffect(() => {
    return () => {
      if (!editorView) return;
      if (!selectedNote) return;

      const doc = editorView.state.doc;

      if (selectedNote.doc.eq(doc)) return;

      notesStore._updateNoteLocally({
        id: selectedNote.id,
        doc,
      });
    };
  }, []);

  if (!selectedNote) return null;

  const onEditorRef = (ref: HTMLDivElement) => {
    if (!ref) return;
    if (editorView) return;
    if (authority) return;

    const newAuthority = new Authority(selectedNote.doc);
    const newEditor = collabEditor(
      newAuthority,
      ref,
      sendTransaction,
      sendCaret
    );

    setEditorView(newEditor);
    setAuthority(newAuthority);
  };

  const moveToEnd = () => {
    // Focus the editor.
    if (!editorView) return;
    editorView.focus();

    // Move the cursor to the end of the doc and line.
    const transaction: Transaction = editorView.state.tr.setSelection(
      new TextSelection(
        editorView.state.doc.resolve(editorView.state.doc.nodeSize - 2)
      )
    );
    editorView.dispatch(transaction);
  };

  const onBlurDoc = () => {
    if (!editorView) return;

    const doc = editorView.state.doc;

    if (selectedNote.doc.eq(doc)) return;

    notesStore.editNoteInBedrock({
      id: selectedNote.id,
      doc,
      title: selectedNote.title,
      space: selectedNote.space,
    });
  };

  return (
    <EditorContainer>
      <div ref={onEditorRef} onBlur={onBlurDoc}>
        {Object.entries(carets).map(([patp, position]) => (
          <CustomCaret key={patp} top={position.y} left={position.x} />
        ))}
      </div>
      <Flex flex={1} className="text-cursor move-to-end" onClick={moveToEnd} />
    </EditorContainer>
  );
};

export const Editor = observer(EditorPresenter);
