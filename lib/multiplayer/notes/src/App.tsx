import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { schema } from 'prosemirror-schema-basic';
import { Button, Flex, Text, Box } from '@holium/design-system';
import { Clickable, useShips } from '@holium/realm-presence';
import { Loader } from './components/Loader';
import { Authority } from './components/Authority';
import { collabEditor } from './components/CollabEditor';

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

const initialBody = '\n\n\n\n\n\n\n\n\n\n\n\n';

export const App = () => {
  const [isReady, setIsReady] = useState(false);
  const ships = useShips();

  const onClear = () => {};

  const onSave = () => {};

  const onEditorRef = (ref: HTMLDivElement) => {
    if (!ref) return;

    const authority = new Authority(
      schema.node(
        'doc',
        null,
        schema.node('paragraph', null, schema.text(initialBody))
      )
    );

    collabEditor(authority, ref);
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
      background="#f5f5f5"
    >
      <Header>
        <Text.H5 fontWeight={600}>Writing with the boys</Text.H5>
        <Flex gap={8}>
          {ships.map((ship) => (
            <Box
              key={ship}
              width={24}
              height={24}
              borderRadius="50%"
              background="yellow"
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
        <Clickable id="fill" onClick={onSave} onOtherClick={onSave}>
          <Button.Primary height={32} px={2} fontSize="16px">
            Save
          </Button.Primary>
        </Clickable>
      </Footer>
    </Flex>
  );
};
