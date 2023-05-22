import { useState } from 'react';
import { isValidPatp } from 'urbit-ob';

import { Button, Flex, Icon, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

type Props = {
  blocked: string[];
  onChange: (action: 'add' | 'remove', patp: string) => void;
};
export const BlockedInput = ({ blocked, onChange }: Props) => {
  const [input, setInput] = useState('');

  function block() {
    if (isValidPatp(input)) {
      onChange('add', input);
      setInput('');
    }
  }

  return (
    <Flex flexDirection="column" gap="10px">
      <TextInput
        id="blocked-input"
        name="blocked-input"
        spellCheck={false}
        placeholder="~tasdul-tasdul"
        value={input}
        onChange={(e) => setInput((e.target as HTMLInputElement).value)}
        rightAdornment={
          <Button.TextButton
            disabled={!isValidPatp(input)}
            fontWeight={500}
            color="intent-alert"
            onClick={block}
          >
            Block
          </Button.TextButton>
        }
      />
      {blocked.length > 0 && (
        <Flex flexDirection="column" gap="6px">
          {blocked.map((patp) => (
            <Flex
              key={patp}
              width="100%"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text.Body>{patp}</Text.Body>
              <Button.IconButton onClick={() => onChange('remove', patp)}>
                <Icon name="Close" size={15} opacity={0.7} />
              </Button.IconButton>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
