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
  background-color: white;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.06);
`;

const Paper = styled.div`
  height: auto;
  padding: 38px 32px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.06);
  .ProseMirror {
    outline: none;
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
      background="#f5f5f5"
    >
      <Header>
        <Text.H5 fontWeight={600}>Writing with the boys</Text.H5>
        <Flex gap={8}>
          {ships.map((ship) => (
            <Avatar
              simple={false}
              size={24}
              // avatar={avatar}
              patp={ship}
              // sigilColor={[sigilColor || '#000000', 'white']}
              sigilColor={['#000000', 'white']}
              borderRadiusOverride="6px"
            />
          ))}
        </Flex>
      </Header>
      <Flex
        flexDirection="column"
        width="100%"
        maxWidth="600px"
        gap="24px"
        padding="16px"
        overflowY="auto"
      >
        <Paper ref={onEditorRef} />
      </Flex>
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
