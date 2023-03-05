import { useEffect, useState } from 'react';
import { schema } from 'prosemirror-schema-basic';
import { Button, Flex, Text, Box } from '@holium/design-system';
import { Clickable, useShips } from '@holium/realm-presence';
import { Loader } from './components/Loader';
import { Authority } from './components/Authority';
import { collabEditor } from './components/CollabEditor';

const defaultTitle = 'Real-time notetaking, in 3 lines of JS';

export const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const ships = useShips();

  const onClear = () => setTitle('');

  const onFill = () => setTitle(defaultTitle);

  const onEditorRef = (ref: HTMLDivElement) => {
    if (!ref) return;

    const authority = new Authority(
      schema.node(
        'doc',
        null,
        schema.node('paragraph', null, schema.text('Hello world!'))
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
      alignItems="center"
      justifyContent="center"
      padding="12px"
    >
      <Flex flexDirection="column" width="100%" maxWidth="600px" gap="24px">
        <Flex
          width="100%"
          py="8px"
          alignItems="center"
          justifyContent="space-between"
          borderBottom="1px solid #000"
        >
          <Text.H3>{title}</Text.H3>
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
        </Flex>
        <div
          ref={onEditorRef}
          style={{
            padding: '8px',
            border: '1px solid #000',
          }}
        />
        <Flex gap="16px" justifyContent="flex-end">
          <Clickable id="clear" onClick={onClear} onOtherClick={onClear}>
            <Button.Secondary height={32} px={2} fontSize="16px">
              Clear
            </Button.Secondary>
          </Clickable>
          <Clickable id="fill" onClick={onFill} onOtherClick={onFill}>
            <Button.Primary height={32} px={2} fontSize="16px">
              Fill
            </Button.Primary>
          </Clickable>
        </Flex>
      </Flex>
    </Flex>
  );
};
