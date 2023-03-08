import { useCallback, useEffect, useState } from 'react';
import { EditorView } from 'prosemirror-view';
import { TextSelection, Transaction } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';
import { Flex, Avatar } from '@holium/design-system';
import { useShips, useTransactions } from '@holium/realm-presence';
import { schema } from './components/schema';
import { Loader } from './components/Loader';
import { Authority } from './components/Authority';
import { collabEditor } from './components/CollabEditor';
import { hoonDoc } from './hoonExample';
import { Header, EditorContainer } from './App.styles';

const filePath = 'desks/courier/mar/graph/validator/dm.hoon';

export const App = () => {
  const [editorView, setEditorView] = useState<EditorView>();
  const [authority, setAuthority] = useState<Authority>();
  const [isReady, setIsReady] = useState(false);

  const onTransaction = (
    _patp: string,
    version: number,
    serializedSteps: any,
    clientID: string | number
  ) => {
    if (!editorView || !authority) return;
    const parsedSteps = serializedSteps.map((s: Object) =>
      Step.fromJSON(schema, s)
    );
    authority.receiveSteps(version, parsedSteps, clientID);
  };

  const ships = useShips();
  const { sendTransaction } = useTransactions({ onTransaction });

  const onEditorRef = useCallback((ref: HTMLDivElement) => {
    if (!ref) return;

    const newAuthority = new Authority(hoonDoc);
    const newEditor = collabEditor(newAuthority, ref, sendTransaction);

    setEditorView(newEditor);
    setAuthority(newAuthority);
  }, []);

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

  useEffect(() => {
    // Poll until window.ship is set.
    const interval = setInterval(() => {
      if (window.ship) {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 100);
  }, []);

  if (!isReady) return <Loader text="Loading ship..." />;

  return (
    <Flex
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      background="#161B22"
    >
      <Header>
        <p>{filePath}</p>
        <Flex gap={8}>
          {ships.map((ship) => (
            <Avatar
              key={ship}
              simple={false}
              size={24}
              patp={ship}
              sigilColor={['#000000', 'white']}
            />
          ))}
        </Flex>
      </Header>
      <EditorContainer>
        <div ref={onEditorRef} />
        <Flex flex={1} onClick={moveToEnd} />
      </EditorContainer>
    </Flex>
  );
};
