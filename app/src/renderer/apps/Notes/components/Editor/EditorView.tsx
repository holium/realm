import { useState } from 'react';
import { Node } from 'prosemirror-model';
import { TextSelection, Transaction } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';
import { EditorView as ProseMirrorEditorView } from 'prosemirror-view';

import { Flex } from '@holium/design-system/general';
import { useBroadcast } from '@holium/realm-presence';

import { Authority } from './Authority';
import { collabEditor } from './collabEditor';
import { CustomCaret } from './CustomCaret';
import { EditorContainer } from './EditorView.styles';
import { schema } from './schema';

type Carets = Record<string, { x: number; y: number }>;

export type SendCaret = (patp: string, x: number, y: number) => void;

export type SendTransaction = (
  patp: string,
  version: number,
  serializedSteps: any,
  clientID: string | number
) => void;

type Props = {
  doc: Node;
  onBlurDoc: (doc: Node) => void;
  onChangeDoc: (doc: Node) => void;
};

export const EditorView = ({ doc, onBlurDoc, onChangeDoc }: Props) => {
  const [editorView, setEditorView] = useState<ProseMirrorEditorView>();
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

  const onEditorRef = (ref: HTMLDivElement) => {
    if (!ref) return;
    if (editorView) return;
    if (authority) return;

    const newAuthority = new Authority(doc);
    const newEditor = collabEditor(
      newAuthority,
      ref,
      sendTransaction,
      sendCaret,
      onChangeDoc
    );

    setEditorView(newEditor);
    setAuthority(newAuthority);
  };

  const onBlur = () => {
    if (!editorView) return;
    onBlurDoc(editorView.state.doc);
  };

  return (
    <EditorContainer>
      <div ref={onEditorRef} onBlur={onBlur}>
        {Object.entries(carets).map(([patp, position]) => (
          <CustomCaret key={patp} top={position.y} left={position.x} />
        ))}
      </div>
      <Flex flex={1} className="text-cursor move-to-end" onClick={moveToEnd} />
    </EditorContainer>
  );
};
