import { ChangeEvent, useState } from 'react';
import { isValidPatp } from 'urbit-ob';

import {
  Button,
  Flex,
  Icon,
  NoScrollBar,
  Text,
} from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

type Props = {
  blocked: string[];
  onChange: any;
};
export const BlockedInput = ({ blocked, onChange }: Props) => {
  const [input, setInput] = useState('');
  // const blockButtonColor = baseTheme.colors.text.error;

  function block() {
    if (isValidPatp(input)) {
      onChange('add', input);
      setInput('');
    }
  }

  return (
    <Flex flexDirection="column">
      <Flex display="inline-block" mb={1} position="relative">
        <TextInput
          id="blocked-input"
          name="blocked-input"
          pr="36px"
          spellCheck={false}
          placeholder="~tasdul-tasdul"
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
          rightAdornment={
            <Button.TextButton
              // position="absolute"
              // top="9px"
              // right="12px"
              disabled={!isValidPatp(input)}
              fontWeight={500}
              color="intent-alert"
              // highlightColor={blockButtonColor}
              // color={blockButtonColor}
              onClick={block}
            >
              Block
            </Button.TextButton>
          }
        />
      </Flex>
      {blocked.length > 0 && (
        <NoScrollBar
          height="70px"
          width="100%"
          flexDirection="column"
          margin="auto"
          overflow="auto"
        >
          {blocked.map((patp) => (
            <Flex
              width="100%"
              alignItems="center"
              justifyContent="space-between"
              key={patp}
            >
              <Text.Body>{patp}</Text.Body>
              <Button.IconButton onClick={() => onChange('remove', patp)}>
                <Icon name="Close" size={15} opacity={0.7} />
              </Button.IconButton>
            </Flex>
          ))}
        </NoScrollBar>
      )}
      {blocked.length > 3 && (
        <Flex pt={1} width="100%" justifyContent="center">
          <Icon name="ChevronDown" size={16} />
        </Flex>
      )}
    </Flex>
  );
};
