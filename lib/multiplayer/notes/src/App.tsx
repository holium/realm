import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { EditorView } from 'prosemirror-view';
import { TextSelection, Transaction } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';
import { Flex, Text, Avatar } from '@holium/design-system';
import { useShips, useTransactions } from '@holium/realm-presence';
import { schema } from './components/schema';
import { Loader } from './components/Loader';
import { Authority } from './components/Authority';
import { collabEditor } from './components/CollabEditor';
import { hoonDoc } from './hoonExample';

const Header = styled(Flex)`
  width: 100%;
  padding: 16px;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  * {
    color: #8b949e;
  }
`;

const EditorContainer = styled(Flex)`
  flex: 1;
  flex-direction: column;
  width: 100%;
  color: #c8d1d9;
  border: 1px solid #30363c;
  background-color: #0e1117;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas,
    Liberation Mono, monospace;
  font-size: 12px;
  overflow-y: auto;
  counter-reset: line-counter;
  .ProseMirror {
    outline: none;
    line-height: 1.5em;
  }
  p::before {
    counter-increment: line-counter;
    content: counter(line-counter);
    display: inline-block;
    width: 60px;
    text-align: center;
    color: #8b949e;
    border-right: 1px solid #30363c;
  }
  .current-element {
    background-color: rgba(48, 54, 60, 0.5);
    &::before {
      color: #fff;
    }
  }
`;

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
        <Text.H5 fontWeight={600}>desks/courier/app/app.hoon</Text.H5>
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
