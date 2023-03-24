import { useCallback, useEffect, useState } from 'react';
import { EditorView } from 'prosemirror-view';
import { TextSelection, Transaction } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';
import { Text, Flex } from '@holium/design-system';
import { useBroadcast } from '@holium/realm-presence';
import { schema } from './components/schema';
import { Loader } from './components/Loader';
import { Authority } from './components/Authority';
import { collabEditor } from './components/CollabEditor';
import { hoonDoc } from './hoonExample';
import { Header, EditorContainer } from './App.styles';
import { CustomCaret } from './components/CustomCaret';

type Carets = Record<string, { x: number; y: number }>;

export type SendCaret = (patp: string, x: number, y: number) => void;

export type SendTransaction = (
  patp: string,
  version: number,
  serializedSteps: any,
  clientID: string | number
) => void;

const filePath = 'desks/courier/mar/graph/validator/dm.hoon';

export const App = () => {
  const [editorView, setEditorView] = useState<EditorView>();
  const [authority, setAuthority] = useState<Authority>();
  const [isReady, setIsReady] = useState(false);
  const [carets, setCarets] = useState<Carets>({});

  const onTransaction: SendTransaction = (
    _patp,
    version,
    serializedSteps,
    clientID
  ) => {
    if (!editorView || !authority) return;
    const parsedSteps = serializedSteps.map((s: Object) =>
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

  const onEditorRef = useCallback((ref: HTMLDivElement) => {
    if (!ref) return;

    const newAuthority = new Authority(hoonDoc);
    const newEditor = collabEditor(
      newAuthority,
      ref,
      sendTransaction,
      sendCaret
    );

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
        <Text.Label>{filePath}</Text.Label>
      </Header>
      <EditorContainer>
        <div ref={onEditorRef}>
          {Object.entries(carets).map(([patp, position]) => (
            <CustomCaret key={patp} top={position.y} left={position.x} />
          ))}
        </div>
        <Flex flex={1} onClick={moveToEnd} />
      </EditorContainer>
    </Flex>
  );
};
