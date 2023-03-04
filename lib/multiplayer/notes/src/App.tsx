import { useEffect, useState } from 'react';
import { Button, Flex, Text, TextArea, Box } from '@holium/design-system';
import { Clickable, useShips } from '@holium/realm-presence';
import { Loader } from './components/Loader';

export const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [content, setContent] = useState('');
  const ships = useShips();

  const onClear = () => setContent('');

  const onFill = () => setContent('Urbit is an OS for the 21st century.');

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
          <Text.H3>Real-time notetaking, in 3 lines of JS</Text.H3>
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
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            fontSize: '16px',
            padding: '8px',
            minHeight: '200px',
            border: '1px solid #000',
          }}
        />
        <Flex gap="16px" justifyContent="flex-end">
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
