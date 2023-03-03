import { useEffect, useState } from 'react';
import { Button, Flex, Text, TextArea } from '@holium/design-system';
import { Clickable } from '@holium/realm-multiplayer';
import { Loader } from './components/Loader';

export const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [content, setContent] = useState('');

  const onClear = () => setContent('');

  const onFill = () => setContent('Urbit is an OS for the 21st century.');

  useEffect(() => {
    // Poll until window.ship is set.
    const interval = setInterval(() => {
      // @ts-ignore
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
    >
      <Flex
        alignItems="center"
        flexDirection="column"
        width="100%"
        maxWidth="600px"
        gap="24px"
        padding="24px"
      >
        <Text.H1>Real-time notetaking, in 3 lines of JS</Text.H1>
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            fontSize: '16px',
            padding: '8px',
            minHeight: '200px',
          }}
        />
        <Flex gap="16px">
          <Clickable id="clear" onClick={onClear} onOtherClick={onClear}>
            <Button.Secondary height={32} px={2} fontSize="16px">
              Clear
            </Button.Secondary>
          </Clickable>
          <Clickable id="fill" onOtherClick={onFill} onClick={onFill}>
            <Button.Primary height={32} px={2} fontSize="16px">
              Fill
            </Button.Primary>
          </Clickable>
        </Flex>
      </Flex>
    </Flex>
  );
};
