import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { schema } from 'prosemirror-schema-basic';
import { EditorView } from 'prosemirror-view';
import { Transaction } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';
import { Button, Flex, Text, Avatar } from '@holium/design-system';
import {
  Clickable,
  useShips,
  useTransactions,
} from '@holium/realm-presence';
import { Loader } from './components/Loader';
import { Authority } from './components/Authority';
import {
  applyAndSendTransaction,
  collabEditor,
} from './components/CollabEditor';

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

const Editor = styled.div`
  width: 100%;
  max-width: 600px;
  height: auto;
  flex: 1;
  padding: 24px 0;
  color: #c8d1d9;
  border: 1px solid #30363c;
  background-color: #0e1117;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas,
    Liberation Mono, monospace;
  font-size: 12px;
  border-radius: 4px;
  overflow-y: auto;
  .ProseMirror {
    outline: none;
    line-height: 1.5em;
  }
  p {
    padding: 0 20px;
  }
  .current-element {
    background-color: #30363c;
  }
`;

const Footer = styled(Flex)`
  width: 100%;
  padding: 16px;
  gap: 16px;
  justify-content: flex-end;
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
    const parsedSteps = serializedSteps.map((s: any) =>
      Step.fromJSON(schema, s)
    );
    authority.receiveSteps(version, parsedSteps, clientID);
  };

  const ships = useShips();
  const { sendTransaction } = useTransactions({ onTransaction });

  const helloWorld = () => {
    if (!editorView || !authority) return;

    const transaction: Transaction =
      editorView.state.tr.insertText('Hello world!');

    applyAndSendTransaction(
      editorView,
      authority,
      transaction,
      sendTransaction
    );
  };

  const onClear = () => {
    if (!editorView || !authority) return;

    const transaction: Transaction = editorView.state.tr.delete(
      0,
      editorView.state.doc.nodeSize - 2
    );

    applyAndSendTransaction(
      editorView,
      authority,
      transaction,
      sendTransaction
    );
  };

  const onEditorRef = useCallback((ref: HTMLDivElement) => {
    if (!ref) return;

    const newAuthority = new Authority(
      schema.node(
        'doc',
        null,
        schema.node('paragraph', null, schema.text('Ha'))
      )
    );
    const newEditor = collabEditor(newAuthority, ref, sendTransaction);

    setEditorView(newEditor);
    setAuthority(newAuthority);
  }, []);

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
              // sigilColor={[sigilColor || '#000000', 'white']}
              sigilColor={['#000000', 'white']}
            />
          ))}
        </Flex>
      </Header>
      <Editor ref={onEditorRef} />
      <Footer>
        <Clickable id="clear" onClick={onClear} onOtherClick={onClear}>
          <Button.Secondary height={32} px={2} fontSize="16px">
            Clear
          </Button.Secondary>
        </Clickable>
        <Clickable id="fill" onClick={helloWorld} onOtherClick={helloWorld}>
          <Button.Primary height={32} px={2} fontSize="16px">
            Save
          </Button.Primary>
        </Clickable>
      </Footer>
    </Flex>
  );
};
