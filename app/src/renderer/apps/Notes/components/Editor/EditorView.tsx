import { TextSelection, Transaction } from 'prosemirror-state';

import { Flex } from '@holium/design-system/general';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';

import { EditorContainer } from './EditorView.styles';
import { useCollabEditor } from './useCollabEditor';

type Props = {
  updates: string[];
  roomsStore: ReturnType<typeof useRoomsStore>;
  onChangeDoc: (newHistory: string) => void;
};

export const EditorView = ({ updates, roomsStore, onChangeDoc }: Props) => {
  const { editorView, onEditorRef } = useCollabEditor({
    updates,
    roomsStore,
    onChangeDoc,
  });

  const moveToEnd = () => {
    if (!editorView) return;

    console.log('Moving to end...');

    // Focus the editor.
    editorView.focus();

    // Move the cursor to the end of the doc and line.
    const transaction: Transaction = editorView.state.tr.setSelection(
      new TextSelection(
        editorView.state.doc.resolve(editorView.state.doc.nodeSize - 2)
      )
    );
    editorView.dispatch(transaction);
  };

  return (
    <EditorContainer>
      <div ref={onEditorRef} />
      <Flex flex={1} className="text-cursor move-to-end" onClick={moveToEnd} />
    </EditorContainer>
  );
};
