import { fromUint8Array } from 'js-base64';
import { TextSelection, Transaction } from 'prosemirror-state';
import * as Y from 'yjs';

import { Flex } from '@holium/design-system/general';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useShipStore } from 'renderer/stores/ship.store';

import { EditorContainer } from './EditorView.styles';
import { useCollabEditor } from './useCollabEditor';

export type SendCaret = (patp: string, x: number, y: number) => void;

export type SendTransaction = (
  patp: string,
  version: number,
  serializedSteps: any,
  clientID: string | number
) => void;

type Props = {
  history: string[];
  shipStore: ReturnType<typeof useShipStore>;
  roomsStore: ReturnType<typeof useRoomsStore>;
  onBlurDoc: (newHistory: string[]) => void;
};

export const EditorView = ({
  history,
  shipStore,
  roomsStore,
  onBlurDoc,
}: Props) => {
  const { ydoc, editorView, onEditorRef } = useCollabEditor({
    history,
    shipStore,
    roomsStore,
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

  const onBlur = () => {
    if (!ydoc) return;

    const update = Y.encodeStateAsUpdate(ydoc);
    const updateBase64Encoded = fromUint8Array(update);

    onBlurDoc([updateBase64Encoded]);
  };

  return (
    <EditorContainer>
      <div ref={onEditorRef} onBlur={onBlur} />
      <Flex flex={1} className="text-cursor move-to-end" onClick={moveToEnd} />
    </EditorContainer>
  );
};
